'use client';
import { useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import {
  rolloutCandidates,
  SCHEDULE_CHECKED,
  WARRIORS_SCHEDULE,
  VALKYRIES_SCHEDULE,
} from '@/lib/basketball-rollout.mjs';

const time = (date: Date) => date.toLocaleTimeString('en-US', {
  timeZone: 'America/Los_Angeles', hour: 'numeric', minute: '2-digit',
});
const day = (date: Date) => date.toLocaleDateString('en-US', {
  timeZone: 'America/Los_Angeles', weekday: 'short', month: 'short', day: 'numeric',
  year: 'numeric',
});

export default function Games() {
  const [now] = useState(() => new Date());
  const candidates = rolloutCandidates(now);
  return (
    <div className="games-card basketball-rollout">
      <div>
        <p className="eyebrow">GAME DAY / CHASE CENTER</p>
        <h2>CITY FIRST.<br />COURTSIDE NEXT.</h2>
        <p>
          Warriors. Valkyries. A different way to do game day. Our proposed
          Branch B Game Day Edition starts in Dogpatch and finishes at Chase
          Center, one hour before tipoff.
        </p>
        <p>
          Explore the neighborhood, the waterfront, and the AI story with your
          guide, then head to the game. Allow 3½ hours for the tour.
        </p>
        <div className="basketball-schedules">
          <a className="text-link" href={WARRIORS_SCHEDULE} target="_blank" rel="noreferrer">
            Official Warriors schedule <ArrowUpRight size={16} />
          </a>
          <a className="text-link" href={VALKYRIES_SCHEDULE} target="_blank" rel="noreferrer">
            Official Valkyries schedule <ArrowUpRight size={16} />
          </a>
        </div>
        <p className="small game-disclaimer">
          Game-day departures are proposed and not yet bookable. Game tickets,
          coffee, food, and Muni fares are purchased separately. All times are
          Pacific and subject to change. No tours on Mondays.
        </p>
        <p className="small game-disclaimer">
          Baseball returns as a seasonal option.{' '}
          <a href="https://www.mlb.com/giants/schedule" target="_blank" rel="noreferrer">
            Check the Giants schedule.
          </a>
        </p>
      </div>
      <div className="scoreboard">
        <p className="score-eyebrow">PROPOSED WARRIORS DEPARTURES</p>
        <p className="small schedule-checked">
          Selected home games · checked{' '}
          <time dateTime={SCHEDULE_CHECKED}>September 27, 2026</time>.
          Check the official schedule for changes.
        </p>
        {candidates.length ? (
          <ul className="game-day-list">
            {candidates.map((game) => (
              <li key={game.id}>
                <p className="game-day-date">{day(game.start)} · {game.phase}</p>
                <h3>{game.team} vs. {game.opponent}</h3>
                <dl className="game-day-times">
                  <div><dt>Proposed tour</dt><dd>{time(game.start)}–{time(game.end)}</dd></div>
                  <div><dt>Tipoff</dt><dd>{time(new Date(game.tipoff))}</dd></div>
                </dl>
                <a className="text-link" href={game.source} target="_blank" rel="noreferrer">
                  Verify game details <ArrowUpRight size={16} />
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="small">More tour dates to be announced. Use the official team schedules to plan ahead.</p>
        )}
        <div className="valkyries-rollout">
          <p className="score-eyebrow">VALKYRIES / PLAYOFF WATCH</p>
          <h3>WHEN BALLHALLA CALLS.</h3>
          <p>
            We’re planning Valkyries editions around confirmed Chase Center
            home games. Playoff dates depend on results; departure times will
            be announced once the game date and tipoff are verified.
          </p>
          <a className="text-link" href={VALKYRIES_SCHEDULE} target="_blank" rel="noreferrer">
            Check Valkyries home games <ArrowUpRight size={16} />
          </a>
        </div>
      </div>
    </div>
  );
}
