import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  validateBooking,
  departureInstant,
  quote,
  sfDate,
  canBook,
} from '../lib/booking.mjs';
const now = new Date('2026-09-08T15:00:00Z');
const valid = {
  date: '2026-09-09',
  part: 'A',
  guests: 2,
  returnToWharf: true,
  ageConfirmed: true,
};
test('calculate per-guest tour and return prices without trusting submitted totals', () => {
  assert.deepEqual(quote(2, true), { tour: 39000, return: 8000, total: 47000 });
  assert.deepEqual(quote(1, true), { tour: 19500, return: 4000, total: 23500 });
  assert.equal(quote(3, false).total, 58500);
  assert.equal(quote(8, true).total, 188000);
  assert.equal(validateBooking({ ...valid, total: 1 }, now).total, 47000);
});
test('reject nonoperating, impossible, past and far-future dates', () => {
  for (const date of ['2026-09-14', '2026-02-30', '2026-09-07', '2028-01-01'])
    assert.throws(() => validateBooking({ ...valid, date }, now));
  assert.equal(
    canBook('2026-09-08', 'A', new Date('2026-09-08T16:00:00Z')),
    false,
  );
  assert.equal(canBook('2026-09-08', 'B', now), true);
});
test('enforce age and bounded integer quantities', () => {
  for (const guests of [0, 9, 1.5, '2', null])
    assert.throws(() => validateBooking({ ...valid, guests }, now));
  for (const ageConfirmed of [false, 'true', undefined])
    assert.throws(() => validateBooking({ ...valid, ageConfirmed }, now));
  assert.throws(() => validateBooking({ ...valid, part: 'C' }, now));
  assert.throws(() =>
    validateBooking({ ...valid, returnToWharf: 'false' }, now),
  );
});
test('departure times and today use San Francisco time across DST', () => {
  assert.equal(
    departureInstant('2026-09-08', 'A').toISOString(),
    '2026-09-08T15:30:00.000Z',
  );
  assert.equal(
    departureInstant('2026-12-08', 'B').toISOString(),
    '2026-12-08T22:00:00.000Z',
  );
  assert.equal(sfDate(new Date('2026-09-09T02:00:00Z')), '2026-09-08');
});
