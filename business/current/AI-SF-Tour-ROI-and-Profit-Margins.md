# AI SF Tour: ROI and profit margins

Business plan addendum | 14 September 2026 | All figures USD

At a $100 ticket price and four paying guests per departure, the model produces a **39.9% operating margin** and **369.5% estimated first-year ROI**. These are planning calculations, not earned results. The annual calculation assumes 12 identical operating months with no launch ramp-up or seasonal decline.

## Model assumptions

| Driver | Assumption |
| --- | ---: |
| A/B departures per average month | 52 |
| Seats per departure | 8 |
| Paying guests per month | 208 |
| Average guests per departure | 4 |
| Capacity sold | 50% |
| Optional guided return | $40 per buyer |
| Return purchase share | 25% |
| Owner-guide and administration time | 267 hours/month |
| Effective owner hourly allowance | $40 |
| Owner labor cost | $10,680/month |
| Guide Muni fares and other overhead | $1,217.20/month |
| Total committed monthly costs | $11,897.20 |
| Guest consumables | $2 per guest |
| Refund/incident reserve | 3% of sales |
| Domestic-card processing | 2.9% + $0.30 per transaction |

The transaction model conservatively treats each guest ticket and each return purchase as a separate order. Overhead already includes a $600 monthly marketing allowance. Guests buy their own Muni fares and coffee. Branch C is excluded.

Operating profit is after the modeled owner labor allowance, overhead, consumables, processing and reserves. It is before income tax, financing and unmodeled employee costs. This is an owner-operated economic budget, not a complete employee payroll schedule or a formal accounting net-profit statement.

## Price comparison at the same sales volume

| Ticket price | Monthly revenue | Monthly operating profit | Operating margin | Estimated first-year ROI |
| --- | ---: | ---: | ---: | ---: |
| $50 | $12,480.00 | -$647.52 | -5.2% | -43.6% |
| $75 | $17,680.00 | $4,245.68 | 24.0% | 162.9% |
| $100 | $22,880.00 | $9,138.88 | 39.9% | 369.5% |
| $125 | $28,080.00 | $14,032.08 | 50.0% | 576.0% |
| $195 | $42,640.00 | $27,733.04 | 65.0% | 1,154.3% |

Each row assumes the same 208 paying guests and 52 return buyers. Higher prices have not been shown to attract the same number of buyers. The large modeled returns reflect a low-capital service business with owner time separately costed; they do not establish demand or investment performance.

## Investment basis and ROI definition

| Funding item | Amount |
| --- | ---: |
| Estimated startup spending, including 15% contingency | $4,634.50 |
| Two months of committed operating costs held as cash reserve | $23,794.40 |
| Total initial funding target | $28,428.90 |

The startup estimates are not supplier quotes. The funding calculation includes owner labor even if the owner defers taking cash drawings.

**Operating margin = monthly operating profit / monthly revenue.**

**Estimated first-year ROI = (12 x monthly operating profit - startup spending) / total initial funding.**

This is a simplified first-year net-gain calculation. It treats the full startup allowance as spent once, gives no residual value to startup assets, and assumes the working-capital reserve remains held in the business. The reserve is not deducted again as an expense. This is not an IRR, a return on average invested capital, or an after-tax return.

At $100:

- Annual operating profit: $9,138.88 x 12 = **$109,666.56**.
- First-year gain after startup spending: $109,666.56 - $4,634.50 = **$105,032.06**.
- ROI: $105,032.06 / $28,428.90 = **369.5%**.
- Startup-spending recovery: $4,634.50 / $9,138.88 = **0.51 profitable months**.
- Surplus equal to the full funding target: $28,428.90 / $9,138.88 = **3.11 profitable months**. This is not a separate expense or a prediction of the calendar date when capital can be withdrawn.

Actual payback will depend on the launch ramp-up, seasonality, cash collection, refunds and any additional investment.

## Downside cases at a $100 ticket price

| Case | Monthly revenue | Monthly operating profit | Operating margin |
| --- | ---: | ---: | ---: |
| Two guests per departure, 25% return take-up | $11,440.00 | -$1,379.16 | -12.1% |
| Four guests per departure, 25% return take-up | $22,880.00 | $9,138.88 | 39.9% |
| Four guests, no return purchases | $20,800.00 | $7,197.20 | 34.6% |
| Four guests, no returns, added 20% sales-channel cost and 15% labor-cost uplift | $20,800.00 | $1,435.20 | 6.9% |

The no-return cases retain the full reserved return-guide time, as in the market review, to test the business conservatively. The original workbook's "without return service" metric instead removes that staffing cost, so it is a different scenario.

The 20% channel cost is an added planning assumption, not a quoted marketplace commission. It is on top of the existing marketing allowance and retained card charges; actual contracts may replace some fees. The labor uplift adds $1,602/month and is not a complete payroll estimate.

Maintaining two months of committed-cost reserves in the last case raises the funding target to **$31,632.90**. Its estimated first-year gain is **$12,587.90**, giving **39.8% first-year ROI** on that higher funding target. At two guests per departure, the business loses money even before recovering startup spending.

## Reproduce the calculations

For ticket price P and N paying guests:

- Return buyers = N x 25%.
- Revenue = N x P + return buyers x $40.
- Processing = revenue x 2.9% + (N + return buyers) x $0.30.
- Operating profit = revenue - processing - revenue x 3% - N x $2 - $11,897.20.
- The channel stress subtracts another N x P x 20%.
- The labor stress subtracts another $10,680 x 15%.

Calculations use unrounded inputs. Money is displayed to cents and percentages to one decimal. The $195 result reconciles to the existing budget's monthly operating surplus.

## Sources and scope

- [Existing business budget](AI-SF-Tour-Budget.xlsx): Monthly C39:C58 for operating drivers and costs; Startup F29:F34 for startup spending and funding; Assumptions C15:C52 and C65:C76 for pricing, costs and labor context.
- [Market and value review](AI-SF-Tour-Market-and-Value-Review.md): price alternatives, no-return stress assumptions and proposed pilot.
- [Stripe standard pricing](https://stripe.com/pricing): domestic-card charges checked 14 September 2026. International-card, currency-conversion and other charges can increase costs.
- [Official SF minimum wage history](https://media.api.sf.gov/documents/2026_Historical_San_Francisco_Minimum_Wage_Rates_M9ynRNo.pdf): $19.61/hour effective July 1, 2026, checked 14 September 2026. The model retains $40/hour for owner work. Hiring also requires applicable overtime, employer taxes, leave and coverage.

Government taxes collected from customers are not operating revenue. Startup quotes, insurance, permits, actual acquisition cost and booking demand remain unvalidated. The website and workbook continue to use $195; these calculations do not change the selling price or enable ticket sales.
