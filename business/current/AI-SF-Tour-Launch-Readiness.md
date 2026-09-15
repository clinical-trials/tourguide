# AI SF Tour: pilot launch readiness

Reviewed September 15, 2026. This records observed readiness and remaining work; it does not record a completed pilot or permission to begin paid operation.

**Current position:** The site works as a private planning preview. The 31-page guide, business plan and cashflow steps are available. Sales remain closed. The fastest path to a first paid departure is the proposed Branch B pilot, after the decisions and operating checks below.

## What was checked

| Area | Evidence / status |
| --- | --- |
| Review website | Existing Sites project is active and owner-private, with no external viewers. |
| Sales switch | Hosted `BOOKING_ENABLED` is `false`. |
| Payment setup | Hosted settings contain the sales switch and site address. Stripe secret/webhook settings, meeting point, contact email and cancellation policy are not configured. No real Stripe checkout or webhook was completed. |
| Website address | Hosted `SITE_URL` matches the current review site. The code and example files contained an older hostname; this update removes that fallback. Missing or malformed HTTPS origins now keep checkout closed. |
| Domain | No custom domain is attached to the Sites project. This does not establish whether the operator owns `aisftour.com`. Connect and test it before distributing printed QR material. |
| Pricing | The site still offers the planned $195 A/B price and $40 optional guided return. The $100 Branch B pilot and four-guest minimum are proposals, not implemented booking rules. |
| Charges | Checkout charge policy is still unreviewed. No tour tax or government surcharge has been activated. Use the dated September 14 fee memo for the research and unresolved questions. |
| Code verification | All 30 tests passed. TypeScript and the production build passed. Local checks returned a working homepage, disabled availability and a 503 response when checkout was attempted. These checks do not replace Stripe acceptance testing. |
| Guide | Latest manual has 31 pages. Apple, Nintendo and World are future Branch A options. NVIDIA Mission Rock remains unconfirmed. These additions are not part of the proposed Branch B pilot promise. |
| Route evidence | Two completed timed group rehearsals, measured walking demands, confirmed restroom access and a workable RH coffee arrangement have not been recorded. |

## Decisions to record before offering dates

| Decision | Planning recommendation | Evidence to record |
| --- | --- | --- |
| Pilot offer | Test Branch B only, two afternoon departures weekly for six paid weeks, four guests minimum and eight maximum. | Selected price, departure minimum and operating days. The proposed $100 price still needs an operator decision. |
| Available cash | Use the existing $3,000 provisional starting-cash model until actual quotes replace its allowances. | Funding available, spending ceiling, insurance/permit quotes and owner draw needs. |
| Meeting and customer contact | One precise, approved Wharf meeting point and a monitored support address. | Street-level pin, permitted use, accessible arrival instructions and contact details. |
| Refunds and minimum departure | Write the promised broadly refundable terms precisely, including timing, customer changes, operator cancellations and the proposed 48-hour minimum-group notice. | Final customer wording and review. Do not activate a four-person minimum without stating how underfilled departures are handled. |
| Public access and payments | Finish a reachable Stripe test checkout/webhook flow before live sales. | Successful and failed payments, return navigation, webhook confirmation, full/partial refunds and capacity checks. Site audience stays private until a public-launch instruction is given. |

## Work sequence for the first paid departure

1. **Select the pilot offer.** Record the price and minimum-group rule, then update the site, booking calculations and customer wording together. Do not advertise one price while collecting another.
2. **Resolve operating requirements.** Obtain written fee/permission answers for the selected Wharf point and guiding activity, an insurance quote and the charge classification. The September 14 memo contains the questions; those inquiries have not been sent on the operator's behalf.
3. **Rehearse Branch B twice.** Use the sheet below, at the intended afternoon start time. Include eight guests plus the guide when checking coffee and standing capacity. Preserve the 5:30 PM finish and record preparation/closeout time separately.
4. **Configure and test sales.** Add the approved meeting point, contact and terms; complete Stripe test-mode checkout and webhook delivery using an externally reachable test setup. Confirm the reviewed charge policy and public access before selling.
5. **Release a limited calendar and reconcile cash.** Publish the first dates only when the preceding evidence is complete. Track paid guests, acquisition cost, refunds, actual owner hours and settled payouts against the existing pilot model.

## Branch B rehearsal sheet

Use one copy per rehearsal. Date: ______  Guide: ______  Volunteer count: ______  Conditions/events: ______

| Segment | Current planning allowance | Actual arrival / departure | Change needed |
| --- | --- | --- | --- |
| Wharf welcome and fare check | 2:00-2:05 PM | | |
| Walk, 30 bus and T line to Dogpatch | 2:05-3:05 PM | | |
| Walk to RH, 590 20th Street | 3:05-3:15 PM | | |
| Guest-paid coffee and comfort stop | 3:15-3:35 PM | | |
| Pier 70 / Y Combinator neighborhood story | 3:35-3:50 PM | | |
| Walk and Chase Center story | 3:50-4:15 PM | | |
| OpenAI exterior story, 1455 3rd Street | 4:15-4:40 PM | | |
| Walk toward Oracle Park | 4:40-5:05 PM | | |
| Oracle Park story | 5:05-5:15 PM | | |
| Buffer, onward directions and close | 5:15-5:30 PM | | |

Record separately: walking distance ______; steps/grades and alternatives ______; verified restrooms ______; transit delays ______; coffee backup ______; safe standing points ______; guide preparation hours ______; closeout hours ______; optional return duration ______.

**Rehearsal completion:** Finish within the advertised 210 minutes without rushing crossings, skipping the required break or adding unconfirmed office access. Each guest should be able to explain a next Muni journey. Log problems and repeat affected segments; a free rehearsal does not count toward paid-demand goals. Do not add the Mission Rock detour until occupancy and route fit are confirmed.

## Existing records to use

- `AI-SF-Tour-Guide-Training-and-Business-Plan.pdf`: 31-page guide, including future route options and source notes.
- `AI-SF-Tour-Full-Business-Plan.pdf`: 41-page consolidated plan and economics.
- `AI-SF-Tour-15-Steps-to-Cashflow.pdf`: prioritized eight-page action plan.
- `AI-SF-Tour-Assumptions-and-Goals.md`: the existing 80 assumptions and 18 goals; actual operating results remain unrecorded.
- `AI-SF-Tour-SF-and-Wharf-Fee-Verification.md`: dated research and agency questions, not operating permission.

No tickets were sold, third parties contacted, accounts created, payments taken, or public audience changes made in this readiness review.
