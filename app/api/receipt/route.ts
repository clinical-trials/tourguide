import { settings, json, confirmSession } from '@/lib/server';
import { stripeRequest } from '@/lib/stripe.mjs';
export async function GET(req: Request) {
  const c = settings(),
    id = new URL(req.url).searchParams.get('session_id');
  if (!c.stripeKey || !id || !/^cs_(test_|live_)?[A-Za-z0-9_]{10,}$/.test(id))
    return json({ error: 'No confirmed booking was found.' }, 400);
  try {
    const session = await stripeRequest(
      c.stripeKey,
      `checkout/sessions/${encodeURIComponent(id)}`,
    );
    const booking = await confirmSession(session);
    if (!booking)
      return json({
        status: session.status === 'expired' ? 'expired' : 'unconfirmed',
      });
    return json({
      status: booking.status,
      date: booking.tour_date,
      part: booking.part,
      guests: booking.guests,
      total: booking.total,
      returnToWharf: Boolean(booking.return_to_wharf),
      reference: booking.id.slice(0, 8).toUpperCase(),
      meeting: c.meeting,
      contact: c.contact,
    });
  } catch {
    return json(
      {
        error:
          'We could not verify your payment. Contact the tour operator before paying again.',
      },
      503,
    );
  }
}
