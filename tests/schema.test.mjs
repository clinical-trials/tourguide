import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync, readdirSync } from 'node:fs';
import { CLAIM_SQL } from '../lib/inventory.mjs';
test('generated production schema accepts seat claims and rejects duplicate Stripe session identities', () => {
  const db = new DatabaseSync(':memory:');
  const migrations = new URL('../drizzle/', import.meta.url);
  for (const file of readdirSync(migrations)
    .filter((file) => file.endsWith('.sql'))
    .sort())
    db.exec(readFileSync(new URL(file, migrations), 'utf8'));
  const stmt = db.prepare(CLAIM_SQL);
  assert.equal(
    stmt.run(
      'one',
      '2026-09-09',
      'A',
      2,
      1,
      47000,
      '{"taxTotal":0}',
      1,
      '2026-09-09',
      'A',
      2,
      8,
    ).changes,
    1,
  );
  assert.equal(
    db.prepare('SELECT age_confirmed FROM bookings').get().age_confirmed,
    1,
  );
  assert.equal(
    db.prepare('SELECT pricing_snapshot FROM bookings').get().pricing_snapshot,
    '{"taxTotal":0}',
  );
  stmt.run(
    'two',
    '2026-09-09',
    'B',
    1,
    0,
    19500,
    null,
    1,
    '2026-09-09',
    'B',
    1,
    8,
  );
  db.prepare('UPDATE bookings SET stripe_session=? WHERE id=?').run(
    'cs_example',
    'one',
  );
  assert.throws(() =>
    db
      .prepare('UPDATE bookings SET stripe_session=? WHERE id=?')
      .run('cs_example', 'two'),
  );
  db.close();
});
