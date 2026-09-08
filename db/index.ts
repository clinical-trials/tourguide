import { env } from 'cloudflare:workers';
export function getDb() {
  if (!env.DB) throw new Error('Booking storage is unavailable.');
  return env.DB;
}
