import { WARRIORS_HOME_GAMES } from './warriors-home-games.mjs';

// Published home-game snapshot through April 11, 2027; not live inventory.
export const SCHEDULE_CHECKED = '2026-09-27';
export const WARRIORS_SCHEDULE = 'https://www.nba.com/warriors/schedule';
export const VALKYRIES_SCHEDULE = 'https://valkyries.wnba.com/schedule';

export const ROLLOUT_GAMES = WARRIORS_HOME_GAMES.map((game) => ({
  ...game,
  team: 'Warriors',
  home: true,
  confirmed: true,
  source: WARRIORS_SCHEDULE,
}));

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
  return games
    .flatMap((game) => {
      const window = tourWindow(game.tipoff);
      if (!game.confirmed || !game.home || !window || window.start <= now)
        return [];
      const weekday = new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/Los_Angeles',
        weekday: 'long',
      }).format(window.start);
      return weekday === 'Monday' ? [] : [{ ...game, ...window }];
    })
    .sort((a, b) => a.start.getTime() - b.start.getTime());
}
