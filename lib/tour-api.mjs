import { STATIC_SITE, publicPath } from './site-platform.mjs';

/** @param {string} date
 * @param {{ staticSite?: boolean, signal?: AbortSignal, request?: typeof fetch }} options
 */
export async function availabilityFor(
  date,
  { staticSite = STATIC_SITE, signal, request = fetch } = {},
) {
  if (staticSite) {
    return {
      enabled: false,
      parts: [
        { part: 'A', remaining: null, bookable: false },
        { part: 'B', remaining: null, bookable: false },
      ],
      meeting: '',
      contact: '',
      policy: '',
    };
  }
  const response = await request(publicPath(`/api/availability?date=${date}`), {
    signal,
  });
  const data = await response.json();
  if (!response.ok)
    throw new Error(data.error || 'Unable to load availability.');
  return data;
}

/** @param {string} date
 * @param {{ staticSite?: boolean, signal?: AbortSignal, request?: typeof fetch }} options
 */
export async function gamesFor(
  date,
  { staticSite = STATIC_SITE, signal, request = fetch } = {},
) {
  const end = new Date(date + 'T12:00:00Z');
  end.setUTCDate(end.getUTCDate() + 14);
  const url = staticSite
    ? `https://statsapi.mlb.com/api/v1/schedule?sportId=1&teamId=137&startDate=${date}&endDate=${end.toISOString().slice(0, 10)}`
    : publicPath(`/api/giants?date=${date}`);
  const response = await request(url, { signal });
  if (!response.ok)
    throw new Error(
      'The live schedule is temporarily unavailable. Check the official Giants schedule.',
    );
  const data = await response.json();
  if (!staticSite) return data.games;
  return data.dates
    .flatMap((day) => day.games)
    .map((game) => ({
      id: game.gamePk,
      date: game.officialDate,
      start: game.gameDate,
      away: game.teams.away.team.name,
      home: game.teams.home.team.name,
      isHome: game.teams.home.team.id === 137,
      venue: game.venue?.name,
      status: game.status.detailedState,
      timeTBD: game.status.startTimeTBD || false,
      awayScore: game.teams.away.score,
      homeScore: game.teams.home.score,
    }));
}
