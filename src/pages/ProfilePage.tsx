import {
  Link,
  useNavigate,
} from 'react-router'
import PlatformPage from '../components/layout/PlatformPage'
import { useAuth } from '../context/AuthContext'
import { properties } from '../data/properties'
import './ProfilePage.css'
import './ProfileDashboardExperience.css'

const memberDateFormatter = new Intl.DateTimeFormat(
  'en-US',
  {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  },
)

const currencyFormatter = new Intl.NumberFormat(
  'en-US',
  {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  },
)

const CURRENT_POINTS = 1_120
const FIRST_REWARD_POINTS = 1_400
const SECOND_REWARD_POINTS = 2_800

function ProfilePage() {
  const navigate = useNavigate()
  const { user, signOut } = useAuth()

  if (!user) {
    return null
  }

  const heroProperty =
    properties[3] ?? properties[0]

  if (!heroProperty) {
    return null
  }

  const featuredProperty =
    properties[5] ?? heroProperty

  const rewardBackdrop =
    properties[1] ?? heroProperty

  const recommendedProperties =
    properties.slice(0, 3)

  const recentlyViewedProperties =
    properties.slice(3, 6)

  const firstRewardProgress = Math.min(
    Math.round(
      (CURRENT_POINTS / FIRST_REWARD_POINTS) *
        100,
    ),
    100,
  )

  const secondRewardProgress = Math.min(
    Math.round(
      (CURRENT_POINTS / SECOND_REWARD_POINTS) *
        100,
    ),
    100,
  )

  const handleLogout = () => {
    signOut()

    navigate('/signup', {
      replace: true,
    })
  }

  return (
    <PlatformPage
      memberNavigation
      heroImage={heroProperty.image}
      eyebrow="Private member account"
      title="Profile & Rewards"
      description="Your private home for personalized rentals, saved inspiration, booking activity, and member rewards."
    >
      <section className="profile-session-card">
        <div className="profile-session-card__identity">
          <span className="profile-session-card__avatar">
            {user.firstName.charAt(0).toUpperCase()}
            {user.lastName.charAt(0).toUpperCase()}
          </span>

          <div>
            <small>Currently signed in</small>

            <h2>
              {user.firstName} {user.lastName}
            </h2>

            <p>{user.email}</p>
          </div>
        </div>

        <div className="profile-session-card__details">
          <span>
            <small>Member since</small>

            <strong>
              {memberDateFormatter.format(
                new Date(user.createdAt),
              )}
            </strong>
          </span>

          <span>
            <small>Membership status</small>
            <strong>Active member</strong>
          </span>

          <span>
            <small>Reward balance</small>
            <strong>
              {CURRENT_POINTS.toLocaleString('en-US')}{' '}
              points
            </strong>
          </span>
        </div>

        <button
          type="button"
          className="profile-session-card__logout"
          onClick={handleLogout}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M10 17l5-5-5-5" />
            <path d="M15 12H3" />
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
          </svg>

          <span>Log out</span>
        </button>
      </section>

      <section
        className="profile-visual-dashboard"
        aria-label="Personalized rental dashboard"
      >
        <article className="profile-escape-banner">
          <img
            src={featuredProperty.image}
            alt={featuredProperty.title}
          />

          <div className="profile-escape-banner__shade" />

          <div className="profile-escape-banner__content">
            <span>
              Your next escape
            </span>

            <h2>
              No reservation yet.
              <strong>
                Start somewhere unforgettable.
              </strong>
            </h2>

            <p>
              {featuredProperty.title} offers{' '}
              {featuredProperty.beds} bedrooms,{' '}
              {featuredProperty.baths} baths, and room
              for {featuredProperty.guests} guests.
            </p>

            <div className="profile-escape-banner__actions">
              <Link
                to={`/properties/${featuredProperty.id}`}
              >
                Explore this property
                <span aria-hidden="true">→</span>
              </Link>

              <Link to="/">
                Browse all rentals
              </Link>
            </div>
          </div>

          <aside className="profile-escape-banner__facts">
            <span>
              <small>Nightly rate</small>
              <strong>
                {currencyFormatter.format(
                  featuredProperty.price,
                )}
              </strong>
            </span>

            <span>
              <small>Guest rating</small>
              <strong>
                ★ {featuredProperty.rating}
              </strong>
            </span>

            <span>
              <small>Member rewards</small>
              <strong>
                +{featuredProperty.pointsPerNight}
              </strong>
            </span>
          </aside>
        </article>

        <section className="profile-property-showcase">
          <header className="profile-section-heading">
            <div>
              <span>Selected for your account</span>

              <h2>
                Rentals worth opening twice.
              </h2>
            </div>

            <Link to="/">
              Explore every property
              <span aria-hidden="true">→</span>
            </Link>
          </header>

          <div className="profile-property-grid">
            {recommendedProperties.map(
              (property) => (
                <article
                  className="profile-property-card"
                  key={property.id}
                >
                  <div className="profile-property-card__image">
                    <img
                      src={property.image}
                      alt={property.title}
                    />

                    <span className="profile-property-card__label">
                      {property.label}
                    </span>

                    <span className="profile-property-card__favorite">
                      ♡
                    </span>

                    <span className="profile-property-card__points">
                      +{property.pointsPerNight} pts/night
                    </span>
                  </div>

                  <div className="profile-property-card__body">
                    <div className="profile-property-card__location">
                      <span>
                        {property.city}, {property.state}
                      </span>

                      <strong>
                        ★ {property.rating}
                      </strong>
                    </div>

                    <h3>{property.title}</h3>

                    <div className="profile-property-card__details">
                      <span>{property.beds} beds</span>
                      <span>{property.baths} baths</span>
                      <span>
                        {property.guests} guests
                      </span>
                    </div>

                    <footer>
                      <p>
                        <strong>
                          {currencyFormatter.format(
                            property.price,
                          )}
                        </strong>

                        <span> / night</span>
                      </p>

                      <Link
                        to={`/properties/${property.id}`}
                      >
                        View stay
                        <span aria-hidden="true">→</span>
                      </Link>
                    </footer>
                  </div>
                </article>
              ),
            )}
          </div>
        </section>

        <section className="profile-reward-journey">
          <img
            className="profile-reward-journey__backdrop"
            src={rewardBackdrop.image}
            alt=""
            aria-hidden="true"
          />

          <div className="profile-reward-journey__shade" />

          <header className="profile-reward-journey__header">
            <div>
              <span>Member reward journey</span>

              <h2>
                {CURRENT_POINTS.toLocaleString('en-US')}
                <small> available points</small>
              </h2>
            </div>

            <Link to="/booking/review">
              Review booking
              <span aria-hidden="true">→</span>
            </Link>
          </header>

          <div className="profile-reward-milestones">
            <article>
              <div>
                <span>1,400-Point Reward</span>
                <strong>{firstRewardProgress}%</strong>
              </div>

              <h3>
                Book 2 Nights, Get the 3rd Night FREE
              </h3>

              <p>
                Book two nights and enjoy your third
                night free. Redeem 1,400 points.
              </p>

              <div className="profile-reward-meter">
                <span
                  style={{
                    width: `${firstRewardProgress}%`,
                  }}
                />
              </div>

              <footer>
                <span>
                  {CURRENT_POINTS.toLocaleString('en-US')}{' '}
                  earned
                </span>

                <strong>
                  {(
                    FIRST_REWARD_POINTS -
                    CURRENT_POINTS
                  ).toLocaleString('en-US')}{' '}
                  remaining
                </strong>
              </footer>
            </article>

            <article>
              <div>
                <span>2,800-Point Reward</span>
                <strong>{secondRewardProgress}%</strong>
              </div>

              <h3>
                Book 1 Night, Get the 2nd Night FREE
              </h3>

              <p>
                Book one night and enjoy your second
                night free. Redeem 2,800 points.
              </p>

              <div className="profile-reward-meter">
                <span
                  style={{
                    width: `${secondRewardProgress}%`,
                  }}
                />
              </div>

              <footer>
                <span>
                  {CURRENT_POINTS.toLocaleString('en-US')}{' '}
                  earned
                </span>

                <strong>
                  {(
                    SECOND_REWARD_POINTS -
                    CURRENT_POINTS
                  ).toLocaleString('en-US')}{' '}
                  remaining
                </strong>
              </footer>
            </article>
          </div>
        </section>

        <section className="profile-recent-section">
          <header className="profile-section-heading">
            <div>
              <span>Recently viewed</span>
              <h2>Keep exploring.</h2>
            </div>

            <Link to="/favorites">
              Open favorites
              <span aria-hidden="true">→</span>
            </Link>
          </header>

          <div className="profile-recent-grid">
            {recentlyViewedProperties.map(
              (property) => (
                <Link
                  to={`/properties/${property.id}`}
                  className="profile-recent-card"
                  key={property.id}
                >
                  <img
                    src={property.image}
                    alt={property.title}
                  />

                  <span className="profile-recent-card__shade" />

                  <div>
                    <small>
                      {property.city}, {property.state}
                    </small>

                    <strong>{property.title}</strong>

                    <span>
                      {currencyFormatter.format(
                        property.price,
                      )}{' '}
                      / night
                    </span>
                  </div>
                </Link>
              ),
            )}
          </div>
        </section>
      </section>
    </PlatformPage>
  )
}

export default ProfilePage
