import { test } from 'node:test';
import assert from 'node:assert/strict';
import { rolloutCandidates, tourWindow } from '../lib/basketball-rollout.mjs';

test('game-day tour lasts 3.5 hours and protects one hour before tipoff', () => {
  for (const tipoff of ['2026-10-10T17:30:00-07:00', '2026-11-07T17:30:00-08:00']) {
    const window = tourWindow(tipoff);
    assert.equal((window.end - window.start) / 60_000, 210);
    assert.equal((new Date(tipoff) - window.end) / 60_000, 60);
    assert.equal(window.start.toLocaleTimeString('en-US', {
      timeZone: 'America/Los_Angeles', hour: 'numeric', minute: '2-digit',
    }), '1:00 PM');
  }
});

test('rollout never suggests away, Monday, unconfirmed, unknown-time or departed tours', () => {
  const sample = { id: 'example', team: 'Warriors', opponent: 'Kings', phase: 'Preseason',
    home: true, confirmed: true, tipoff: '2026-10-10T17:30:00-07:00', source: '' };
  const games = [sample,
    {...sample, id:'away', home:false},
    {...sample, id:'conditional', confirmed:false},
    {...sample, id:'tbd', tipoff:null},
    {...sample, id:'invalid', tipoff:'unknown'},
    {...sample, id:'monday', tipoff:'2026-11-02T19:00:00-08:00'},
  ];
  assert.deepEqual(rolloutCandidates(new Date('2026-09-27T12:00:00Z'), games).map(g=>g.id), ['example']);
  assert.deepEqual(rolloutCandidates(new Date('2026-10-10T20:00:00Z'), [sample]), []);
  assert.equal(tourWindow(null), null);
});
