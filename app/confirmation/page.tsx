'use client';
import { useEffect, useState } from 'react';
import { PARTS, departureInstant } from '@/lib/booking.mjs';
const money = (cents: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
    cents / 100,
  );
export default function Confirmation() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState('');
  useEffect(() => {
    const id = new URLSearchParams(location.search).get('session_id');
    if (!id) {
      setError('No confirmed booking was found.');
      return;
    }
    fetch(`/api/receipt?session_id=${encodeURIComponent(id)}`)
      .then(async (r) => {
        const d = (await r.json()) as { error?: string; status?: string };
        if (!r.ok) throw new Error(d.error);
        setData(d);
      })
      .catch((e) => setError(e.message));
  }, []);
  function calendar() {
    if (data?.status !== 'paid') return;
    const start = departureInstant(data.date, data.part);
    const end = new Date(+start + 210 * 60000);
    const stamp = (d: Date) =>
      d.toISOString().replace(/[-:]/g, '').replace('.000', '');
    const escape = (s: string) =>
      s
        .replace(/\\/g, '\\\\')
        .replace(/\n/g, '\\n')
        .replace(/,/g, '\\,')
        .replace(/;/g, '\\;');
    const file = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//AI SF Tour//Bookings//EN',
      'BEGIN:VEVENT',
      `UID:${data.reference}-${data.date}@aisftour.com`,
      `DTSTAMP:${stamp(new Date())}`,
      `DTSTART:${stamp(start)}`,
      `DTEND:${stamp(end)}`,
      `SUMMARY:${escape(PARTS[data.part as 'A' | 'B'].label)}`,
      `LOCATION:${escape(data.meeting)}`,
      `DESCRIPTION:${escape(`AI SF Tour. ${data.guests} guest(s). ${data.returnToWharf ? 'Guided return after tour; allow 45 extra minutes.' : ''} Contact: ${data.contact}`)}`,
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');
    const url = URL.createObjectURL(
      new Blob([file], { type: 'text/calendar' }),
    );
    const a = document.createElement('a');
    a.href = url;
    a.download = 'AI-SF-Tour.ics';
    a.click();
    URL.revokeObjectURL(url);
  }
  return (
    <main className="confirmation shell">
      <a className="brand" href="/">
        AI SF TOUR ↗
      </a>
      <div className="booking-card">
        <div className="booking-inner">
          {error ? (
            <>
              <h2>
                LET’S CHECK
                <br />
                YOUR BOOKING.
              </h2>
              <p role="alert">{error}</p>
              <p>Do not pay again until your payment status is resolved.</p>
            </>
          ) : !data ? (
            <p>Verifying your payment…</p>
          ) : data.status === 'refunded' ? (
            <>
              <h2>PAYMENT REFUNDED.</h2>
              <p>
                This tour booking is no longer active. Contact the tour operator
                with any questions.
              </p>
            </>
          ) : data.status !== 'paid' ? (
            <>
              <h2>NOT CONFIRMED YET.</h2>
              <p>
                Your payment has not been verified. Check your Stripe receipt or
                contact the tour operator before making another payment.
              </p>
            </>
          ) : (
            <>
              <p className="eyebrow">PAYMENT VERIFIED / {data.reference}</p>
              <h2>
                SEE YOU
                <br />
                IN THE CITY.
              </h2>
              <p>{PARTS[data.part as 'A' | 'B'].label}</p>
              <p>
                {data.date} · {PARTS[data.part as 'A' | 'B'].time} Pacific
              </p>
              <p>
                {data.guests} guest(s) · Paid {money(data.total)}
              </p>
              {data.pricing && (
                <dl className="review-list">
                  <div>
                    <dt>Subtotal</dt>
                    <dd>{money(data.pricing.subtotal)}</dd>
                  </div>
                  {data.pricing.fees.map(
                    (fee: { id: string; label: string; amount: number }) => (
                      <div key={fee.id}>
                        <dt>{fee.label}</dt>
                        <dd>{money(fee.amount)}</dd>
                      </div>
                    ),
                  )}
                  {data.pricing.taxes.map(
                    (tax: { id: string; label: string; amount: number }) => (
                      <div key={tax.id}>
                        <dt>{tax.label}</dt>
                        <dd>{money(tax.amount)}</dd>
                      </div>
                    ),
                  )}
                  {!data.pricing.taxes.length && (
                    <div>
                      <dt>Taxes</dt>
                      <dd>{money(0)}</dd>
                    </div>
                  )}
                  {!data.pricing.fees.length && (
                    <div>
                      <dt>Government fees</dt>
                      <dd>{money(0)}</dd>
                    </div>
                  )}
                  <div>
                    <dt>Operator fees</dt>
                    <dd>Included</dd>
                  </div>
                  <div>
                    <dt>Paid (USD)</dt>
                    <dd>{money(data.total)}</dd>
                  </div>
                </dl>
              )}
              <p>Meet: {data.meeting}</p>
              {data.returnToWharf && (
                <p>
                  Guided Muni return included. Allow 45 extra minutes after the
                  tour.
                </p>
              )}
              <a className="text-link" href={`mailto:${data.contact}`}>
                Contact your guide
              </a>
              <button className="primary-button" onClick={calendar}>
                Add to calendar ↗
              </button>
            </>
          )}
          <a className="text-link" href="/">
            Return to AI SF Tour
          </a>
        </div>
      </div>
    </main>
  );
}
