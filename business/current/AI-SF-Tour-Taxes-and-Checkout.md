# Checkout taxes and government fees

Checked against official guidance on September 9, 2026. No tax rate or government fee has been activated. The charge policy remains unreviewed, so payment stays disabled until the treatment is resolved.

## Current offer and applicable guidance

AI SF Tour sells guide services. Guests buy their own Muni fares and attraction admission. The tour does not sell merchandise, food, vehicle hire, or accommodation. California generally excludes standalone services from sales tax. CDTFA's destination-management guidance includes tours and sightseeing and says qualifying service charges are not subject to sales tax. This supports reviewing the offer as a service; it is not an account-specific determination. Do not automatically apply the city's retail sales-tax percentage to tour tickets. [CDTFA destination-management guide](https://cdtfa.ca.gov/industry/destination-management-companies/), [CDTFA sales-tax overview](https://cdtfa.ca.gov/taxes-and-fees/sutprograms.htm).

Mandatory operator fees must be included in advertised prices. Government-imposed charges on the transaction may be itemized separately. Permit, registration, overhead, and unavoidable processing costs do not become customer transaction taxes by labeling them “SF fees.” Keep these operator costs in the advertised $195 ticket and $40 optional return. [California Attorney General pricing FAQ](https://www.oag.ca.gov/hiddenfees).

No specific government charge on this tour transaction has been established. San Francisco separately publishes registration and guide-licensing charges payable by the business. Budget those as operator obligations. [SF registration](https://www.sftreasurer.org/business/register-business), [SF guide-licensing ordinance](https://codelibrary.amlegal.com/codes/san_francisco/latest/sf_police/0-0-0-5570).

## Confirm before sales open

Record each actual charge's name, legal basis, effective date, percentage or fixed amount, and whether it applies to the tour, return, or both. Resolve the classification with CDTFA or the business's tax adviser. If none apply, record that conclusion and use a reviewed empty policy. Recheck if the offer adds goods, rentals, food, or bundled admissions.

## Configuration

`lib/charge-policy.mjs` is shared by customer review and server calculations. It is source-controlled configuration, not a customer-submitted rate.

- `reviewed`: set to `true` after recording the resolved treatment. Empty `taxes` and `governmentFees` then mean $0 in additional charges.
- `taxes`: each entry has a real Stripe `txr_…` ID, exact customer-visible `label`, `percentage` with at most four decimal places, and `appliesTo` IDs: `tour`, `return`, or a configured government-fee ID.
- `governmentFees`: only verified government-imposed transaction fees. Each entry has a unique lowercase `id`, customer-visible `label`, integer `amountCents`, `per` (`guest` or `booking`), and `appliesTo` (`tour` or `return`). To tax a fee, include its ID in the applicable tax's targets. Statutory caps, exemptions, compounding, or other special rules require implementation before enabling that charge.

Use active, exclusive manual tax rates in the operator's Stripe account with country `US` and state `CA`. Test and live IDs differ. Checkout verifies each rate's ID, label, percentage, status, and jurisdiction fields. Rates apply to the SF service, rather than the visitor's home address. This uses manual tax rates, not automatic Stripe Tax classification. [Stripe documentation](https://docs.stripe.com/tax/tax-rates).

Amounts round to cents per extended line and tax rate. Stripe's subtotal, tax, discounts, shipping, and total must match the guest's reviewed amounts before a payment URL is returned. A mismatch blocks checkout and attempts to expire the session. Confirm rounding through real Stripe test-mode purchases. Fixed government fees are separate line items, not Stripe tax amounts; keep appropriate fee-remittance records. Creating a rate does not register the business or remit tax.

Deploy `0002_mysterious_mordo.sql` with this version. The additive migration stores a nullable pricing snapshot. Earlier bookings remain valid; new receipts, payment verification, and recovery use the original amounts even after rates change.

## Validation and release

Automated checks cover rounding, group versus booking fees, optional-return scope, invalid policy rejection, Stripe tax-rate matching, line-item construction, amount tampering, stored tax verification, and the migration. Before release, test actual Stripe purchases with no tax, taxes on each service, fixed and taxable government fees, multiple guests, mismatched totals, refunds, and a policy change while an older payment is pending. Stripe account credentials are not configured, so real Stripe checkout and tax collection remain unverified.
