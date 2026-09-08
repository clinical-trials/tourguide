export const CAPACITY = 8;
export const LAUNCH_DATE = '2026-09-08';
export const PARTS = {
  A: {
    label: 'Part A · Old soul. New intelligence.',
    time: '8:30 AM–12:00 PM',
    hour: 8,
    minute: 30,
  },
  B: {
    label: 'Part B · Builders. Ballparks. Bay.',
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
/** @param {number} guests @param {boolean} back */
export function quote(guests, back) {
  if (
    !Number.isInteger(guests) ||
    guests < 1 ||
    guests > CAPACITY ||
    typeof back !== 'boolean'
  )
    throw new Error('Choose 1–8 guests and a valid return option.');
  return {
    tour: guests * 19500,
    return: back ? guests * 2000 : 0,
    total: guests * (19500 + (back ? 2000 : 0)),
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
