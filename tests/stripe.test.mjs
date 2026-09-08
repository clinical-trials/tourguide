import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { verifySignature, validatePaidSession } from '../lib/stripe.mjs';
test('only fresh signed Stripe payloads are accepted', async () => {
  const payload = '{"type":"checkout.session.completed"}',
    secret = 'whsec_test',
    now = 1800000000;
  const sig = (t) =>
    `t=${t},v1=${createHmac('sha256', secret).update(`${t}.${payload}`).digest('hex')}`;
  assert.equal(await verifySignature(payload, sig(now), secret, now), true);
  assert.equal(
    await verifySignature(payload + ' ', sig(now), secret, now),
    false,
  );
  assert.equal(
    await verifySignature(payload, sig(now - 301), secret, now),
    false,
  );
  assert.equal(await verifySignature(payload, 'bad', secret, now), false);
});
test('payment confirmation requires paid status, identity, currency and exact server total', () => {
  const b = { id: 'order1', stripe_session: 'cs_test', total: 43000 };
  const s = {
    id: 'cs_test',
    metadata: { booking_id: 'order1' },
    payment_status: 'paid',
    currency: 'usd',
    amount_total: 43000,
  };
  assert.equal(validatePaidSession(s, b), true);
  for (const changed of [
    { payment_status: 'unpaid' },
    { amount_total: 39000 },
    { currency: 'eur' },
    { metadata: { booking_id: 'other' } },
    { id: 'cs_other' },
  ])
    assert.equal(validatePaidSession({ ...s, ...changed }, b), false);
});

import { DatabaseSync } from 'node:sqlite';
import {
  CONFIRM_SQL,
  REFUND_INSERT_SQL,
  REFUND_UPDATE_SQL,
} from '../lib/inventory.mjs';
test('full refund survives refund-first and completion-first event order and replay', () => {
  for (const refundFirst of [true, false]) {
    const db = new DatabaseSync(':memory:');
    db.exec(
      "CREATE TABLE bookings(id TEXT PRIMARY KEY,status TEXT,stripe_session TEXT,payment_intent TEXT); CREATE TABLE full_refunds(payment_intent TEXT PRIMARY KEY); INSERT INTO bookings VALUES('order','held',NULL,NULL)",
    );
    const refund = () => {
      db.prepare(REFUND_INSERT_SQL).run('pi_1');
      db.prepare(REFUND_UPDATE_SQL).run('pi_1');
    };
    const paid = () =>
      db.prepare(CONFIRM_SQL).run('pi_1', 'cs_1', 'pi_1', 'order');
    if (refundFirst) {
      refund();
      paid();
    } else {
      paid();
      refund();
    }
    paid();
    refund();
    assert.equal(
      db.prepare('SELECT status FROM bookings').get().status,
      'refunded',
    );
    db.close();
  }
});
