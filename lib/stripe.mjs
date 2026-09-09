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
  if (booking?.pricing_snapshot) {
    try {
      if (
        !validateCheckoutAmounts(session, JSON.parse(booking.pricing_snapshot))
      )
        return false;
    } catch {
      return false;
    }
  }
  return Boolean(
    booking &&
    session?.payment_status === 'paid' &&
    session.currency === 'usd' &&
    session.amount_total === booking.total &&
    session.metadata?.booking_id === booking.id &&
    (!booking.stripe_session || session.id === booking.stripe_session),
  );
}

/** @param {ReturnType<import('./booking.mjs').quote>} price */
export function checkoutChargeParams(price) {
  const params = new URLSearchParams();
  price.lines.forEach((line, i) => {
    const prefix = `line_items[${i}]`;
    params.set(`${prefix}[price_data][currency]`, 'usd');
    params.set(`${prefix}[price_data][unit_amount]`, String(line.unitAmount));
    params.set(`${prefix}[price_data][tax_behavior]`, 'exclusive');
    params.set(`${prefix}[price_data][product_data][name]`, line.label);
    params.set(`${prefix}[quantity]`, String(line.quantity));
    line.taxes.forEach((tax, j) =>
      params.set(`${prefix}[tax_rates][${j}]`, tax.id),
    );
  });
  return params;
}

/** @param {any} actual @param {import('./charge-policy.mjs').TaxRate} expected */
export function validateStripeTaxRate(actual, expected) {
  return Boolean(
    actual &&
    actual.id === expected.id &&
    actual.active === true &&
    actual.inclusive === false &&
    actual.percentage === expected.percentage &&
    actual.display_name === expected.label &&
    actual.country === 'US' &&
    actual.state === 'CA',
  );
}

/** @param {any} session @param {any} price */
export function validateCheckoutAmounts(session, price) {
  return Boolean(
    price &&
    Number.isSafeInteger(price.total) &&
    Number.isSafeInteger(price.subtotal) &&
    Number.isSafeInteger(price.taxTotal) &&
    Number.isSafeInteger(price.governmentFeeTotal) &&
    price.subtotal >= 0 &&
    price.taxTotal >= 0 &&
    price.governmentFeeTotal >= 0 &&
    price.total ===
      price.subtotal + price.taxTotal + price.governmentFeeTotal &&
    session?.currency === 'usd' &&
    session.amount_total === price.total &&
    session.amount_subtotal === price.subtotal + price.governmentFeeTotal &&
    session.total_details?.amount_tax === price.taxTotal &&
    session.total_details?.amount_discount === 0 &&
    session.total_details?.amount_shipping === 0,
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
