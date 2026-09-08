import { getDb } from '@/db';
import { settings, ready, json, reconcileHolds } from '@/lib/server';
import { canBook, CAPACITY, validDate, sfDate } from '@/lib/booking.mjs';
import { COUNT_SQL } from '@/lib/inventory.mjs';
export async function GET(req: Request) {
  const date = new URL(req.url).searchParams.get('date') || sfDate();
  if (!validDate(date)) return json({ error: 'Choose a valid date.' }, 400);
  const c = settings();
  const enabled = ready();
  try {
    if (enabled) await reconcileHolds(date);
    const parts = await Promise.all(
      (['A', 'B'] as const).map(async (part) => {
        if (!canBook(date, part))
          return { part, remaining: 0, bookable: false };
        if (!enabled) return { part, remaining: null, bookable: false };
        const row = await getDb()
          .prepare(COUNT_SQL)
          .bind(date, part)
          .first<{ used: number }>();
        return {
          part,
          remaining: Math.max(0, CAPACITY - (row?.used || 0)),
          bookable: true,
        };
      }),
    );
    return json({
      date,
      enabled,
      parts,
      meeting: c.meeting,
      contact: c.contact,
      policy: c.policy,
    });
  } catch {
    return json(
      { error: 'Availability is temporarily unavailable. Please try again.' },
      503,
    );
  }
}
