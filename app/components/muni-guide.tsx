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
          THE CITY.
          <br />
          THE LOCAL WAY.
        </h2>
        <p>
          We teach you how to enjoy the city the way the locals do. Ride Muni,
          find your next neighborhood, and keep exploring long after the tour.
        </p>
        <div className="muni-pass-note">
          <TramFront size={28} aria-hidden="true" />
          <div>
            <strong>Buses. Streetcars. Light rail.</strong>
            <span>Your guide shows you how, as you go.</span>
          </div>
        </div>
        <p className="small">
          Muni passes and fares are purchased separately. Your guide will help
          you choose and use the right option.
        </p>
        <a
          className="text-link"
          href="https://www.sfmta.com/fares/day-pass"
          target="_blank"
          rel="noreferrer"
        >
          Muni day-pass options <ArrowUpRight size={16} />
        </a>
      </div>
      <ul className="muni-lesson">
        <li>
          <span className="lesson-number">01</span>
          <div>
            <h3>GET COMFORTABLE ON MUNI.</h3>
            <p>
              Learn how to use your pass, board, and transfer with your guide
              alongside you.
            </p>
          </div>
        </li>
        <li>
          <span className="lesson-number">02</span>
          <div>
            <h3>FIND YOUR WAY AROUND.</h3>
            <p>
              Get to know the routes that connect the neighborhoods we explore.
            </p>
          </div>
        </li>
        <li>
          <span className="lesson-number">03</span>
          <div>
            <h3>MAKE THE REST OF SF YOURS.</h3>
            <p>
              Leave with local know-how and a little help planning where to go
              next.
            </p>
          </div>
        </li>
      </ul>
    </section>
  );
}
