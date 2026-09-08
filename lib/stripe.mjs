/** @param {string} body @param {string|null} signature @param {string} secret @param {number} [now] */
export async function verifySignature(
  body,
  signature,
  secret,
  now = Math.floor(Date.now() / 1000),
) {
  if (!signature || !secret) return false;
  const entries = signature.split(',').map((x) => x.split('='));
  const t = Number(entries.find((x) => x[0] === 't')?.[1]);
  if (!Number.isFinite(t) || Math.abs(now - t) > 300) return false;
  const signatures = entries.filter((x) => x[0] === 'v1').map((x) => x[1]);
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify'],
  );
  for (const sig of signatures) {
    if (!/^[a-f0-9]{64}$/.test(sig)) continue;
    const bytes = new Uint8Array(sig.match(/../g).map((x) => parseInt(x, 16)));
    if (
      await crypto.subtle.verify(
        'HMAC',
        key,
        bytes,
        new TextEncoder().encode(`${t}.${body}`),
      )
    )
      return true;
  }
  return false;
}
/** @param {any} session @param {any} booking */
export function validatePaidSession(session, booking) {
  return Boolean(
    booking &&
    session?.payment_status === 'paid' &&
    session.currency === 'usd' &&
    session.amount_total === booking.total &&
    session.metadata?.booking_id === booking.id &&
    (!booking.stripe_session || session.id === booking.stripe_session),
  );
}
/** @param {string} key @param {string} path @param {URLSearchParams} [body] @param {string} [idempotency] */
export async function stripeRequest(key, path, body, idempotency) {
  const headers = {
    Authorization: `Bearer ${key}`,
    ...(body ? { 'Content-Type': 'application/x-www-form-urlencoded' } : {}),
    ...(idempotency ? { 'Idempotency-Key': idempotency } : {}),
  };
  const res = await fetch(`https://api.stripe.com/v1/${path}`, {
    method: body ? 'POST' : 'GET',
    headers,
    body,
    signal: AbortSignal.timeout(15000),
  });
  const data = await res.json();
  if (!res.ok) {
    const error = new Error(
      'The payment provider could not start checkout. Please try again.',
    );
    Object.assign(error, { definitive: res.status >= 400 && res.status < 500 });
    throw error;
  }
  return data;
}
