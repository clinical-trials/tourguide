import { test } from 'node:test';
import assert from 'node:assert/strict';
import { availabilityFor, gamesFor } from '../lib/tour-api.mjs';

test('static hosting provides a planning preview without requesting inventory', async () => {
  const availability = await availabilityFor('2026-09-20', {
    staticSite: true,
    request: () => {
      throw new Error('Static sites must not request inventory');
    },
  });
  assert.equal(availability.enabled, false);
  assert.deepEqual(availability.parts, [
    { part: 'A', remaining: null, bookable: false },
    { part: 'B', remaining: null, bookable: false },
  ]);
});

test('static schedule reads MLB directly and preserves game times and home/away status', async () => {
  let requested;
  const games = await gamesFor('2026-09-29', {
    staticSite: true,
    request: async (url) => {
      requested = url;
      return Response.json({
        dates: [
          {
            games: [
              {
                gamePk: 123,
                officialDate: '2026-09-29',
                gameDate: '2026-09-30T01:45:00Z',
                teams: {
                  away: {
                    team: { id: 119, name: 'Los Angeles Dodgers' },
                    score: 1,
                  },
                  home: {
                    team: { id: 137, name: 'San Francisco Giants' },
                    score: 2,
                  },
                },
                venue: { name: 'Oracle Park' },
                status: { detailedState: 'Final' },
              },
            ],
          },
        ],
      });
    },
  });
  assert.equal(
    requested,
    'https://statsapi.mlb.com/api/v1/schedule?sportId=1&teamId=137&startDate=2026-09-29&endDate=2026-10-13',
  );
  assert.deepEqual(games, [
    {
      id: 123,
      date: '2026-09-29',
      start: '2026-09-30T01:45:00Z',
      away: 'Los Angeles Dodgers',
      home: 'San Francisco Giants',
      isHome: true,
      venue: 'Oracle Park',
      status: 'Final',
      timeTBD: false,
      awayScore: 1,
      homeScore: 2,
    },
  ]);
});

test('unavailable schedules give visitors a useful official-schedule fallback', async () => {
  await assert.rejects(
    gamesFor('2026-09-29', {
      staticSite: true,
      request: async () => new Response('', { status: 503 }),
    }),
    /official Giants schedule/,
  );
});

test('server hosting still uses its booking backend', async () => {
  let requested;
  const availability = await availabilityFor('2026-09-20', {
    staticSite: false,
    request: async (url) => {
      requested = url;
      return Response.json({ enabled: true, parts: [] });
    },
  });
  assert.equal(requested, '/api/availability?date=2026-09-20');
  assert.equal(availability.enabled, true);
});
