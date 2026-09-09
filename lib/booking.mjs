export const CAPACITY = 8;
export const RETURN_PRICE_CENTS = 4000;
export const LAUNCH_DATE = '2026-09-08';
export const PARTS = {
  A: {
    label: 'Branch A · Old soul. New intelligence.',
    time: '8:30 AM–12:00 PM',
    hour: 8,
    minute: 30,
  },
  B: {
    label: 'Branch B · Builders. Ballers. & the Bay.',
    time: '2:00–5:30 PM',
    hour: 14,
    minute: 0,
  },
};
/** @param {Date} [now] */
export function sfDate(now = new Date()) {
  const p = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Los_Angeles',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now);
  return `${p.find((x) => x.type === 'year').value}-${p.find((x) => x.type === 'month').value}-${p.find((x) => x.type === 'day').value}`;
}
/** @param {string} date */
export function validDate(date) {
  if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date))
    return false;
  const d = new Date(date + 'T12:00:00Z');
  return !Number.isNaN(+d) && d.toISOString().slice(0, 10) === date;
}
/**
 * A return link only stages choices. Availability, prices and consent are
 * checked again by the form and server; the link never proves payment.
 * @param {string} search
 * @returns {{date?: string, part?: 'A'|'B', guests?: number, returnToWharf?: boolean}}
 */
export function readBookingSelection(search) {
  const params = new URLSearchParams(search);
  const single = (key) =>
    params.getAll(key).length === 1 ? params.get(key) : null;
  const date = single('date'), part = single('part');
  const guests = single('guests'), back = single('return');
  return {
    ...(validDate(date) ? { date } : {}),
    ...(part === 'A' || part === 'B' ? { part } : {}),
    ...(guests && /^[1-8]$/.test(guests) ? { guests: Number(guests) } : {}),
    ...(back === '1' || back === '0' ? { returnToWharf: back === '1' } : {}),
  };
}
/**
 * @param {string} siteUrl Trusted operator-configured origin.
 * @param {{date:string,part:'A'|'B',guests:number,returnToWharf:boolean}} selection Validated booking.
 */
export function checkoutCancelUrl(siteUrl, selection) {
  const url = new URL('/', siteUrl);
  url.search = new URLSearchParams({
    checkout: 'cancelled',
    date: selection.date,
    part: selection.part,
    guests: String(selection.guests),
    return: selection.returnToWharf ? '1' : '0',
  }).toString();
  url.hash = 'book';
  return url.href;
}
/** @param {string} date @param {'A'|'B'} part */
export function departureInstant(date, part) {
  if (!validDate(date) || !PARTS[part])
    throw new Error('Choose a valid date and departure.');
  const offset = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Los_Angeles',
    timeZoneName: 'shortOffset',
  })
    .formatToParts(new Date(date + 'T12:00:00Z'))
    .find((p) => p.type === 'timeZoneName').value;
  const hours = Number(offset.replace('GMT', ''));
  return new Date(
    `${date}T${String(PARTS[part].hour).padStart(2, '0')}:${String(PARTS[part].minute).padStart(2, '0')}:00${hours < 0 ? '-' : '+'}${String(Math.abs(hours)).padStart(2, '0')}:00`,
  );
}
/** @param {string} date @param {'A'|'B'} part @param {Date} [now] */
export function canBook(date, part, now = new Date()) {
  if (
    !validDate(date) ||
    !PARTS[part] ||
    date < LAUNCH_DATE ||
    new Date(date + 'T12:00:00Z').getUTCDay() === 1
  )
    return false;
  const t = +departureInstant(date, part);
  return t >= +now + 60 * 60 * 1000 && t <= +now + 180 * 86400000;
}
/** @param {number} guests @param {boolean} back @param {import('./charge-policy.mjs').ChargePolicy} [policy] */
export function quote(guests, back, policy = CHARGE_POLICY) {
  if (
    !Number.isInteger(guests) ||
    guests < 1 ||
    guests > CAPACITY ||
    typeof back !== 'boolean'
  )
    throw new Error('Choose 1–8 guests and a valid return option.');
  validateChargePolicy(policy);
  const tour = guests * 19500;
  const returnPrice = back ? guests * RETURN_PRICE_CENTS : 0;
  const feeLines = policy.governmentFees
    .filter((fee) => fee.appliesTo !== 'return' || back)
    .map((fee) => ({
      id: fee.id,
      label: fee.label,
      unitAmount: fee.amountCents,
      quantity: fee.per === 'guest' ? guests : 1,
    }));
  const lines = [
    { id: 'tour', label: 'AI SF Tour', unitAmount: 19500, quantity: guests },
    ...(back
      ? [
          {
            id: 'return',
            label: 'Guided Muni return to Fisherman’s Wharf',
            unitAmount: RETURN_PRICE_CENTS,
            quantity: guests,
          },
        ]
      : []),
    ...feeLines,
  ].map((line) => ({
    ...line,
    taxes: policy.taxes
      .filter((tax) => tax.appliesTo.includes(line.id))
      .map((tax) => ({
        id: tax.id,
        label: tax.label,
        percentage: tax.percentage,
        // Round each extended line to cents using an integer percentage scale.
        amount: Math.floor(
          (line.unitAmount *
            line.quantity *
            Math.round(tax.percentage * 10000) +
            500000) /
            1000000,
        ),
      })),
  }));
  const taxes = policy.taxes
    .map((tax) => ({
      id: tax.id,
      label: tax.label,
      percentage: tax.percentage,
      amount: lines.reduce(
        (sum, line) =>
          sum + (line.taxes.find((t) => t.id === tax.id)?.amount || 0),
        0,
      ),
    }))
    .filter((tax) =>
      lines.some((line) => line.taxes.some((t) => t.id === tax.id)),
    );
  const fees = feeLines.map((fee) => ({
    id: fee.id,
    label: fee.label,
    amount: fee.unitAmount * fee.quantity,
  }));
  const taxTotal = taxes.reduce((sum, tax) => sum + tax.amount, 0);
  const governmentFeeTotal = fees.reduce((sum, fee) => sum + fee.amount, 0);
  return {
    tour,
    return: returnPrice,
    subtotal: tour + returnPrice,
    taxTotal,
    governmentFeeTotal,
    taxes,
    fees,
    lines,
    chargesReviewed: policy.reviewed,
    total: tour + returnPrice + taxTotal + governmentFeeTotal,
  };
}
/** @param {{date:string,part:'A'|'B',guests:number,returnToWharf:boolean,ageConfirmed:boolean}} input @param {Date} [now] */
export function validateBooking(input, now = new Date()) {
  if (!input || typeof input !== 'object')
    throw new Error('Choose your tour details.');
  if (input.ageConfirmed !== true)
    throw new Error('Confirm that you and every guest are above 15 years old.');
  const price = quote(input.guests, input.returnToWharf);
  if (!canBook(input.date, input.part, now))
    throw new Error(
      'This departure is not bookable. Choose Tuesday–Sunday, at least one hour ahead.',
    );
  return {
    date: input.date,
    part: input.part,
    guests: input.guests,
    returnToWharf: input.returnToWharf,
    ageConfirmed: true,
    ...price,
  };
}
import { CHARGE_POLICY, validateChargePolicy } from './charge-policy.mjs';
