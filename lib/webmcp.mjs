import { canBook, quote } from './booking.mjs';
/** @param {(selection:any)=>void} stage */
export function registerBookingTools(stage) {
  const context =
    typeof document === 'undefined' ? undefined : document.modelContext;
  if (!context?.registerTool) return;
  const lifecycle = new AbortController();
  const tool = {
    name: 'stage_tour_selection',
    title: 'Plan an AI SF Tour',
    description:
      'Select a date, departure, number of guests and optional return in the booking form. This only stages the selection; it does not acknowledge age, reserve seats or take payment.',
    inputSchema: {
      type: 'object',
      properties: {
        date: { type: 'string', description: 'YYYY-MM-DD in San Francisco' },
        part: { type: 'string', enum: ['A', 'B'] },
        guests: { type: 'integer', minimum: 1, maximum: 8 },
        returnToWharf: { type: 'boolean' },
      },
      required: ['date', 'part', 'guests', 'returnToWharf'],
      additionalProperties: false,
    },
    annotations: { readOnlyHint: false },
    async execute(input) {
      if (!input || !canBook(input.date, input.part))
        throw new Error(
          'Choose an operating departure at least one hour ahead.',
        );
      const price = quote(input.guests, input.returnToWharf);
      stage(input);
      await new Promise((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(resolve)),
      );
      return {
        staged: true,
        date: input.date,
        part: input.part,
        guests: input.guests,
        subtotalUSD: price.subtotal / 100,
        governmentFeesUSD: price.chargesReviewed
          ? price.governmentFeeTotal / 100
          : null,
        taxesUSD: price.chargesReviewed ? price.taxTotal / 100 : null,
        totalUSD: price.chargesReviewed ? price.total / 100 : null,
        chargesReviewed: price.chargesReviewed,
        reserved: false,
      };
    },
  };
  try {
    Promise.resolve(
      context.registerTool(tool, { signal: lifecycle.signal }),
    ).catch(() => {});
  } catch {}
  return () => lifecycle.abort();
}
