# AI SF Tour booking operation

This site is a private prelaunch review. It does not accept payment until all required settings are configured. The domain aisftour.com is the intended public domain; ownership/DNS have not been verified.

## Offer assumptions

- Two distinct 3.5-hour tours, $195 per person per departure, Tuesday–Sunday.
- Above age 15 means 16+. Purchaser explicitly confirms age for every guest.
- Capacity eight, no minimum group size enforced. Trial at 4–6 before confirming capacity.
- Guided Muni instruction is included. Guests purchase their own Muni passes and fares, including for the optional guided return. Food/drinks, cable cars, attraction admissions and game tickets are separate.
- Guided return is $40 per person and starts after the tour. Allow about 45 minutes; delays possible.
- Online reservations close one hour before departure and open at most 180 days ahead.
- Advertised USD prices include mandatory operator fees. Verified government charges are itemized before payment, calculated in cents, and included in the stored total. Read TAXES.md; the unresolved charge policy currently keeps checkout closed.

## Muni lesson delivery

Public promise: “We teach you how to enjoy the city the way the locals do.” Teach the detailed steps in person; the website describes the experience without publishing the full tutorial.

Before the first ride, teach coverage, expiry and the guest’s actual fare method. Clipper pass holders tap at every boarding or Metro entry; MuniMobile users activate before boarding or entering faregates and show the active ticket. Retain paper passes for inspection. Reinforce direction and transfer skills during the tour, and help guests plan an onward ride at the finish. Help guests choose and purchase their own fare when needed. Explain a non-smartphone option and check for existing passes before recommending another purchase. The tour does not supply or pay for guest passes. Guests aged 16–18 ride regular Muni free. Allow for teaching within the timed route trial.

Guidance checked September 8, 2026. SFMTA plans to end MuniMobile day-pass sales January 3, 2027; recheck before departures. Sources: [day pass](https://www.sfmta.com/fares/day-pass), [MuniMobile](https://www.sfmta.com/getting-around/muni/fares/munimobile), [how to ride](https://www.sfmta.com/getting-around/muni/how-ride-muni-quick-start-guide).

## Runtime settings

Use the Sites environment manager. Mark STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET as secrets. Never put them in source or browser variables.

| Setting | Purpose |
| --- | --- |
| STRIPE_SECRET_KEY | Stripe test key first, live key after acceptance testing |
| STRIPE_WEBHOOK_SECRET | Signing secret for this exact webhook endpoint |
| SITE_URL | Trusted HTTPS origin used for redirects; update when domain is connected |
| MEETING_POINT | Exact approved street-level meeting point |
| CONTACT_EMAIL | Monitored customer support address |
| CANCELLATION_POLICY | Approved concise refund/change policy, maximum 1,200 characters for Stripe |
| BOOKING_ENABLED | Leave false until the business and payment workflow are ready |

The public homepage is intentionally a preview when configuration is incomplete. Availability does not fabricate seats. To switch on sales, publish confirmed meeting details, route/accessibility distances and policies in the homepage FAQs as well as setting the runtime values.

Configure a Stripe webhook at SITE_URL/api/stripe/webhook for checkout.session.completed, checkout.session.expired, checkout.session.async_payment_succeeded, checkout.session.async_payment_failed and charge.refunded. Stripe must reach this endpoint without the Sites private sign-in screen. Keep this site private while reviewing; before end-to-end payment testing use a supported externally reachable test endpoint/environment, or explicitly approve public Site access while BOOKING_ENABLED stays false. Do not place a sign-in bypass token in a webhook URL.

Stripe-hosted Checkout collects customer payment/contact details. The app stores the selected tour, quantity, total, age acknowledgement, session and payment references. Full refunds processed in Stripe release places through the signed webhook; partial refunds do not release seats. Stripe receipt email settings belong to the operator's Stripe account. The app provides a verified confirmation page and calendar download, not a separate email service.

## Acceptance checks before live sales

Use Stripe test mode: successful payment, declined card, expired checkout, cancelled navigation, duplicated webhook, full/partial refund, two simultaneous requests for final places, age unchecked, Monday, past time, winter DST date, and two-party $470 order with returns. Ensure paid orders remain confirmed if the guest closes the browser. Send a Stripe webhook test and verify a 2xx response from the deployed endpoint. Change to live secrets only after test orders and webhook delivery work and customer-facing policies are final.

A returned success URL does not confirm payment. The server retrieves the session and checks paid status, USD currency, exact stored total and booking identity. New bookings also retain and verify their original subtotal, government fees and tax breakdown. Stripe card details never pass through this app.

## Holds and operator reconciliation

Seat claims are atomic. A held seat remains counted until a signed Stripe event confirms expiration/failure or payment. The app never frees inventory using its own clock, which prevents late payment events from overselling a departure. Leaving Checkout does not release seats immediately; sessions expire after 35 minutes.

If a network failure occurs after Stripe may have created a session, the app conservatively keeps the hold and logs only its booking reference. On an availability or checkout request, holds older than 40 minutes are reconciled against Stripe. Known sessions are retrieved; orphan holds use a bounded, fully paginated list of sessions created in the possible request window. Only a complete provider response showing absence, or an expired provider session, frees places. Paid sessions are confirmed, including refund tombstones. Errors or incomplete history retain places and log booking_reconciliation_deferred. If such a hold remains stranded, search Stripe by booking_id metadata and verify payment/expiration before an operator release. Unmatched or failing webhooks need operator attention. Do not blindly delete reservations. Monitor Stripe's webhook delivery log and the Site's checkout_start_failed / stripe_webhook_processing_failed events. Add production abuse controls and a booking operations routine before opening a high-traffic public sales channel.

## Verification performed

The current 21-test suite passes, covering pricing and government charges, age, dates/DST, atomic capacity, schema migrations, signatures, confirmation identity, tax snapshots, out-of-order refunds, duplicate events, and complete/incomplete Stripe recovery. TypeScript and the production build pass. Local HTTP checks confirm the homepage loads, availability remains closed, and checkout rejects payments while setup is unresolved. Earlier HTTP checks also covered Monday, invalid dates, cross-origin requests, unverifiable receipts, and the MLB feed. No live Stripe transaction, Stripe test checkout, or actual webhook delivery was possible without account configuration. Browser interaction/visual QA was not requested and was not performed. Optional WebMCP selection staging is included but its browser contract has not been verified in a supported context.

## Sources

- https://docs.stripe.com/api/checkout/sessions/create
- https://docs.stripe.com/webhooks/signature
- https://www.mlb.com/giants/schedule
- https://statsapi.mlb.com/api/v1/schedule?sportId=1&teamId=137&date=2026-09-08

Photo credit: California Street, San Francisco, by Matthiasmullie, Wikimedia Commons, CC BY-SA 4.0. Display cropped. https://commons.wikimedia.org/wiki/File:Cable_car_in_California_Street.jpg and https://creativecommons.org/licenses/by-sa/4.0/ . The photo depicts a cable car; this offer uses regular Muni and does not include cable cars.

Dependency check: patched React/React DOM/React Server Components to 19.2.8, Vinext to beta.9 with its required RSC plugin, and Vite to 8.2.2. The remaining production-root npm audit finding is undici 7.24.8 inherited through local Miniflare/CLI tooling; the application uses platform fetch and no undici/ProxyAgent code was found in the packaged Worker JavaScript. Keep the local toolchain audit under review before subsequent development.
