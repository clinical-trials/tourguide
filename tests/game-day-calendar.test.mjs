import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { buildCalendarFiles } from '../scripts/build-game-day-calendar.mjs';

test('calendar exports 38 tentative tour windows with stable IDs, not game durations', () => {
  const files = buildCalendarFiles();
  const ics = files['branch-b-warriors-2026-27.ics'];
  const unfolded = ics.replace(/\r\n /g, '');
  const events = unfolded.match(/BEGIN:VEVENT[\s\S]*?END:VEVENT/g);
  assert.equal(events.length, 38);
  assert.equal((ics.match(/STATUS:TENTATIVE/g) || []).length, 38);
  assert.equal(
    new Set(events.map((event) => event.match(/UID:(.*)/)[1])).size,
    38,
  );
  for (const line of ics.split('\r\n'))
    assert.ok(Buffer.byteLength(line) <= 75);
  assert.equal(ics.replace(/\r\n/g, '').includes('\n'), false);
  const final = events.at(-1);
  assert.ok(final.includes('DTSTART:20270411T200000Z'));
  assert.ok(final.includes('DTEND:20270411T233000Z'));
  assert.ok(final.includes('NOT A RESERVATION'));
  assert.ok(final.includes('Game tipoff: 5:30 PM Pacific'));
  assert.ok(!unfolded.includes('warriors-20261102-branch-b'));
  const early = events.find((event) =>
    event.includes('warriors-20270130-branch-b'),
  );
  assert.ok(early.includes('DTSTART:20270130T180000Z'));
  assert.ok(early.includes('DTEND:20270130T213000Z'));
  const csv = files['branch-b-warriors-2026-27.csv'];
  assert.equal(csv.trim().split('\r\n').length, 39);
  assert.ok(csv.includes('"2027-04-11","Jazz","1:00 PM","4:30 PM","5:30 PM"'));
});

test('published downloads stay in sync with the shared tour schedule', () => {
  for (const [name, content] of Object.entries(buildCalendarFiles())) {
    assert.equal(
      readFileSync(
        new URL(`../public/calendars/${name}`, import.meta.url),
        'utf8',
      ),
      content,
    );
  }
});
