import {
  ArrowUpRight,
  ArrowRight,
  Footprints,
  TramFront,
  Clock3,
  MapPin,
  Sun,
} from 'lucide-react';
import Booking from './components/booking';
import Games from './components/games';
import PixelPhoto from './components/pixel-photo';
import PixelMark from './components/pixel-mark';
export default function Home() {
  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <div className="topline">
        <span>SAN FRANCISCO, CA</span>
        <span>ON FOOT. ON MUNI. IN THE KNOW.</span>
        <span>37.7749° N / 122.4194° W</span>
      </div>
      <header className="header shell">
        <a className="brand" href="/" aria-label="AI SF Tour home">
          <span className="brand-mark">
            <PixelMark />
          </span>
          <span>
            AI SF<span className="brand-sub">TOUR</span>
          </span>
        </a>
        <nav aria-label="Main navigation">
          <a href="#routes">The routes</a>
          <a href="#details">Good to know</a>
          <a className="nav-book" href="#book">
            Find your tour <ArrowUpRight size={18} />
          </a>
        </nav>
      </header>
      <main id="main">
        <div className="hero-stage">
          <section className="hero shell">
            <div className="hero-story">
              <p className="eyebrow">
                <span className="live-dot" /> A CONTEMPORARY SAN FRANCISCO TOUR
              </p>
              <h1>
                THE CITY.
                <br />
                BEYOND THE
                <br />
                <span>PROMPT.</span>
              </h1>
              <p className="hero-lead">
                Get out of Fisherman’s Wharf. Meet the neighborhoods, people,
                and ideas shaping what comes next.
              </p>
              <div className="hero-tags">
                <span>
                  <Footprints size={17} /> Walk the city
                </span>
                <span>
                  <TramFront size={17} /> Ride Muni
                </span>
                <span>
                  <Clock3 size={17} /> 3½ hours
                </span>
              </div>
              <PixelPhoto />
            </div>
            <aside id="book" className="booking-wrap">
              <Booking />
            </aside>
          </section>
        </div>
        <div className="route-ticker">
          <span>NORTH BEACH</span>
          <span>↗</span>
          <span>CHINATOWN</span>
          <span>↗</span>
          <span>AI & THE CITY</span>
          <span>↗</span>
          <span>DOGPATCH</span>
          <span>↗</span>
          <span>MISSION BAY</span>
        </div>
        <section id="routes" className="section shell">
          <div className="section-heading">
            <div>
              <p className="eyebrow">01 / CHOOSE YOUR BRANCH</p>
              <h2>
                ONE CITY.
                <br />
                THREE BRANCHES.
              </h2>
            </div>
            <p>
              Start with the streets that shaped San Francisco. Or follow the
              next wave south. Branches A and B run Tuesday–Sunday. When the
              beach is sunny and clear, special Branch C heads west.
            </p>
          </div>
          <div className="route-cards">
            <article className="route-card">
              <div className="route-top">
                <span className="route-letter">A</span>
                <span className="eyebrow">BRANCH A / 8:30 AM–12:00 PM</span>
              </div>
              <h3>
                OLD SOUL.
                <br />
                NEW INTELLIGENCE.
              </h3>
              <p>
                From North Beach’s Italian roots to Chinatown’s civic story,
                then south into the conversation around AI.
              </p>
              <ol className="route-stops">
                <li>
                  <span>01</span>
                  <div>
                    Fisherman’s Wharf
                    <small>
                      Bay views, Alcatraz stories, and a different departure.
                    </small>
                  </div>
                </li>
                <li>
                  <span>02</span>
                  <div>
                    North Beach & Chinatown
                    <small>
                      Little Italy, community, and Chinatown–Rose Pak Station.
                    </small>
                  </div>
                </li>
                <li>
                  <span>03</span>
                  <div>
                    SoMa & the AI story
                    <small>
                      Anthropic, the chip race, and the ideas behind the models.
                    </small>
                  </div>
                </li>
                <li>
                  <span>04</span>
                  <div>
                    The Embarcadero
                    <small>
                      Finish by the Ferry Building. Your afternoon is yours.
                    </small>
                  </div>
                </li>
              </ol>
              <div className="route-bottom">
                <span>$195 / adult</span>
                <a href="/?part=A#book">
                  Choose Branch A <ArrowUpRight size={20} />
                </a>
              </div>
            </article>
            <article className="route-card route-card-dark">
              <div className="route-top">
                <span className="route-letter">B</span>
                <span className="eyebrow">BRANCH B / 2:00–5:30 PM</span>
              </div>
              <h3>
                BUILDERS.
                <br />
                BALLPARKS. BAY.
              </h3>
              <p>
                A southbound Muni ride into the neighborhoods where industrial
                San Francisco meets its next chapter.
              </p>
              <ol className="route-stops">
                <li>
                  <span>01</span>
                  <div>
                    Wharf to Dogpatch
                    <small>
                      Ride into the city. Arrive somewhere unexpected.
                    </small>
                  </div>
                </li>
                <li>
                  <span>02</span>
                  <div>
                    Pier 70 & the builder scene
                    <small>
                      Y Combinator’s neighborhood and the story of Corgi Cafe.
                    </small>
                  </div>
                </li>
                <li>
                  <span>03</span>
                  <div>
                    Mission Bay
                    <small>
                      OpenAI’s neighborhood, Chase Center, and a changing
                      waterfront.
                    </small>
                  </div>
                </li>
                <li>
                  <span>04</span>
                  <div>
                    Oracle Park
                    <small>Finish by the bay. Maybe stay for the game.</small>
                  </div>
                </li>
              </ol>
              <div className="route-bottom">
                <span>$195 / adult</span>
                <a href="/?part=B#book">
                  Choose Branch B <ArrowUpRight size={20} />
                </a>
              </div>
            </article>
          </div>
          <article
            id="branch-c"
            className="route-card route-card-special"
            aria-labelledby="branch-c-title"
          >
            <div className="special-story">
              <div className="route-top">
                <span className="route-letter">C</span>
                <span className="eyebrow">BRANCH C / SUNNY-DAY SPECIAL</span>
              </div>
              <h3 id="branch-c-title">
                WHEN THE FOG
                <br />
                TAKES A DAY OFF.
              </h3>
              <p>
                A separate west-side outing through surf culture, gardens,
                counterculture, and Japantown. On foot and by Muni, with time
                for a different side of San Francisco.
              </p>
              <p className="sunny-condition">
                <Sun size={20} aria-hidden="true" />
                Sunny days only. No fog at Ocean Beach.
              </p>
            </div>
            <div className="special-route">
              <ol className="route-stops">
                <li>
                  <span>01</span>
                  <div>
                    Ocean Beach
                    <small>
                      NorCal surf culture. Wetsuits, not board shorts. Stories
                      from the shore.
                    </small>
                  </div>
                </li>
                <li>
                  <span>02</span>
                  <div>
                    Golden Gate Park & the Japanese Tea Garden
                    <small>A garden pause on the west side of the city.</small>
                  </div>
                </li>
                <li>
                  <span>03</span>
                  <div>
                    Haight-Ashbury
                    <small>
                      Counterculture, creativity, and the ideas that shaped a
                      neighborhood.
                    </small>
                  </div>
                </li>
                <li>
                  <span>04</span>
                  <div>
                    Japantown
                    <small>
                      A distinct neighborhood, with room to linger after the
                      outing.
                    </small>
                  </div>
                </li>
              </ol>
            </div>
            <div className="special-availability">
              <span className="eyebrow">SPECIAL DATES TO BE ANNOUNCED</span>
              <p>
                The guide confirms conditions at Ocean Beach before departure.
                Price, duration, meeting point, and garden admission details
                will be published with the dates. Reservations are not open yet.
              </p>
            </div>
          </article>
          <p className="route-note">
            <MapPin size={17} /> Proposed routes, subject to a timed trial.
            Company stops are exterior storytelling; office visits are not
            included.
          </p>
        </section>
        <section className="city-note">
          <div className="shell city-note-inner">
            <span className="giant-arrow" aria-hidden="true">
              <PixelMark />
            </span>
            <div>
              <p className="eyebrow">THE THROUGH-LINE</p>
              <h2>
                BIG IDEAS DON’T
                <br />
                HAPPEN IN A VACUUM.
              </h2>
              <p>
                Steve Jobs. NVIDIA and AMD. Founders, researchers, and the
                people who make a city work. We connect the technology to the
                streets around it—with room for questions along the way.
              </p>
            </div>
          </div>
        </section>
        <section className="section shell">
          <Games />
        </section>
        <section id="details" className="section shell details-section">
          <div>
            <p className="eyebrow">02 / BEFORE YOU GO</p>
            <h2>
              A LITTLE
              <br />
              LOCAL KNOW-HOW.
            </h2>
            <p className="details-intro">
              Bring curious questions, comfortable shoes, and a layer for the
              fog.
            </p>
          </div>
          <div className="faq-list">
            <details open>
              <summary>What does the $195 ticket include?</summary>
              <p>
                For Branch A or B: one 3½-hour guided experience and a Muni day
                pass for buses, streetcars, and light rail. Food, drinks, cable
                cars, attraction admissions, and game tickets are separate. Each
                departure is booked separately.
              </p>
            </details>
            <details>
              <summary>Where do we meet and finish?</summary>
              <p>
                Branches A and B begin in Fisherman’s Wharf. The exact meeting
                point will be published before reservations open. Branch A
                finishes near the Ferry Building; Branch B near Oracle Park.
              </p>
            </details>
            <details>
              <summary>Can you get me back to the Wharf?</summary>
              <p>
                For Branch A or B, add a guided Muni return for $20 per person.
                Allow around 45 extra minutes after the tour. It uses your
                included day pass and is not a private vehicle transfer.
              </p>
            </details>
            <details>
              <summary>Who can join?</summary>
              <p>
                Guests must be 16 or older. Everyone in a booking must meet the
                age requirement. Expect walking, standing, and public transit;
                the exact distance and accessibility notes will be published
                after a route trial.
              </p>
            </details>
            <details>
              <summary>Will we go inside AI company offices?</summary>
              <p>
                No. This is an independent city tour. We discuss OpenAI,
                Anthropic, Y Combinator, and the wider technology story from
                public places. No company affiliation or private access is
                implied.
              </p>
            </details>
            <details>
              <summary>When does Branch C run?</summary>
              <p>
                Branch C is a separate west-side special, offered only when
                Ocean Beach is sunny and free of fog. It brings together Ocean
                Beach surf culture, Golden Gate Park’s Japanese Tea Garden,
                Haight-Ashbury, and Japantown. The guide confirms beach
                conditions before departure. Dates, price, duration, and the
                weather cancellation policy will be announced before bookings
                open.
              </p>
            </details>
            <details>
              <summary>Does any branch visit the South Bay?</summary>
              <p>
                South Bay locations are discussed as stories, not visited. All
                three branches explore San Francisco.
              </p>
            </details>
            <details>
              <summary>What if my plans or the weather change?</summary>
              <p>
                Booking and cancellation terms will be published before ticket
                sales open. Muni service, events, weather, and site access can
                affect the route.
              </p>
            </details>
          </div>
        </section>
      </main>
      <footer>
        <div className="shell footer-main">
          <a className="brand" href="/">
            AI SF TOUR <ArrowUpRight />
          </a>
          <p>Explore the city making the future.</p>
          <span>aisftour.com</span>
        </div>
        <div className="shell footer-fine">
          <span>© 2026 AI SF Tour · Independent tour concept</span>
          <span>
            Photo:{' '}
            <a
              href="https://commons.wikimedia.org/wiki/File:Cable_car_in_California_Street.jpg"
              target="_blank"
              rel="noreferrer"
            >
              Matthiasmullie
            </a>
            ,{' '}
            <a
              href="https://creativecommons.org/licenses/by-sa/4.0/"
              target="_blank"
              rel="noreferrer"
            >
              CC BY-SA 4.0
            </a>{' '}
            · Cropped and pixel-treated · Cable cars not included
          </span>
        </div>
      </footer>
    </>
  );
}
