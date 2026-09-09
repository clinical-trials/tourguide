import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as booking from '../lib/booking.mjs';

test('checkout return restores trip choices without carrying consent or payment data', () => {
  const selection = {
    date: '2026-09-19', part: 'B', guests: 2, returnToWharf: true,
    ageConfirmed: true, quotedTotal: 1, email: 'guest@example.com',
  };
  const url = new URL(booking.checkoutCancelUrl('https://example.com/', selection));
  assert.equal(url.origin, 'https://example.com');
  assert.equal(url.pathname, '/');
  assert.equal(url.hash, '#book');
  assert.deepEqual(Object.fromEntries(url.searchParams), {
    checkout: 'cancelled', date: '2026-09-19', part: 'B', guests: '2', return: '1',
  });
  const restored = booking.readBookingSelection(url.search);
  assert.deepEqual(restored, {
    date: '2026-09-19', part: 'B', guests: 2, returnToWharf: true,
  });
  assert.equal(booking.quote(restored.guests, restored.returnToWharf).subtotal, 47000);
  assert.throws(() => booking.validateBooking(restored, new Date('2026-09-09T14:00:00Z')));
});

test('selection links accept only supported branches, real dates and bounded quantities', () => {
  assert.deepEqual(booking.readBookingSelection('?part=A'), { part: 'A' });
  assert.deepEqual(booking.readBookingSelection('?part=C&date=2026-02-30&guests=9&return=true'), {});
  for (const guests of ['0', '-1', '1.5', '2e0', '', '02']) {
    assert.deepEqual(booking.readBookingSelection(`?guests=${guests}`), {});
  }
  assert.deepEqual(booking.readBookingSelection('?guests=8&return=0'), { guests: 8, returnToWharf: false });
  assert.deepEqual(booking.readBookingSelection('?part=A&part=B&guests=1&guests=2&return=0&return=1&date=2026-09-19&date=2026-09-20'), {});
  assert.deepEqual(booking.readBookingSelection('?ageConfirmed=true&paid=true&total=1&session_id=cs_fake'), {});
});

test('closed dates remain visible for correction and cannot bypass booking validation', () => {
  for (const date of ['2026-09-14', '2026-09-08', '2028-01-01']) {
    const selection = booking.readBookingSelection(`?date=${date}&part=A&guests=2&return=1`);
    assert.equal(selection.date, date);
    assert.throws(() => booking.validateBooking({ ...selection, ageConfirmed: true }, new Date('2026-09-09T14:00:00Z')));
  }
});
