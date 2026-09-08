import { TramFront, ArrowUpRight } from 'lucide-react';

export default function MuniGuide() {
  return (
    <section
      id="muni"
      className="section shell muni-section"
      aria-labelledby="muni-title"
    >
      <div className="muni-intro">
        <p className="eyebrow">A LOCAL SKILL TO TAKE HOME</p>
        <h2 id="muni-title">
          LEARN MUNI.
          <br />
          KEEP EXPLORING.
        </h2>
        <p>
          We’ll teach you how to use your day pass before the first ride, then
          practice together on the tour. Leave knowing how to find your next
          stop and ride on your own.
        </p>
        <div className="muni-pass-note">
          <TramFront size={28} aria-hidden="true" />
          <div>
            <strong>Buses. Streetcars. Light rail.</strong>
            <span>Historic streetcars are included. Cable cars are not.</span>
          </div>
        </div>
        <p className="small">
          The Muni day pass is included with Branch A or B. Your guide will help
          arrange the right fare before travel; check with us before buying
          another pass.
        </p>
        <a
          className="text-link"
          href="https://www.sfmta.com/fares/day-pass"
          target="_blank"
          rel="noreferrer"
        >
          Official day-pass details <ArrowUpRight size={16} />
        </a>
      </div>
      <ol className="muni-lesson">
        <li>
          <span className="lesson-number">01</span>
          <div>
            <h3>KNOW WHAT’S INCLUDED.</h3>
            <p>
              The Muni-Only Day Pass covers unlimited Muni buses, historic
              streetcars, and Muni Metro light rail until 11:59 p.m. that day.
              It’s a calendar-day pass, not a rolling 24 hours. BART, Caltrain,
              and cable cars need separate fares.
            </p>
          </div>
        </li>
        <li>
          <span className="lesson-number">02</span>
          <div>
            <h3>TAP OR SHOW YOUR PASS.</h3>
            <div className="faq-list muni-methods">
              <details open>
                <summary>Day pass loaded on Clipper</summary>
                <p>
                  Tap the Clipper card or digital Clipper card holding your pass
                  at the reader each time you board, or at the Muni Metro
                  faregate before entering. Wait for acceptance. Use that same
                  Clipper card for your transfers. You don’t tap out of Muni.
                </p>
              </details>
              <details>
                <summary>Day pass in MuniMobile</summary>
                <p>
                  Open Use Tickets, choose your pass under Available, and
                  activate it just before boarding—or before entering Metro
                  faregates. Check that it appears under Active. Show the live,
                  animated ticket when asked; you don’t tap it on a Clipper
                  reader. At Metro stations, show it to the agent and use the
                  designated gate.
                </p>
                <p className="muni-service-note">
                  SFMTA plans to end MuniMobile day-pass sales on January 3,
                  2027. Check the{' '}
                  <a
                    href="https://www.sfmta.com/getting-around/muni/fares/munimobile"
                    target="_blank"
                    rel="noreferrer"
                  >
                    current app guidance
                  </a>{' '}
                  for your travel date.
                </p>
              </details>
              <details>
                <summary>Paper day pass from the farebox</summary>
                <p>
                  If buying one, board at the front and tell the operator you
                  want a day pass before inserting exact cash. Keep the paper
                  pass and check its expiry. Show it when requested; at Metro
                  stations, ask the agent which gate to use.
                </p>
              </details>
            </div>
          </div>
        </li>
        <li>
          <span className="lesson-number">03</span>
          <div>
            <h3>RIDE. TRANSFER. REPEAT.</h3>
            <p>
              Check the line and destination before boarding. With a valid pass,
              you can use any door; cash purchases use the front door. Let
              people off first, keep the aisle clear, and request your stop with
              the cord or button where provided. Keep your pass available for
              inspection and your phone charged if it holds your fare.
            </p>
            <p>
              Keep using your day pass after the tour, up to its expiry. We’ll
              help you plan an onward Muni trip before we say goodbye.
            </p>
          </div>
        </li>
      </ol>
      <div className="muni-footnote">
        <p>
          Guests aged 16–18 ride regular Muni free and don’t need to buy a day
          pass. Carry ID for age verification. This is separate from the
          guided-tour ticket.
        </p>
        <div className="muni-sources">
          <span>FARE GUIDANCE CHECKED 8 SEP 2026</span>
          <a
            href="https://www.sfmta.com/getting-around/muni/how-ride-muni-quick-start-guide"
            target="_blank"
            rel="noreferrer"
          >
            How to ride
          </a>
          <a
            href="https://www.sfmta.com/munimobile-frequently-asked-questions"
            target="_blank"
            rel="noreferrer"
          >
            MuniMobile help
          </a>
          <a
            href="https://www.sfmta.com/fares/free-muni-all-youth-18-years-and-younger"
            target="_blank"
            rel="noreferrer"
          >
            Youth fares
          </a>
        </div>
      </div>
    </section>
  );
}
