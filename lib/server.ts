import { env } from 'cloudflare:workers';
import { getDb } from '@/db';
import { validatePaidSession } from './stripe.mjs';
import { CONFIRM_SQL } from './inventory.mjs';
import { locateSession } from './recovery.mjs';
import { chargesReady } from './charge-policy.mjs';
export function settings() {
  return {
    stripeKey: env.STRIPE_SECRET_KEY || '',
    webhookSecret: env.STRIPE_WEBHOOK_SECRET || '',
    siteUrl:
      env.SITE_URL || 'https://ai-sf-tour.purple-badge-1405.chatgpt.site',
    meeting: env.MEETING_POINT || '',
    contact: env.CONTACT_EMAIL || '',
    policy: env.CANCELLATION_POLICY || '',
    enabled: env.BOOKING_ENABLED === 'true',
  };
}
export function ready() {
  const c = settings();
  return Boolean(
    c.enabled &&
    c.stripeKey &&
    c.webhookSecret &&
    c.meeting &&
    c.contact &&
    c.policy &&
    chargesReady(),
  );
}
export function json(data: unknown, status = 200) {
  return Response.json(data, {
    status,
    headers: { 'Cache-Control': 'no-store' },
  });
}
export interface BookingRow {
  id: string;
  tour_date: string;
  part: 'A' | 'B';
  guests: number;
  return_to_wharf: number;
  total: number;
  pricing_snapshot: string | null;
  status: string;
  stripe_session: string | null;
  payment_intent: string | null;
}
export async function confirmSession(session: any) {
  const db = getDb();
  const b = await db
    .prepare('SELECT * FROM bookings WHERE id=?')
    .bind(session.metadata?.booking_id || '')
    .first<BookingRow>();
  if (!validatePaidSession(session, b)) return null;
  if (b!.status === 'refunded') return b;
  if (b!.status !== 'held' && b!.status !== 'paid') return null;
  await db
    .prepare(CONFIRM_SQL)
    .bind(
      typeof session.payment_intent === 'string' ? session.payment_intent : '',
      session.id,
      typeof session.payment_intent === 'string'
        ? session.payment_intent
        : null,
      b!.id,
    )
    .run();
  return await db
    .prepare('SELECT * FROM bookings WHERE id=?')
    .bind(b!.id)
    .first<BookingRow>();
}

export async function reconcileHolds(date: string) {
  const c = settings();
  if (!c.stripeKey) return;
  const db = getDb();
  const rows = await db
    .prepare(
      "SELECT * FROM bookings WHERE tour_date=? AND status='held' AND created_at<? ORDER BY created_at LIMIT 8",
    )
    .bind(date, Date.now() - 40 * 60000)
    .all<BookingRow>();
  await Promise.all(
    rows.results.map(async (b) => {
      try {
        const result = await locateSession(c.stripeKey, b);
        if (!result.complete) return;
        if (!result.session) {
          await db
            .prepare(
              "UPDATE bookings SET status='failed' WHERE id=? AND status='held' AND stripe_session IS NULL",
            )
            .bind(b.id)
            .run();
          return;
        }
        const s = result.session;
        if (s.metadata?.booking_id !== b.id) return;
        if (s.payment_status === 'paid') {
          await confirmSession(s);
          return;
        }
        if (s.status === 'expired')
          await db
            .prepare(
              "UPDATE bookings SET status='expired',stripe_session=? WHERE id=? AND status='held'",
            )
            .bind(s.id, b.id)
            .run();
        else
          await db
            .prepare(
              "UPDATE bookings SET stripe_session=? WHERE id=? AND status='held'",
            )
            .bind(s.id, b.id)
            .run();
      } catch {
        console.error('booking_reconciliation_deferred', { bookingId: b.id });
      }
    }),
  );
}
