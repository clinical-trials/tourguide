import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { CLAIM_SQL, COUNT_SQL } from '../lib/inventory.mjs';
test('atomic seat claim prevents overselling, even when prior availability is stale', () => {
  const db = new DatabaseSync(':memory:');
  db.exec(
    'CREATE TABLE bookings(id TEXT PRIMARY KEY,tour_date TEXT,part TEXT,guests INTEGER,return_to_wharf INTEGER,total INTEGER,status TEXT,created_at INTEGER)',
  );
  const claim = db.prepare(CLAIM_SQL);
  const args = (id, n) => [
    id,
    '2026-09-09',
    'A',
    n,
    0,
    n * 19500,
    1,
    '2026-09-09',
    'A',
    n,
    8,
  ];
  assert.equal(claim.run(...args('one', 6)).changes, 1);
  assert.equal(claim.run(...args('two', 3)).changes, 0);
  assert.equal(claim.run(...args('three', 2)).changes, 1);
  db.prepare("UPDATE bookings SET status='paid' WHERE id='one'").run();
  assert.equal(claim.run(...args('four', 1)).changes, 0);
  db.prepare("UPDATE bookings SET status='expired' WHERE id='three'").run();
  assert.equal(claim.run(...args('five', 2)).changes, 1);
  assert.equal(db.prepare(COUNT_SQL).get('2026-09-09', 'A').used, 8);
  db.close();
});
