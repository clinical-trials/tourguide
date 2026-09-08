import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import { CLAIM_SQL } from '../lib/inventory.mjs';
test('generated production schema accepts seat claims and rejects duplicate Stripe session identities', () => {
  const db = new DatabaseSync(':memory:');
  db.exec(
    readFileSync(
      new URL('../drizzle/0000_fat_joshua_kane.sql', import.meta.url),
      'utf8',
    ),
  );
  const stmt = db.prepare(CLAIM_SQL);
  assert.equal(
    stmt.run('one', '2026-09-09', 'A', 2, 1, 43000, 1, '2026-09-09', 'A', 2, 8)
      .changes,
    1,
  );
  assert.equal(
    db.prepare('SELECT age_confirmed FROM bookings').get().age_confirmed,
    1,
  );
  stmt.run('two', '2026-09-09', 'B', 1, 0, 19500, 1, '2026-09-09', 'B', 1, 8);
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
