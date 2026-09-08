CREATE TABLE `bookings` (
	`id` text PRIMARY KEY NOT NULL,
	`tour_date` text NOT NULL,
	`part` text NOT NULL,
	`guests` integer NOT NULL,
	`return_to_wharf` integer NOT NULL,
	`total` integer NOT NULL,
	`status` text DEFAULT 'held' NOT NULL,
	`created_at` integer NOT NULL,
	`stripe_session` text,
	`payment_intent` text,
	`age_confirmed` integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_bookings_departure_status` ON `bookings` (`tour_date`,`part`,`status`);--> statement-breakpoint
CREATE UNIQUE INDEX `idx_bookings_stripe_session` ON `bookings` (`stripe_session`);--> statement-breakpoint
CREATE INDEX `idx_bookings_payment_intent` ON `bookings` (`payment_intent`);