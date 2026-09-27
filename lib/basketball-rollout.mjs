// Editorial planning snapshot, not live inventory or a complete season feed.
export const SCHEDULE_CHECKED = '2026-09-27';
export const WARRIORS_SCHEDULE = 'https://www.nba.com/warriors/schedule';
export const VALKYRIES_SCHEDULE = 'https://valkyries.wnba.com/schedule';

export const ROLLOUT_GAMES = [
  {
    id: 'warriors-20261006', team: 'Warriors', opponent: 'Lakers', phase: 'Preseason',
    tipoff: '2026-10-06T19:00:00-07:00', home: true, confirmed: true,
    source: 'https://chasecenter.com/',
  },
  {
    id: 'warriors-20261010', team: 'Warriors', opponent: 'Kings', phase: 'Preseason',
    tipoff: '2026-10-10T17:30:00-07:00', home: true, confirmed: true,
    source: 'https://chasecenter.com/events/20261010-gsw-vs-sac/',
  },
  {
    id: 'warriors-20261023', team: 'Warriors', opponent: 'Grizzlies', phase: 'Regular season',
    tipoff: '2026-10-23T19:00:00-07:00', home: true, confirmed: true,
    source: 'https://chasecenter.com/events/20261023-gsw-vs-mem/',
  },
];

/** A 210-minute tour, with a 60-minute buffer before tipoff. */
export function tourWindow(tipoff) {
  if (!tipoff) return null;
  const game = new Date(tipoff);
  if (!Number.isFinite(game.getTime())) return null;
  const end = new Date(game.getTime() - 60 * 60_000);
  return { start: new Date(end.getTime() - 210 * 60_000), end };
}

/** Excludes unconfirmed games, away games, Mondays and departed tours. */
export function rolloutCandidates(now = new Date(), games = ROLLOUT_GAMES) {
  return games.flatMap((game) => {
    const window = tourWindow(game.tipoff);
    if (!game.confirmed || !game.home || !window || window.start <= now)
      return [];
    const weekday = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Los_Angeles', weekday: 'long',
    }).format(window.start);
    return weekday === 'Monday' ? [] : [{ ...game, ...window }];
  }).sort((a, b) => a.start.getTime() - b.start.getTime());
}
