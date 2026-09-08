import { getDb } from '@/db';
import { settings, json, confirmSession } from '@/lib/server';
import { verifySignature } from '@/lib/stripe.mjs';
import { REFUND_INSERT_SQL, REFUND_UPDATE_SQL } from '@/lib/inventory.mjs';
export async function POST(req: Request) {
  const c = settings();
  if (!c.webhookSecret) return json({ error: 'Unavailable' }, 503);
  const body = await req.text();
  if (
    !(await verifySignature(
      body,
      req.headers.get('stripe-signature'),
      c.webhookSecret,
    ))
  )
    return json({ error: 'Invalid signature' }, 400);
  try {
    const event = JSON.parse(body),
      s = event.data?.object;
    switch (event.type) {
      case 'checkout.session.completed':
      case 'checkout.session.async_payment_succeeded':
        if (s.payment_status === 'paid' && !(await confirmSession(s)))
          return json({ error: 'Payment could not be matched' }, 409);
        break;
      case 'checkout.session.expired':
      case 'checkout.session.async_payment_failed':
        await getDb()
          .prepare(
            "UPDATE bookings SET status='expired' WHERE id=? AND (stripe_session=? OR stripe_session IS NULL) AND status='held'",
          )
          .bind(s.metadata?.booking_id || '', s.id)
          .run();
        break;
      case 'charge.refunded':
        if (
          s.refunded === true &&
          s.amount_refunded === s.amount &&
          typeof s.payment_intent === 'string'
        ) {
          const db = getDb();
          await db.batch([
            db.prepare(REFUND_INSERT_SQL).bind(s.payment_intent),
            db.prepare(REFUND_UPDATE_SQL).bind(s.payment_intent),
          ]);
        }
        break;
    }
    return json({ received: true });
  } catch {
    console.error('stripe_webhook_processing_failed');
    return json({ error: 'Unable to process event' }, 500);
  }
}
