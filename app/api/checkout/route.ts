import { getDb } from '@/db';
import { settings, ready, json, reconcileHolds } from '@/lib/server';
import { validateBooking, PARTS, CAPACITY, checkoutCancelUrl } from '@/lib/booking.mjs';
import { CLAIM_SQL } from '@/lib/inventory.mjs';
import {
  stripeRequest,
  checkoutChargeParams,
  validateStripeTaxRate,
  validateCheckoutAmounts,
} from '@/lib/stripe.mjs';
import { CHARGE_POLICY } from '@/lib/charge-policy.mjs';
export async function POST(req: Request) {
  const origin = req.headers.get('origin');
  if (origin !== new URL(req.url).origin)
    return json({ error: 'Please start checkout from this website.' }, 403);
  if (!ready())
    return json(
      { error: 'Reservations are not open yet. No payment has been taken.' },
      503,
    );
  let booking;
  try {
    if (Number(req.headers.get('content-length') || 0) > 4096)
      return json({ error: 'Request too large.' }, 413);
    const input = (await req.json()) as { quotedTotal?: number };
    booking = validateBooking(input as Parameters<typeof validateBooking>[0]);
    if (input.quotedTotal !== booking.total)
      return json(
        {
          error:
            'The price has changed. Refresh this page and review the current total before paying.',
        },
        409,
      );
  } catch (e) {
    return json(
      { error: e instanceof Error ? e.message : 'Invalid booking.' },
      400,
    );
  }
  const c = settings(),
    db = getDb(),
    id = crypto.randomUUID();
  try {
    const rates = await Promise.all(
      CHARGE_POLICY.taxes.map(async (tax) => ({
        expected: tax,
        actual: await stripeRequest(
          c.stripeKey,
          `tax_rates/${encodeURIComponent(tax.id)}`,
        ),
      })),
    );
    if (
      rates.some(
        ({ actual, expected }) => !validateStripeTaxRate(actual, expected),
      )
    )
      throw new Error('Tax configuration mismatch');
  } catch {
    return json(
      {
        error:
          'Checkout charges could not be verified. Please contact the tour operator before paying.',
      },
      503,
    );
  }
  await reconcileHolds(booking.date);
  const hold = await db
    .prepare(CLAIM_SQL)
    .bind(
      id,
      booking.date,
      booking.part,
      booking.guests,
      Number(booking.returnToWharf),
      booking.total,
      JSON.stringify(booking),
      Date.now(),
      booking.date,
      booking.part,
      booking.guests,
      CAPACITY,
    )
    .run();
  if (!hold.meta.changes)
    return json(
      {
        error:
          'There are not enough places left. Choose another departure or fewer guests.',
      },
      409,
    );
  const params = new URLSearchParams({
    mode: 'payment',
    success_url: `${c.siteUrl}/confirmation?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: checkoutCancelUrl(c.siteUrl, booking),
    'payment_method_types[0]': 'card',
    expires_at: String(Math.floor(Date.now() / 1000) + 2100),
    client_reference_id: id,
    'metadata[booking_id]': id,
    'metadata[tour_date]': booking.date,
    'metadata[part]': booking.part,
    'metadata[age_confirmed]': 'true',
    'payment_intent_data[metadata][booking_id]': id,
    'custom_text[submit][message]': `Ages 16+. ${c.policy}`.slice(0, 1200),
  });
  for (const [key, value] of checkoutChargeParams(booking))
    params.set(key, value);
  params.set(
    'line_items[0][price_data][product_data][name]',
    `AI SF Tour — ${PARTS[booking.part].label}`,
  );
  params.set(
    'line_items[0][price_data][product_data][description]',
    `${booking.date} · ${PARTS[booking.part].time} Pacific · Ages 16+ · Meet: ${c.meeting}`,
  );
  let sessionCreated = false;
  try {
    const session = await stripeRequest(
      c.stripeKey,
      'checkout/sessions',
      params,
      id,
    );
    sessionCreated = true;
    if (!session.url || !session.id)
      throw new Error('Checkout did not return a payment page.');
    await db
      .prepare('UPDATE bookings SET stripe_session=? WHERE id=?')
      .bind(session.id, id)
      .run();
    if (!validateCheckoutAmounts(session, booking)) {
      // Never send a guest to a session whose Stripe total differs from their review.
      // Retain its inventory hold unless Stripe confirms expiration.
      const expired = await stripeRequest(
        c.stripeKey,
        `checkout/sessions/${encodeURIComponent(session.id)}/expire`,
        new URLSearchParams(),
      );
      if (expired.id !== session.id || expired.status !== 'expired')
        throw new Error('Checkout expiration could not be verified.');
      await db
        .prepare(
          "UPDATE bookings SET status='expired' WHERE id=? AND status='held'",
        )
        .bind(id)
        .run();
      return json(
        {
          error:
            'Checkout totals could not be verified. No payment has been taken. Please contact the tour operator.',
        },
        502,
      );
    }
    return json({ url: session.url });
  } catch (e) {
    if (!sessionCreated && (e as { definitive?: boolean }).definitive)
      await db
        .prepare(
          "UPDATE bookings SET status='failed' WHERE id=? AND status='held'",
        )
        .bind(id)
        .run();
    console.error('checkout_start_failed', { bookingId: id });
    return json(
      {
        error:
          'Checkout could not be opened. No booking is confirmed. Please contact the tour operator before retrying.',
      },
      502,
    );
  }
}
