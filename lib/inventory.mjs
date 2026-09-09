// One INSERT...SELECT executes atomically in SQLite: an old UI availability count cannot oversell.
export const CLAIM_SQL = `INSERT INTO bookings (id,tour_date,part,guests,return_to_wharf,total,pricing_snapshot,status,created_at)
SELECT ?,?,?,?,?,?,?,'held',? WHERE
COALESCE((SELECT SUM(guests) FROM bookings WHERE tour_date=? AND part=? AND status IN ('held','paid')),0)+?<=?`;
// Holds remain reserved until Stripe confirms payment failure/expiration. A local clock never frees paid inventory.
export const COUNT_SQL = `SELECT COALESCE(SUM(guests),0) AS used FROM bookings WHERE tour_date=? AND part=? AND status IN ('held','paid')`;
export const REFUND_INSERT_SQL =
  'INSERT INTO full_refunds (payment_intent) VALUES (?) ON CONFLICT (payment_intent) DO NOTHING';
export const REFUND_UPDATE_SQL =
  "UPDATE bookings SET status='refunded' WHERE payment_intent=? AND status='paid'";
export const CONFIRM_SQL = `UPDATE bookings SET status=CASE WHEN EXISTS(SELECT 1 FROM full_refunds WHERE payment_intent=?) THEN 'refunded' ELSE 'paid' END,stripe_session=?,payment_intent=? WHERE id=? AND status IN ('held','paid')`;
