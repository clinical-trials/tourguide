'use client';
import { useEffect, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { sfDate } from '@/lib/booking.mjs';
type Game = {
  id: number;
  date: string;
  start: string;
  away: string;
  home: string;
  isHome: boolean;
  venue: string;
  status: string;
  timeTBD: boolean;
  homeScore?: number;
  awayScore?: number;
};
export default function Games() {
  const [date, setDate] = useState(sfDate);
  const [games, setGames] = useState<Game[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const c = new AbortController();
    setLoading(true);
    setError('');
    fetch(`/api/giants?date=${date}`, { signal: c.signal })
      .then(async (r) => {
        const d = (await r.json()) as { games: Game[]; error?: string };
        if (!r.ok) throw new Error(d.error);
        setGames(d.games);
      })
      .catch((e) => {
        if (e.name !== 'AbortError') setError(e.message);
      })
      .finally(() => {
        if (!c.signal.aborted) setLoading(false);
      });
    return () => c.abort();
  }, [date]);
  const today = games.filter((g) => g.date === date),
    upcoming = games.filter((g) => g.date > date && g.isHome).slice(0, 2);
  const format = (g: Game) =>
    g.timeTBD
      ? 'Time TBA'
      : new Date(g.start).toLocaleTimeString('en-US', {
          timeZone: 'America/Los_Angeles',
          hour: 'numeric',
          minute: '2-digit',
        });
  return (
    <div className="games-card">
      <div>
        <p className="eyebrow">EXTRA INNINGS / ORACLE PARK</p>
        <h2>MAKE A DAY OF IT.</h2>
        <p>Finish Branch B near the ballpark, then follow the Giants.</p>
        <label className="schedule-date">
          Game day{' '}
          <input
            type="date"
            value={date}
            onChange={(e) => {
              if (e.target.value) setDate(e.target.value);
            }}
          />
        </label>
        <a
          className="text-link"
          href="https://www.mlb.com/giants/schedule"
          target="_blank"
          rel="noreferrer"
        >
          Official Giants schedule <ArrowUpRight size={16} />
        </a>
        <p className="small game-disclaimer">
          Game tickets sold separately. Times shown in San Francisco time and
          subject to change.
        </p>
      </div>
      <div className="scoreboard" aria-live="polite">
        {loading ? (
          <p>Checking the Giants schedule…</p>
        ) : error ? (
          <p>{error}</p>
        ) : (
          <>
            {today.length ? (
              today.map((g) => (
                <div key={g.id}>
                  <p className="score-eyebrow">
                    {g.isHome
                      ? 'HOME GAME / ORACLE PARK'
                      : 'AWAY GAME / NO GAME AT ORACLE PARK'}
                  </p>
                  <h3>
                    {g.isHome ? g.away.replace('St. Louis ', '') : g.home}
                    <br />
                    <span>
                      {g.isHome ? 'AT SAN FRANCISCO' : 'VS SAN FRANCISCO'}
                    </span>
                  </h3>
                  <div className="score-time">
                    {format(g)} <small>PT · {g.status}</small>
                  </div>
                  {g.homeScore !== undefined && (
                    <p>
                      {g.away} {g.awayScore} · {g.home} {g.homeScore}
                    </p>
                  )}
                </div>
              ))
            ) : (
              <>
                <p className="score-eyebrow">{date}</p>
                <h3>
                  AN OFF DAY.
                  <br />
                  STILL A GREAT CITY.
                </h3>
                <p className="small">No Giants game scheduled for this date.</p>
              </>
            )}
            {upcoming.length > 0 && (
              <div className="upcoming">
                <p className="score-eyebrow">NEXT AT ORACLE PARK</p>
                {upcoming.map((g) => (
                  <p key={g.id}>
                    <span>
                      {new Date(g.date + 'T12:00:00').toLocaleDateString(
                        'en-US',
                        { month: 'short', day: 'numeric' },
                      )}{' '}
                      · {g.away}
                    </span>
                    <strong>{format(g)}</strong>
                  </p>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
