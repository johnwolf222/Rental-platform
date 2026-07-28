import {
  Link,
  useNavigate,
} from 'react-router'
import PlatformPage from '../components/layout/PlatformPage'
import { useAuth } from '../context/AuthContext'
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

const CURRENT_POINTS = 1_120
const FIRST_REWARD_POINTS = 1_400
const SECOND_REWARD_POINTS = 2_800

function ProfilePage() {
  const navigate = useNavigate()
  const { user, signOut } = useAuth()

  if (!user) {
    return null
  }

  const handleLogout = () => {
    signOut()

    navigate('/signup', {
      replace: true,
    })
  }

  return (
    <PlatformPage
      memberNavigation
      eyebrow="Private member account"
      title="Profile & Rewards"
      description="Track reward progress, review saved stays and booking activity, and manage your private member account from one secure workspace."
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
            <small>Terms accepted</small>
            <strong>
              {user.legalAcceptance.termsVersion}
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

          Log out
        </button>
      </section>

      <section
        className="profile-dashboard"
        aria-label="Member rewards and account dashboard"
      >
        <article className="profile-rewards-card">
          <header className="profile-rewards-card__header">
            <div>
              <span>Rewards balance</span>
              <h2>Your next free night is getting closer.</h2>
            </div>

            <span className="profile-rewards-card__status">
              Active rewards
            </span>
          </header>

          <div className="profile-rewards-card__balance">
            <div>
              <strong>
                {CURRENT_POINTS.toLocaleString('en-US')}
              </strong>

              <span>available points</span>
            </div>

            <Link to="/booking/review">
              Review booking
              <span aria-hidden="true">→</span>
            </Link>
          </div>

          <div className="profile-reward-list">
            <article className="profile-reward">
              <div className="profile-reward__heading">
                <div>
                  <span>1,400-Point Reward</span>
                  <h3>
                    Book 2 Nights, Get the 3rd Night FREE
                  </h3>
                </div>

                <strong>
                  {Math.min(
                    Math.round(
                      (CURRENT_POINTS /
                        FIRST_REWARD_POINTS) *
                        100,
                    ),
                    100,
                  )}
                  %
                </strong>
              </div>

              <p>
                Book two nights and enjoy your third night
                free. Redeem 1,400 points.
              </p>

              <div
                className="profile-reward__meter"
                role="progressbar"
                aria-label="Progress toward the 1,400-point reward"
                aria-valuemin={0}
                aria-valuemax={FIRST_REWARD_POINTS}
                aria-valuenow={CURRENT_POINTS}
              >
                <span
                  style={{
                    width: `${Math.min(
                      (CURRENT_POINTS /
                        FIRST_REWARD_POINTS) *
                        100,
                      100,
                    )}%`,
                  }}
                />
              </div>

              <footer>
                <span>
                  {CURRENT_POINTS.toLocaleString('en-US')} earned
                </span>

                <strong>
                  {Math.max(
                    FIRST_REWARD_POINTS - CURRENT_POINTS,
                    0,
                  ).toLocaleString('en-US')}{' '}
                  points remaining
                </strong>
              </footer>
            </article>

            <article className="profile-reward">
              <div className="profile-reward__heading">
                <div>
                  <span>2,800-Point Reward</span>
                  <h3>
                    Book 1 Night, Get the 2nd Night FREE
                  </h3>
                </div>

                <strong>
                  {Math.min(
                    Math.round(
                      (CURRENT_POINTS /
                        SECOND_REWARD_POINTS) *
                        100,
                    ),
                    100,
                  )}
                  %
                </strong>
              </div>

              <p>
                Book one night and enjoy your second night
                free. Redeem 2,800 points.
              </p>

              <div
                className="profile-reward__meter"
                role="progressbar"
                aria-label="Progress toward the 2,800-point reward"
                aria-valuemin={0}
                aria-valuemax={SECOND_REWARD_POINTS}
                aria-valuenow={CURRENT_POINTS}
              >
                <span
                  style={{
                    width: `${Math.min(
                      (CURRENT_POINTS /
                        SECOND_REWARD_POINTS) *
                        100,
                      100,
                    )}%`,
                  }}
                />
              </div>

              <footer>
                <span>
                  {CURRENT_POINTS.toLocaleString('en-US')} earned
                </span>

                <strong>
                  {Math.max(
                    SECOND_REWARD_POINTS - CURRENT_POINTS,
                    0,
                  ).toLocaleString('en-US')}{' '}
                  points remaining
                </strong>
              </footer>
            </article>
          </div>
        </article>

        <aside className="profile-dashboard__side">
          <article className="profile-status-card">
            <span className="profile-status-card__eyebrow">
              Next stay
            </span>

            <div className="profile-status-card__icon">
              <span aria-hidden="true">⌂</span>
            </div>

            <h3>No upcoming reservation</h3>

            <p>
              Explore manager-approved rentals and preserve
              your nightly rate and reward value when you
              begin booking.
            </p>

            <Link to="/">
              Explore rentals
              <span aria-hidden="true">→</span>
            </Link>
          </article>

          <article className="profile-status-card profile-status-card--gold">
            <span className="profile-status-card__eyebrow">
              Saved stays
            </span>

            <div className="profile-status-card__icon">
              <span aria-hidden="true">♡</span>
            </div>

            <h3>Your favorites, organized.</h3>

            <p>
              Return to properties you have saved and compare
              locations, nightly prices, ratings, and reward
              values.
            </p>

            <Link to="/favorites">
              Open favorites
              <span aria-hidden="true">→</span>
            </Link>
          </article>
        </aside>

        <section className="profile-tools">
          <header className="profile-tools__heading">
            <div>
              <span>Account shortcuts</span>
              <h2>Everything important, one tap away.</h2>
            </div>

            <p>
              Review account activity, saved stays, pending
              booking details, messages, and support.
            </p>
          </header>

          <div className="profile-tools__grid">
            <Link to="/notifications">
              <span className="profile-tools__number">02</span>

              <div>
                <small>Member activity</small>
                <strong>Notifications</strong>
                <p>
                  Review booking updates, reward milestones,
                  and manager messages.
                </p>
              </div>

              <i aria-hidden="true">→</i>
            </Link>

            <Link to="/booking/review">
              <span className="profile-tools__number">01</span>

              <div>
                <small>Reservation progress</small>
                <strong>Booking review</strong>
                <p>
                  Return to preserved dates, guests, rates,
                  and expected rewards.
                </p>
              </div>

              <i aria-hidden="true">→</i>
            </Link>

            <Link to="/favorites">
              <span className="profile-tools__number">♡</span>

              <div>
                <small>Your collection</small>
                <strong>Favorite properties</strong>
                <p>
                  Revisit saved properties and continue
                  comparing stays.
                </p>
              </div>

              <i aria-hidden="true">→</i>
            </Link>

            <Link to="/contact">
              <span className="profile-tools__number">?</span>

              <div>
                <small>Member assistance</small>
                <strong>Contact management</strong>
                <p>
                  Ask about properties, bookings,
                  accessibility, rewards, or your account.
                </p>
              </div>

              <i aria-hidden="true">→</i>
            </Link>
          </div>
        </section>
      </section>
    </PlatformPage>
  )
}

export default ProfilePage
