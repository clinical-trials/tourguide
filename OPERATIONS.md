# AI SF Tour booking operation

This site is a private prelaunch review. It does not accept payment until all required settings are configured. The domain aisftour.com is the intended public domain; ownership/DNS have not been verified.

## Offer assumptions

- Two distinct 3.5-hour tours, $195 per person per departure, Tuesday–Sunday.
- Above age 15 means 16+. Purchaser explicitly confirms age for every guest.
- Capacity eight, no minimum group size enforced. Trial at 4–6 before confirming capacity.
- Regular Muni day pass included. Food/drinks, cable cars, attraction admissions and game tickets excluded.
- Guided return is $20 per person and starts after the tour. Allow about 45 minutes; delays possible.
- Online reservations close one hour before departure and open at most 180 days ahead.
- Whole-dollar USD prices are charged as displayed. Confirm tax treatment and all inclusions before selling.

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

Use Stripe test mode: successful payment, declined card, expired checkout, cancelled navigation, duplicated webhook, full/partial refund, two simultaneous requests for final places, age unchecked, Monday, past time, winter DST date, and two-party $430 order with returns. Ensure paid orders remain confirmed if the guest closes the browser. Send a Stripe webhook test and verify a 2xx response from the deployed endpoint. Change to live secrets only after test orders and webhook delivery work and customer-facing policies are final.

A returned success URL does not confirm payment. The server retrieves the session and checks paid status, USD currency, exact stored total and booking identity. Stripe card details never pass through this app.

## Holds and operator reconciliation

Seat claims are atomic. A held seat remains counted until a signed Stripe event confirms expiration/failure or payment. The app never frees inventory using its own clock, which prevents late payment events from overselling a departure. Leaving Checkout does not release seats immediately; sessions expire after 35 minutes.

If a network failure occurs after Stripe may have created a session, the app conservatively keeps the hold and logs only its booking reference. On an availability or checkout request, holds older than 40 minutes are reconciled against Stripe. Known sessions are retrieved; orphan holds use a bounded, fully paginated list of sessions created in the possible request window. Only a complete provider response showing absence, or an expired provider session, frees places. Paid sessions are confirmed, including refund tombstones. Errors or incomplete history retain places and log booking_reconciliation_deferred. If such a hold remains stranded, search Stripe by booking_id metadata and verify payment/expiration before an operator release. Unmatched or failing webhooks need operator attention. Do not blindly delete reservations. Monitor Stripe's webhook delivery log and the Site's checkout_start_failed / stripe_webhook_processing_failed events. Add production abuse controls and a booking operations routine before opening a high-traffic public sales channel.

## Verification performed

Eleven automated tests cover pricing, age, dates/DST, atomic capacity, actual schema constraints, signatures and confirmation identity. Seven HTTP checks cover route loading, Monday, invalid dates, disabled payments, cross-origin requests, unverifiable receipt rejection and the live MLB feed. TypeScript and production build were checked. Regression tests also cover out-of-order full refunds, duplicate events, and complete/incomplete Stripe history during recovery. No live Stripe transaction, Stripe test checkout, or actual webhook delivery was possible without account configuration. Browser UI interaction/visual QA was not requested and was not performed. Optional WebMCP selection staging is included but its browser contract has not been verified in a supported context.

## Sources

- https://docs.stripe.com/api/checkout/sessions/create
- https://docs.stripe.com/webhooks/signature
- https://www.mlb.com/giants/schedule
- https://statsapi.mlb.com/api/v1/schedule?sportId=1&teamId=137&date=2026-09-08

Photo credit: California Street, San Francisco, by Matthiasmullie, Wikimedia Commons, CC BY-SA 4.0. Display cropped. https://commons.wikimedia.org/wiki/File:Cable_car_in_California_Street.jpg and https://creativecommons.org/licenses/by-sa/4.0/ . The photo depicts a cable car; this offer uses regular Muni and does not include cable cars.
