# tourguide

AI SF Tour — a contemporary San Francisco walking-and-Muni tour website.

## View the website

**[Open the AI SF Tour website →](https://clinical-trials.github.io/tourguide/)**

The public website is published to GitHub Pages from `main`; ongoing work is also kept on `tourguide`. It includes the animated photography, tour routes, mobile navigation, offline city guide, live Giants schedule and interactive date/price preview. Ticket sales are not open yet.

GitHub Pages hosts static files and cannot run the Stripe or booking database APIs. This build clearly labels planning previews and disables checkout. The separate server build retains the backend for a future ticket-sales launch. `aisftour.com` is the intended custom domain and has not been connected here.

## Business plan, guide training and artwork

**[Open all business and design files →](business/README.md)**

Includes the latest 31-page guide training PDF, 53-page full business plan, 15-step cashflow checklist, assumptions and goals register, comparison scripts, backend manual, editable budget, print banners and advertisements, animated GIFs, and kawaii icons. Earlier drafts are preserved in a labeled archive.

Review the [SF / Fisherman’s Wharf pricing analysis](business/current/AI-SF-Tour-Pricing-Market-Review.md): branch-specific price tests, $225 shared-tour upside, demand-loss scenarios and separately costed private bookings. The current website price remains $195.

Download the [latest tour guide PDF](business/current/AI-SF-Tour-Guide-Training-and-Business-Plan.pdf), [full business plan PDF](business/current/AI-SF-Tour-Full-Business-Plan.pdf), or [15 steps to cashflow PDF](business/current/AI-SF-Tour-15-Steps-to-Cashflow.pdf). The guide includes the OpenAI/Anthropic comparison, a future Apple/Nintendo/World Union Square option with the World biometric-verification and sneaker story, the unconfirmed NVIDIA Mission Rock location and verified AMD/NVIDIA Santa Clara addresses as South Bay story references.

Start with the [September 15 launch-readiness review and rehearsal sheet](business/current/AI-SF-Tour-Launch-Readiness.md) for the remaining decisions and evidence needed to sell the first departure.

Supporting planning addenda include the [six-week paid pilot](business/current/AI-SF-Tour-Six-Week-Pilot-Plan.md) and [delivery costs and cost reduction](business/current/AI-SF-Tour-Costs-and-Cost-Reduction.md). Those earlier notes retain a $100 pilot scenario. The September 15 full business plan and assumptions register now recommend a $149 Branch B pilot, retaining the $3,000 provisional starting-cash allowance. The website remains $195 with sales closed; the revised proposal is not activated.

## Tour branches

- **Branch A:** North Beach, Chinatown, SoMa and the downtown AI story. 8:30 AM–12 PM.
- **Branch B — BUILDERS. BALLERS. & THE BAY.:** Dogpatch, a coffee stop at RH San Francisco / The Palm Court (590 20th Street), the Pier 70 builder scene, Chase Center, OpenAI's neighborhood and Oracle Park. 2–5:30 PM. Coffee is purchased separately and depends on service availability.
- **Branch C:** A separate sunny-day west-side special: Ocean Beach, Outerlands coffee on sunny weekends (4001 Judah Street), Golden Gate Park's Japanese Tea Garden, Haight-Ashbury and Japantown. Outerlands currently serves daytime brunch Saturday–Sunday, 9:30 AM–2 PM; confirm hours and capacity for the date. Dates, duration and price remain to be announced. The guide confirms sunny, fog-free conditions at Ocean Beach before departure. Drinks are purchased separately.

Branches A and B are offered Tuesday–Sunday at $195 per adult, ages 16+, with an optional $40 guided Muni return to Fisherman's Wharf. South Bay locations are discussed as stories, not visited.

“We teach you how to enjoy the city the way the locals do.” Each regular tour includes in-person Muni instruction. Guests purchase their own passes and fares, including for the optional guided return. The website describes the experience; detailed teaching notes remain in the operator materials.

## Development

Requires Node.js 22.13 or later and npm.

```sh
npm ci
npm run dev
```

The local preview runs at `http://localhost:3000` by default. See the example environment files and [OPERATIONS.md](OPERATIONS.md) for runtime configuration.

```sh
npm run build
node --test tests/*.test.mjs
```

Built with React, TypeScript, Vinext, Tailwind CSS and Cloudflare D1. The site includes a departure calendar, Stripe Checkout integration, verified booking confirmations, calendar downloads and a live Giants schedule. Its visual identity uses pixelated photography, shutter animation and an ink-and-acid-green palette.

## GitHub Pages publishing

The workflow in [`.github/workflows/pages.yml`](.github/workflows/pages.yml) tests both `tourguide` and `main`, and publishes the site when changes are pushed to `main`. To release, fast-forward `main` to the reviewed `tourguide` commit and push it.

One-time repository setup: in **Settings → Pages → Build and deployment**, select **GitHub Actions** as the source. The `github-pages` environment must allow deployments from `main`. The workflow can also deploy while the existing Pages source is the `main` branch; switching the source to GitHub Actions avoids the redundant default README build. If the first run happened before setup, rerun that workflow after enabling Pages.

```sh
npm run build:pages
npm run preview:pages -- --host 127.0.0.1 --port 4173
```

Open `http://127.0.0.1:4173/tourguide/` to review the production static build. The build publishes only `dist-pages`; business documents, server code, database configuration and local environment files are not copied into the website. Assets and home-screen installation are scoped to `/tourguide/`.

## Launch status

This is a prelaunch website. Ticket sales remain disabled until Stripe, meeting details, customer contact information and booking policies are configured and validated. Branch C is a proposed special and is not available in checkout. `aisftour.com` is the intended public domain; this repository does not configure its DNS.

Secrets belong in local or hosted environment settings. Do not commit real environment files or Stripe keys. The `.openai/hosting.json` file identifies the existing Sites project; changing the GitHub repository does not redeploy that site.

## Photograph

California Street photograph by Matthiasmullie, from [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Cable_car_in_California_Street.jpg), licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). The site crops the image and applies a pixel color treatment; that adapted image remains under CC BY-SA 4.0. The photograph depicts a cable car; cable cars are not included in the tour offer.
