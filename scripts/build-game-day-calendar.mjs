import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import {
  rolloutCandidates,
  SCHEDULE_CHECKED,
} from '../lib/basketball-rollout.mjs';

const output = new URL('../public/calendars/', import.meta.url);
const stamp = (date) =>
  date.toISOString().replace(/[-:]/g, '').replace('.000', '');
const localTime = (date) =>
  date.toLocaleTimeString('en-US', {
    timeZone: 'America/Los_Angeles',
    hour: 'numeric',
    minute: '2-digit',
  });
const escapeICS = (value) =>
  value
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,');
const csvCell = (value) => `"${value.replace(/"/g, '""')}"`;

// RFC 5545 requires CRLF and folding at no more than 75 UTF-8 octets.
function foldLine(value) {
  const lines = [];
  let line = '';
  for (const character of value) {
    if (Buffer.byteLength(line + character, 'utf8') > 75) {
      lines.push(line);
      line = ' ';
    }
    line += character;
  }
  return [...lines, line].join('\r\n');
}

export function buildCalendarFiles() {
  const checked = new Date(`${SCHEDULE_CHECKED}T00:00:00Z`);
  const games = rolloutCandidates(checked);
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//AI SF TOUR//Branch B Planning//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:AI SF TOUR - proposed Warriors tours',
  ];
  const rows = [
    [
      'Date',
      'Opponent',
      'Tour start (Pacific)',
      'Tour finish (Pacific)',
      'Game tipoff (Pacific)',
      'Phase',
      'Tour status',
      'Meeting area',
      'Tour finish location',
      'Timezone',
      'Schedule checked',
      'Official schedule',
    ],
  ];
  for (const game of games) {
    const description = [
      'PROPOSED TOUR ONLY - NOT A RESERVATION. Sales are not open.',
      `Warriors vs. ${game.opponent}; ${game.phase}.`,
      `Game tipoff: ${localTime(new Date(game.tipoff))} Pacific. Finish at Chase Center 60 minutes before tipoff.`,
      'Meet near Third and 20th in Dogpatch; exact meeting point pending confirmation.',
      'Game admission, food, coffee and Muni fares are separate purchases.',
      'No tours on Mondays. Holiday staffing, route access and guide availability must be confirmed.',
      `Schedule checked ${SCHEDULE_CHECKED}. Times may change; recheck the official schedule and download a fresh calendar.`,
      game.source,
    ].join('\n');
    lines.push(
      'BEGIN:VEVENT',
      `UID:${game.id}-branch-b@aisftour.com`,
      `DTSTAMP:${stamp(checked)}`,
      `DTSTART:${stamp(game.start)}`,
      `DTEND:${stamp(game.end)}`,
      `SUMMARY:${escapeICS(`PROPOSED Branch B tour - Warriors vs. ${game.opponent}`)}`,
      'STATUS:TENTATIVE',
      'TRANSP:TRANSPARENT',
      `LOCATION:${escapeICS('Dogpatch near Third & 20th, San Francisco (meeting point TBD)')}`,
      `DESCRIPTION:${escapeICS(description)}`,
      'URL:https://clinical-trials.github.io/tourguide/#games',
      'END:VEVENT',
    );
    rows.push([
      game.tipoff.slice(0, 10),
      game.opponent,
      localTime(game.start),
      localTime(game.end),
      localTime(new Date(game.tipoff)),
      game.phase,
      'Proposed - not bookable',
      'Dogpatch near Third & 20th; exact point TBD',
      'Chase Center',
      'America/Los_Angeles',
      SCHEDULE_CHECKED,
      game.source,
    ]);
  }
  lines.push('END:VCALENDAR');
  return {
    'branch-b-warriors-2026-27.ics': lines.map(foldLine).join('\r\n') + '\r\n',
    'branch-b-warriors-2026-27.csv':
      rows.map((row) => row.map(csvCell).join(',')).join('\r\n') + '\r\n',
  };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  mkdirSync(output, { recursive: true });
  for (const [name, content] of Object.entries(buildCalendarFiles())) {
    const path = new URL(name, output);
    if (process.argv.includes('--check')) {
      if (readFileSync(path, 'utf8') !== content)
        throw new Error(`Regenerate ${name}`);
    } else {
      writeFileSync(path, content);
    }
    console.log(
      `${process.argv.includes('--check') ? 'Verified' : 'Wrote'} ${name}`,
    );
  }
}
