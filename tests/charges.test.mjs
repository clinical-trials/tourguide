import { test } from 'node:test';
import assert from 'node:assert/strict';
import { quote, validateBooking } from '../lib/booking.mjs';
import * as stripe from '../lib/stripe.mjs';

// Synthetic rates exercise arithmetic; these are not San Francisco rates.
const policy = {
  reviewed: true,
  taxes: [
    {
      id: 'txr_fixture',
      label: 'Example tax',
      percentage: 8.125,
      appliesTo: ['tour', 'return'],
    },
  ],
  governmentFees: [
    {
      id: 'entry',
      label: 'Example government entry fee',
      amountCents: 250,
      per: 'guest',
      appliesTo: 'tour',
    },
  ],
};

test('itemize charges and round tax on each extended line, rather than each guest', () => {
  const price = quote(3, true, policy);
  // $585 tour -> $47.53 tax; $120 return -> $9.75 tax; $7.50 fee.
  assert.equal(price.taxTotal, 5728);
  assert.equal(price.governmentFeeTotal, 750);
  assert.equal(price.subtotal, 70500);
  assert.equal(price.total, 76978);
  assert.equal(price.taxes[0].amount, 5728);
  assert.equal(price.fees[0].amount, 750);
});

test('return-only charges apply only when the return is selected and booking fees do not multiply', () => {
  const p = {
    reviewed: true,
    taxes: [],
    governmentFees: [
      {
        id: 'returnfee',
        label: 'Example return fee',
        amountCents: 175,
        per: 'booking',
        appliesTo: 'return',
      },
    ],
  };
  assert.equal(quote(4, false, p).governmentFeeTotal, 0);
  assert.equal(quote(4, true, p).governmentFeeTotal, 175);
  assert.equal(quote(4, true, p).total, 94175);
});

test('only an explicitly taxable government fee contributes to its tax base', () => {
  const price = quote(3, true, {
    ...policy,
    taxes: [{ ...policy.taxes[0], appliesTo: ['entry'] }],
  });
  assert.equal(price.taxTotal, 61);
  assert.equal(price.total, 71311);
});

test('invalid or unreviewed configured charges cannot be silently applied', () => {
  for (const p of [
    { ...policy, reviewed: false },
    { ...policy, taxes: [{ ...policy.taxes[0], percentage: -1 }] },
    { ...policy, taxes: [{ ...policy.taxes[0], percentage: 8.12345 }] },
    { ...policy, taxes: [{ ...policy.taxes[0], appliesTo: ['unknown'] }] },
    { ...policy, taxes: [policy.taxes[0], policy.taxes[0]] },
    {
      ...policy,
      governmentFees: [{ ...policy.governmentFees[0], amountCents: 2.5 }],
    },
  ])
    assert.throws(() => quote(1, true, p));
});

test('a reviewed service with no applicable charges has a final zero-tax quote', () => {
  const p = quote(2, true, { reviewed: true, taxes: [], governmentFees: [] });
  assert.equal(p.taxTotal, 0);
  assert.equal(p.governmentFeeTotal, 0);
  assert.equal(p.total, 47000);
  assert.equal(p.chargesReviewed, true);
});

test('booking validation ignores customer-supplied tax, fee, and total amounts', () => {
  const b = validateBooking(
    {
      date: '2026-09-09',
      part: 'A',
      guests: 2,
      returnToWharf: true,
      ageConfirmed: true,
      total: 1,
      taxTotal: -5000,
      governmentFees: [{ amountCents: -5000 }],
    },
    new Date('2026-09-08T15:00:00Z'),
  );
  assert.equal(b.total, 47000);
  assert.equal(b.taxTotal, 0);
});

test('Stripe receives per-line tax rates and quantity-based government fees', () => {
  assert.equal(typeof stripe.checkoutChargeParams, 'function');
  const params = stripe.checkoutChargeParams(quote(3, true, policy));
  assert.equal(params.get('line_items[0][price_data][unit_amount]'), '19500');
  assert.equal(params.get('line_items[0][quantity]'), '3');
  assert.equal(params.get('line_items[0][tax_rates][0]'), 'txr_fixture');
  assert.equal(params.get('line_items[1][tax_rates][0]'), 'txr_fixture');
  assert.equal(params.get('line_items[2][price_data][unit_amount]'), '250');
  assert.equal(params.get('line_items[2][quantity]'), '3');
  assert.equal(params.has('line_items[2][tax_rates][0]'), false);
});

test('provider tax rates must match the reviewed local rate before checkout', () => {
  assert.equal(typeof stripe.validateStripeTaxRate, 'function');
  const rate = {
    id: 'txr_fixture',
    display_name: 'Example tax',
    percentage: 8.125,
    inclusive: false,
    active: true,
    country: 'US',
    state: 'CA',
  };
  assert.equal(stripe.validateStripeTaxRate(rate, policy.taxes[0]), true);
  for (const changes of [
    { percentage: 9 },
    { inclusive: true },
    { active: false },
    { id: 'txr_other' },
    { state: 'NY' },
    { display_name: 'Unexpected fee' },
  ]) {
    assert.equal(
      stripe.validateStripeTaxRate({ ...rate, ...changes }, policy.taxes[0]),
      false,
    );
  }
});

test('a Stripe amount or tax mismatch is rejected even if the grand total matches', () => {
  assert.equal(typeof stripe.validateCheckoutAmounts, 'function');
  const price = quote(3, true, policy);
  const session = {
    currency: 'usd',
    amount_subtotal: 71250,
    amount_total: 76978,
    total_details: { amount_tax: 5728, amount_discount: 0, amount_shipping: 0 },
  };
  assert.equal(stripe.validateCheckoutAmounts(session, price), true);
  for (const changes of [
    { amount_total: 76977 },
    { amount_subtotal: 70500 },
    { currency: 'eur' },
    {
      total_details: {
        amount_tax: 5000,
        amount_discount: 0,
        amount_shipping: 0,
      },
    },
    {
      total_details: {
        amount_tax: 5728,
        amount_discount: 100,
        amount_shipping: 100,
      },
    },
  ]) {
    assert.equal(
      stripe.validateCheckoutAmounts({ ...session, ...changes }, price),
      false,
    );
  }
});
