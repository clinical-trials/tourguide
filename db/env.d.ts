declare namespace Cloudflare {
  interface Env {
    DB: D1Database;
    STRIPE_SECRET_KEY?: string;
    STRIPE_WEBHOOK_SECRET?: string;
    BOOKING_ENABLED?: string;
    SITE_URL?: string;
    MEETING_POINT?: string;
    CONTACT_EMAIL?: string;
    CANCELLATION_POLICY?: string;
  }
}
