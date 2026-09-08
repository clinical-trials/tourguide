'use client';
import { useEffect, useState } from 'react';
import {
  ArrowUpRight,
  Minus,
  Plus,
  ShieldCheck,
  ArrowLeft,
} from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { PARTS, quote, sfDate, canBook, CAPACITY } from '@/lib/booking.mjs';
import { registerBookingTools } from '@/lib/webmcp.mjs';
type Availability = {
  enabled: boolean;
  parts: { part: 'A' | 'B'; remaining: number | null; bookable: boolean }[];
  meeting: string;
  contact: string;
  policy: string;
};
const localDate = (s: string) => new Date(s + 'T12:00:00');
const dateKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
function initialDate() {
  let d = sfDate();
  while (!canBook(d, 'A') && !canBook(d, 'B')) {
    const x = localDate(d);
    x.setDate(x.getDate() + 1);
    d = dateKey(x);
  }
  return d;
}
export default function Booking() {
  const [date, setDate] = useState(initialDate);
  const [part, setPart] = useState<'A' | 'B'>('B');
  const [guests, setGuests] = useState(1);
  const [back, setBack] = useState(false);
  const [age, setAge] = useState(false);
  const [review, setReview] = useState(false);
  const [availability, setAvailability] = useState<Availability | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [month, setMonth] = useState(localDate(date));
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('part') === 'A' || params.get('part') === 'B')
      setPart(params.get('part') as 'A' | 'B');
    else if (canBook(date, 'A')) setPart('A');
    if (params.get('checkout') === 'cancelled')
      setError(
        'Checkout was left before confirmation. Any unpaid held places are released when checkout expires, usually within 35 minutes.',
      );
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setAvailability(null);
    fetch(`/api/availability?date=${date}`, { signal: controller.signal })
      .then(async (r) => {
        const data = (await r.json()) as Availability & { error?: string };
        if (!r.ok) throw new Error(data.error);
        setAvailability(data);
      })
      .catch((e) => {
        if (e.name !== 'AbortError')
          setError(e.message || 'Unable to load availability.');
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [date]);
  useEffect(
    () =>
      registerBookingTools(
        (selection: {
          date: string;
          part: 'A' | 'B';
          guests: number;
          returnToWharf: boolean;
        }) => {
          setDate(selection.date);
          setMonth(localDate(selection.date));
          setPart(selection.part);
          setGuests(selection.guests);
          setBack(selection.returnToWharf);
          setReview(false);
          setError('');
          document
            .getElementById('book')
            ?.scrollIntoView({ behavior: 'smooth' });
        },
      ),
    [],
  );
  const prices = quote(guests, back),
    selected = availability?.parts.find((p) => p.part === part),
    remaining = selected?.remaining;
  const validSelection =
    canBook(date, part) && (remaining == null || remaining >= guests);
  const dateLabel = localDate(date).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  async function pay() {
    setBusy(true);
    setError('');
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date,
          part,
          guests,
          returnToWharf: back,
          ageConfirmed: age,
        }),
      });
      const result = (await response.json()) as { url: string; error?: string };
      if (!response.ok)
        throw new Error(result.error || 'Checkout could not be started.');
      const url = new URL(result.url);
      if (url.protocol !== 'https:' || url.hostname !== 'checkout.stripe.com')
        throw new Error('Checkout returned an unexpected address.');
      location.assign(url.href);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Please try again.');
      setBusy(false);
    }
  }
  return (
    <div className="booking-card">
      <div className="booking-heading">
        <p className="eyebrow">YOUR NEXT GOOD STORY</p>
        <h2>FIND YOUR TOUR.</h2>
        <p>
          <strong>$195</strong> <span>/ adult · ages 16+</span>
        </p>
      </div>
      <div className="booking-inner">
        {!review ? (
          <>
            <div className="calendar-heading">
              <span>01 / PICK A DATE</span>
              <span>TUE–SUN</span>
            </div>
            <Calendar
              mode="single"
              required
              selected={localDate(date)}
              month={month}
              onMonthChange={setMonth}
              onSelect={(d) => {
                if (d) {
                  setDate(dateKey(d));
                  setError('');
                }
              }}
              disabled={(d) =>
                !canBook(dateKey(d), 'A') && !canBook(dateKey(d), 'B')
              }
              startMonth={localDate(sfDate())}
              endMonth={new Date(Date.now() + 180 * 86400000)}
              className="tour-calendar"
            />
            <p className="calendar-note">
              No tours Mondays · All times Pacific
            </p>
            <div className="calendar-heading">
              <span>02 / YOUR DEPARTURE</span>
            </div>
            <RadioGroup
              value={part}
              onValueChange={(value) => setPart(value as 'A' | 'B')}
              aria-label="Departure"
            >
              <label
                className={`slot ${part === 'A' ? 'selected' : ''} ${!canBook(date, 'A') ? 'unavailable' : ''}`}
              >
                <RadioGroupItem
                  value="A"
                  disabled={!canBook(date, 'A')}
                  aria-label="Part A morning"
                />
                <span>
                  <strong>Part A · Morning</strong>
                  <small>8:30 AM–12:00 PM</small>
                </span>
                <span className="slot-tag">
                  {!canBook(date, 'A') ? 'CLOSED' : 'A'}
                </span>
              </label>
              <label
                className={`slot ${part === 'B' ? 'selected' : ''} ${!canBook(date, 'B') ? 'unavailable' : ''}`}
              >
                <RadioGroupItem
                  value="B"
                  disabled={!canBook(date, 'B')}
                  aria-label="Part B afternoon"
                />
                <span>
                  <strong>Part B · Afternoon</strong>
                  <small>2:00–5:30 PM</small>
                </span>
                <span className="slot-tag">
                  {!canBook(date, 'B') ? 'CLOSED' : 'B'}
                </span>
              </label>
            </RadioGroup>
            <div className="guest-row">
              <div>
                <strong>Adults</strong>
                <small>Ages 16+ · Maximum 8</small>
              </div>
              <div className="stepper">
                <button
                  type="button"
                  aria-label="Remove one guest"
                  disabled={guests <= 1}
                  onClick={() => setGuests((v) => v - 1)}
                >
                  <Minus size={17} />
                </button>
                <output aria-live="polite">{guests}</output>
                <button
                  type="button"
                  aria-label="Add one guest"
                  disabled={guests >= CAPACITY}
                  onClick={() => setGuests((v) => v + 1)}
                >
                  <Plus size={17} />
                </button>
              </div>
            </div>
            <label className="check-row">
              <Checkbox
                aria-label="Add guided Muni return to Fisherman’s Wharf"
                checked={back}
                onCheckedChange={setBack}
              />
              <span>
                <strong>Take me back to the Wharf</strong>
                <small>Guided Muni return · +$20/person · ~45 min extra</small>
              </span>
            </label>
            <div className="booking-total">
              <span>
                {guests} {guests === 1 ? 'adult' : 'adults'}
                {back ? ' + return' : ''}
              </span>
              <strong>${prices.total / 100}</strong>
            </div>
            <button
              className="primary-button"
              disabled={!validSelection || loading}
              onClick={() => {
                setReview(true);
                setError('');
              }}
            >
              Review your tour <ArrowUpRight size={20} />
            </button>
            <p className="booking-caption">
              {loading
                ? 'Checking departure…'
                : availability?.enabled
                  ? remaining == null
                    ? ''
                    : `${remaining} places available. Muni pass included.`
                  : 'Preview your plans. Reservations opening soon.'}
            </p>
          </>
        ) : (
          <>
            <button className="back-button" onClick={() => setReview(false)}>
              <ArrowLeft size={16} /> Edit selection
            </button>
            <h3 className="review-title">
              YOUR CITY.
              <br />
              {part === 'A' ? 'YOUR MORNING.' : 'YOUR AFTERNOON.'}
            </h3>
            <p className="review-part">{PARTS[part].label}</p>
            <dl className="review-list">
              <div>
                <dt>Date</dt>
                <dd>{dateLabel}</dd>
              </div>
              <div>
                <dt>Time</dt>
                <dd>{PARTS[part].time} Pacific</dd>
              </div>
              <div>
                <dt>Tour</dt>
                <dd>{guests} × $195</dd>
              </div>
              {back && (
                <div>
                  <dt>Guided return</dt>
                  <dd>{guests} × $20</dd>
                </div>
              )}
              <div>
                <dt>Muni day pass</dt>
                <dd>Included</dd>
              </div>
              <div>
                <dt>Total (USD)</dt>
                <dd>${prices.total / 100}</dd>
              </div>
            </dl>
            <p className="small">
              {availability?.meeting
                ? `Meet: ${availability.meeting}`
                : 'Meeting point: Fisherman’s Wharf. Exact location will be published before sales open.'}
            </p>
            <label className="check-row age-row">
              <Checkbox
                aria-label="I acknowledge I and every guest are above 15 years old"
                checked={age}
                onCheckedChange={setAge}
              />
              <span>
                I acknowledge that I am above 15 years old and every guest in
                this booking is also 16 or older.
              </span>
            </label>
            {availability?.policy && (
              <p className="small">{availability.policy}</p>
            )}
            <button
              className="primary-button"
              disabled={
                !availability?.enabled || !age || !validSelection || busy
              }
              onClick={pay}
            >
              {busy
                ? 'Opening secure checkout…'
                : availability?.enabled
                  ? 'Continue to Stripe'
                  : 'Reservations opening soon'}
              <ArrowUpRight size={20} />
            </button>
            <p className="booking-caption">
              <ShieldCheck size={14} />
              {availability?.enabled
                ? 'Payment is completed securely on Stripe.'
                : 'No reservation or payment has been made.'}
            </p>
          </>
        )}
        {error && (
          <p className="booking-error" role="alert">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
