# tourguide

AI SF Tour — a contemporary San Francisco walking-and-Muni tour website.

## View the website

**[Open the AI SF Tour website →](https://ai-sf-tour.yoyoyoyoyoyoyoyoyoyoyo.chatgpt.site/)**

This is the deployed, private review site. Open it while signed in with the account that owns the site. Other visitors do not currently have access, and ticket sales are not open yet.

This GitHub page contains the project files. Use the link above to view the working website. `localhost:3000` works only while running the project on your own computer; `aisftour.com` is the intended public domain and has not been connected here.

## Business plan, guide training and artwork

**[Open all business and design files →](business/README.md)**

Includes the guide training and business plan PDF, backend manual, editable budget, print banners and advertisements, animated GIFs, and kawaii icons. Earlier drafts are preserved in a labeled archive.

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

## Launch status

This is a prelaunch website. Ticket sales remain disabled until Stripe, meeting details, customer contact information and booking policies are configured and validated. Branch C is a proposed special and is not available in checkout. `aisftour.com` is the intended public domain; this repository does not configure its DNS.

Secrets belong in local or hosted environment settings. Do not commit real environment files or Stripe keys. The `.openai/hosting.json` file identifies the existing Sites project; changing the GitHub repository does not redeploy that site.

## Photograph

California Street photograph by Matthiasmullie, from [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Cable_car_in_California_Street.jpg), licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). The site crops the image and applies a pixel color treatment; that adapted image remains under CC BY-SA 4.0. The photograph depicts a cable car; cable cars are not included in the tour offer.
