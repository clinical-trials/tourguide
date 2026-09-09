import {
  sqliteTable,
  text,
  integer,
  index,
  uniqueIndex,
} from 'drizzle-orm/sqlite-core';
export const bookings = sqliteTable(
  'bookings',
  {
    id: text('id').primaryKey(),
    tourDate: text('tour_date').notNull(),
    part: text('part').notNull(),
    guests: integer('guests').notNull(),
    returnToWharf: integer('return_to_wharf').notNull(),
    total: integer('total').notNull(),
    pricingSnapshot: text('pricing_snapshot'),
    status: text('status').notNull().default('held'),
    createdAt: integer('created_at').notNull(),
    stripeSession: text('stripe_session'),
    paymentIntent: text('payment_intent'),
    ageConfirmed: integer('age_confirmed').notNull().default(1),
  },
  (t) => [
    index('idx_bookings_departure_status').on(t.tourDate, t.part, t.status),
    uniqueIndex('idx_bookings_stripe_session').on(t.stripeSession),
    index('idx_bookings_payment_intent').on(t.paymentIntent),
  ],
);
export const fullRefunds = sqliteTable('full_refunds', {
  paymentIntent: text('payment_intent').primaryKey(),
});
