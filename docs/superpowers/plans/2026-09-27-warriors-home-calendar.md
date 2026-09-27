# Warriors home-game tour calendar implementation plan

**Goal:** Plan Branch B around published Chase Center home games through April 11, 2027.

**Architecture:** Keep an audited NBA schedule snapshot separate from tour eligibility. Reuse the existing 210-minute tour and 60-minute arrival buffer. Show eligible departures by month and generate matching CSV and tentative calendar downloads.

**Tech stack:** React, TypeScript, Node test runner, Vite/GitHub Pages.

**Spec:** User request of September 27, 2026; existing operating proposal in `business/current/AI-SF-Tour-Basketball-Rollout.md`.

## Constraints and review focus

- America/Los_Angeles dates, including both daylight-saving transitions.
- Exclude Mondays, away games, unconfirmed/TBD times and departed tours.
- Published games do not establish bookable tour inventory. Preserve closed sales.
- Keep Valkyries playoff dates conditional and game admission/food/transit separate.
- Preserve mobile usability and GitHub Pages download paths.

## Implementation

- [x] Verify the official NBA 2026–27 data, including all dated home games and April 11.
- [x] Extend `tests/basketball-rollout.test.mjs` for season coverage, Monday exclusions, early tipoff and daylight-saving dates; observe failure before adding the snapshot in `lib/warriors-home-games.mjs`.
- [x] Update `app/components/games.tsx` and `app/globals.css` with a labeled month selector, departure count, tour start/end and tipoff.
- [x] Generate tentative ICS and CSV files using `scripts/build-game-day-calendar.mjs`; verify every exported time against the shared tour calculation.
- [x] Update rollout notes and README with coverage, pilot priorities, holidays, winter routing and publication limits.
- [x] Run the complete Node tests, TypeScript check and Pages build. Check the month selector and layout in the browser at phone and desktop widths.
- [ ] Review the diff, commit and push to the authorized `tourguide` and `main` branches. Verify GitHub Pages deployment and provide the live calendar link.

## Verification record

All 41 Node tests passed; TypeScript and the Pages production build passed. Browser checks covered all seven month selections at 375px without horizontal overflow and the desktop layout at 1440px. An independent read-only reviewer matched all 43 home game records against the official NBA source snapshot and found no actionable issues. Both downloads contain 38 tentative tour windows.
