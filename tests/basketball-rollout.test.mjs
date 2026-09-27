import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  ROLLOUT_GAMES,
  rolloutCandidates,
  tourWindow,
} from '../lib/basketball-rollout.mjs';

test('game-day tour lasts 3.5 hours and protects one hour before tipoff', () => {
  for (const tipoff of [
    '2026-10-10T17:30:00-07:00',
    '2026-11-07T17:30:00-08:00',
  ]) {
    const window = tourWindow(tipoff);
    assert.equal((window.end - window.start) / 60_000, 210);
    assert.equal((new Date(tipoff) - window.end) / 60_000, 60);
    assert.equal(
      window.start.toLocaleTimeString('en-US', {
        timeZone: 'America/Los_Angeles',
        hour: 'numeric',
        minute: '2-digit',
      }),
      '1:00 PM',
    );
  }
});

test('rollout never suggests away, Monday, unconfirmed, unknown-time or departed tours', () => {
  const sample = {
    id: 'example',
    team: 'Warriors',
    opponent: 'Kings',
    phase: 'Preseason',
    home: true,
    confirmed: true,
    tipoff: '2026-10-10T17:30:00-07:00',
    source: '',
  };
  const games = [
    sample,
    { ...sample, id: 'away', home: false },
    { ...sample, id: 'conditional', confirmed: false },
    { ...sample, id: 'tbd', tipoff: null },
    { ...sample, id: 'invalid', tipoff: 'unknown' },
    { ...sample, id: 'monday', tipoff: '2026-11-02T19:00:00-08:00' },
  ];
  assert.deepEqual(
    rolloutCandidates(new Date('2026-09-27T12:00:00Z'), games).map((g) => g.id),
    ['example'],
  );
  assert.deepEqual(
    rolloutCandidates(new Date('2026-10-10T20:00:00Z'), [sample]),
    [],
  );
  assert.equal(tourWindow(null), null);
});

test('season covers published home games through April 11 with five Monday exclusions', () => {
  const candidates = rolloutCandidates(new Date('2026-09-27T12:00:00Z'));
  assert.equal(ROLLOUT_GAMES.length, 43);
  assert.equal(candidates.length, 38);
  assert.equal(new Set(ROLLOUT_GAMES.map((game) => game.id)).size, 43);
  assert.deepEqual(
    ROLLOUT_GAMES.filter(
      (game) => !candidates.some((c) => c.id === game.id),
    ).map((game) => game.tipoff.slice(0, 10)),
    ['2026-11-02', '2026-11-09', '2027-02-01', '2027-02-15', '2027-03-22'],
  );
  assert.equal(candidates.at(-1).opponent, 'Jazz');
  assert.equal(
    candidates.at(-1).start.toISOString(),
    '2027-04-11T20:00:00.000Z',
  );
  assert.deepEqual(rolloutCandidates(new Date('2027-04-12T00:00:00Z')), []);
});

test('early tipoff and winter/spring transitions preserve the local tour windows', () => {
  const expected = [
    ['2026-11-01', '2026-11-01T21:00:00.000Z'],
    ['2027-01-30', '2027-01-30T18:00:00.000Z'],
    ['2027-03-09', '2027-03-09T23:30:00.000Z'],
    ['2027-03-16', '2027-03-16T21:30:00.000Z'],
  ];
  for (const [date, start] of expected) {
    const game = ROLLOUT_GAMES.find((g) => g.tipoff.startsWith(date));
    assert.ok(game, `Missing published game ${date}`);
    assert.equal(tourWindow(game.tipoff).start.toISOString(), start);
  }
});
