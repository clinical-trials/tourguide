import { getDb } from '@/db';
import { settings, ready, json, reconcileHolds } from '@/lib/server';
import { validateBooking, PARTS, CAPACITY } from '@/lib/booking.mjs';
import { CLAIM_SQL } from '@/lib/inventory.mjs';
import { stripeRequest } from '@/lib/stripe.mjs';
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
    booking = validateBooking(await req.json());
  } catch (e) {
    return json(
      { error: e instanceof Error ? e.message : 'Invalid booking.' },
      400,
    );
  }
  const c = settings(),
    db = getDb(),
    id = crypto.randomUUID();
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
    cancel_url: `${c.siteUrl}/?checkout=cancelled#book`,
    'payment_method_types[0]': 'card',
    expires_at: String(Math.floor(Date.now() / 1000) + 2100),
    client_reference_id: id,
    'metadata[booking_id]': id,
    'metadata[tour_date]': booking.date,
    'metadata[part]': booking.part,
    'metadata[age_confirmed]': 'true',
    'payment_intent_data[metadata][booking_id]': id,
    'line_items[0][price_data][currency]': 'usd',
    'line_items[0][price_data][unit_amount]': String(
      booking.tour / booking.guests,
    ),
    'line_items[0][price_data][product_data][name]': `AI SF Tour — ${PARTS[booking.part].label}`,
    'line_items[0][price_data][product_data][description]': `${booking.date} · ${PARTS[booking.part].time} Pacific · Ages 16+ · Meet: ${c.meeting}`,
    'line_items[0][quantity]': String(booking.guests),
    'custom_text[submit][message]': `Ages 16+. ${c.policy}`.slice(0, 1200),
  });
  if (booking.returnToWharf) {
    params.set('line_items[1][price_data][currency]', 'usd');
    params.set(
      'line_items[1][price_data][unit_amount]',
      String(booking.return / booking.guests),
    );
    params.set(
      'line_items[1][price_data][product_data][name]',
      'Guided Muni return to Fisherman’s Wharf',
    );
    params.set('line_items[1][quantity]', String(booking.guests));
  }
  try {
    const session = await stripeRequest(
      c.stripeKey,
      'checkout/sessions',
      params,
      id,
    );
    if (!session.url || !session.id)
      throw new Error('Checkout did not return a payment page.');
    await db
      .prepare('UPDATE bookings SET stripe_session=? WHERE id=?')
      .bind(session.id, id)
      .run();
    return json({ url: session.url });
  } catch (e) {
    if ((e as { definitive?: boolean }).definitive)
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
