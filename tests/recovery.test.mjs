import { test } from 'node:test';
import assert from 'node:assert/strict';
import { locateSession } from '../lib/recovery.mjs';
const b = { id: 'b1', created_at: 1800000000000, stripe_session: null };
test('orphan absence is authoritative only after all provider pages have been read', async () => {
  const urls = [];
  const fetchPage = async (key, url) => {
    urls.push(url);
    return urls.length === 1
      ? { data: [{ id: 'cs_other', metadata: {} }], has_more: true }
      : { data: [], has_more: false };
  };
  assert.deepEqual(await locateSession('test', b, fetchPage), {
    complete: true,
    session: null,
  });
  assert.match(urls[1], /starting_after=cs_other/);
  assert.match(urls[0], /created%5Bgte%5D=/);
});
test('recovery preserves matching paid sessions and fails closed on incomplete provider history', async () => {
  const paid = {
    id: 'cs_found',
    payment_status: 'paid',
    metadata: { booking_id: 'b1' },
  };
  assert.equal(
    (
      await locateSession('test', b, async () => ({
        data: [paid],
        has_more: false,
      }))
    ).session,
    paid,
  );
  assert.equal(
    (
      await locateSession('test', b, async () => ({
        data: [{ id: 'cs_other', metadata: {} }],
        has_more: true,
      }))
    ).complete,
    false,
  );
  await assert.rejects(() =>
    locateSession('test', b, async () => {
      throw new Error('network');
    }),
  );
});
