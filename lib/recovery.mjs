import { stripeRequest } from './stripe.mjs';
/** Locate a possibly orphaned Session using a bounded, fully paginated provider query.
 * @param {string} key @param {any} booking @param {typeof stripeRequest} [provider] */
export async function locateSession(key, booking, provider = stripeRequest) {
  if (booking.stripe_session)
    return {
      complete: true,
      session: await provider(
        key,
        `checkout/sessions/${encodeURIComponent(booking.stripe_session)}`,
      ),
    };
  const params = new URLSearchParams({
    limit: '100',
    'created[gte]': String(Math.floor(booking.created_at / 1000) - 60),
    'created[lte]': String(Math.floor(booking.created_at / 1000) + 35 * 60),
  });
  for (let page = 0; page < 5; page++) {
    const result = await provider(key, `checkout/sessions?${params}`);
    if (!Array.isArray(result.data) || typeof result.has_more !== 'boolean')
      return { complete: false, session: null };
    const found = result.data.find(
      (s) => s.metadata?.booking_id === booking.id,
    );
    if (found) return { complete: true, session: found };
    if (!result.has_more) return { complete: true, session: null };
    const last = result.data.at(-1)?.id;
    if (!last) return { complete: false, session: null };
    params.set('starting_after', last);
  }
  return { complete: false, session: null };
}
