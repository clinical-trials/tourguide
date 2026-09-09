/**
 * Configure only government charges verified for this San Francisco service.
 * Operator, permit, and payment-processing costs belong in advertised prices.
 * See TAXES.md for the sources, review requirement, and Stripe setup.
 * @typedef {{id:string,label:string,percentage:number,appliesTo:string[]}} TaxRate
 * @typedef {{id:string,label:string,amountCents:number,per:string,appliesTo:string}} GovernmentFee
 * @typedef {{reviewed:boolean,taxes:TaxRate[],governmentFees:GovernmentFee[]}} ChargePolicy
 */
/** @type {ChargePolicy} */
export const CHARGE_POLICY = {
  reviewed: false,
  taxes: [],
  governmentFees: [],
};

/** @param {ChargePolicy} policy */
export function validateChargePolicy(policy) {
  const fail = () => {
    throw new Error('Checkout charges require a valid reviewed configuration.');
  };
  if (
    !policy ||
    typeof policy.reviewed !== 'boolean' ||
    !Array.isArray(policy.taxes) ||
    !Array.isArray(policy.governmentFees) ||
    policy.taxes.length > 5 ||
    policy.governmentFees.length > 5
  )
    fail();
  if (!policy.reviewed && (policy.taxes.length || policy.governmentFees.length))
    fail();
  const ids = new Set(['tour', 'return']);
  const validLabel = (/** @type {string} */ label) =>
    typeof label === 'string' && label.trim().length > 0 && label.length <= 80;
  for (const fee of policy.governmentFees) {
    if (
      !fee ||
      !/^[a-z][a-z0-9_]{0,39}$/.test(fee.id) ||
      ids.has(fee.id) ||
      !validLabel(fee.label) ||
      !Number.isSafeInteger(fee.amountCents) ||
      fee.amountCents < 1 ||
      fee.amountCents > 1000000 ||
      !['guest', 'booking'].includes(fee.per) ||
      !['tour', 'return'].includes(fee.appliesTo)
    )
      fail();
    ids.add(fee.id);
  }
  const taxIds = new Set();
  for (const tax of policy.taxes) {
    if (
      !tax ||
      !/^txr_[A-Za-z0-9]+$/.test(tax.id) ||
      taxIds.has(tax.id) ||
      !validLabel(tax.label) ||
      typeof tax.percentage !== 'number' ||
      !/^\d+(\.\d{1,4})?$/.test(String(tax.percentage)) ||
      tax.percentage <= 0 ||
      tax.percentage > 100 ||
      !Array.isArray(tax.appliesTo) ||
      !tax.appliesTo.length ||
      new Set(tax.appliesTo).size !== tax.appliesTo.length ||
      tax.appliesTo.some((id) => !ids.has(id))
    )
      fail();
    taxIds.add(tax.id);
  }
  return policy;
}

export function chargesReady() {
  try {
    return validateChargePolicy(CHARGE_POLICY).reviewed;
  } catch {
    return false;
  }
}
