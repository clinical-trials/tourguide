import { sfDate, validDate } from '@/lib/booking.mjs';
export async function GET(req: Request) {
  const date = new URL(req.url).searchParams.get('date') || sfDate();
  if (!validDate(date))
    return Response.json({ error: 'Invalid date' }, { status: 400 });
  try {
    const end = new Date(date + 'T12:00:00Z');
    end.setUTCDate(end.getUTCDate() + 14);
    const upstream = await fetch(
      `https://statsapi.mlb.com/api/v1/schedule?sportId=1&teamId=137&startDate=${date}&endDate=${end.toISOString().slice(0, 10)}`,
      { signal: AbortSignal.timeout(8000) },
    );
    if (!upstream.ok) throw new Error('MLB unavailable');
    const data = (await upstream.json()) as { dates: { games: any[] }[] };
    const games = data.dates
      .flatMap((d) => d.games)
      .map((g) => ({
        id: g.gamePk,
        date: g.officialDate,
        start: g.gameDate,
        away: g.teams.away.team.name,
        home: g.teams.home.team.name,
        isHome: g.teams.home.team.id === 137,
        venue: g.venue?.name,
        status: g.status.detailedState,
        timeTBD: g.status.startTimeTBD || false,
        awayScore: g.teams.away.score,
        homeScore: g.teams.home.score,
      }));
    return Response.json(
      { date, games, checkedAt: new Date().toISOString() },
      { headers: { 'Cache-Control': 'public, max-age=60' } },
    );
  } catch {
    return Response.json(
      {
        date,
        error:
          'The live schedule is temporarily unavailable. Check the official Giants schedule.',
      },
      { status: 503, headers: { 'Cache-Control': 'no-store' } },
    );
  }
}
