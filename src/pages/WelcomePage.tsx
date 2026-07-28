import {
  Navigate,
  useNavigate,
} from 'react-router'
import { useAuth } from '../context/AuthContext'
import {
  completeWelcomeFlow,
  getWelcomeDestination,
  hasPendingWelcome,
} from '../lib/welcomeFlow'
import './WelcomePage.css'

function WelcomePage() {
  const navigate = useNavigate()
  const { user } = useAuth()

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (!hasPendingWelcome()) {
    return <Navigate to="/profile" replace />
  }

  const destination = getWelcomeDestination()

  const leaveWelcome = (
    nextDestination: string,
  ) => {
    completeWelcomeFlow()

    navigate(nextDestination, {
      replace: true,
    })
  }

  const primaryLabel =
    destination === '/booking/review'
      ? 'Continue your booking'
      : 'Enter member home'

  return (
    <main className="welcome-page">
      <img
        className="welcome-page__confetti welcome-page__confetti--front"
        src="/welcome/confetti.png"
        alt=""
        aria-hidden="true"
        draggable={false}
      />

      <img
        className="welcome-page__confetti welcome-page__confetti--back"
        src="/welcome/confetti.png"
        alt=""
        aria-hidden="true"
        draggable={false}
      />

      <div className="welcome-page__shell">
        <header className="welcome-page__header">
          <button
            type="button"
            className="welcome-brand"
            onClick={() => leaveWelcome('/')}
            aria-label="Return to Rental Platform"
          >
            <span className="welcome-brand__mark">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="m3 11 9-8 9 8" />
                <path d="M5 10v11h14V10M9 21v-7h6v7" />
              </svg>
            </span>

            <span className="welcome-brand__copy">
              RENTAL
              <strong>PLATFORM</strong>
            </span>
          </button>

          <button
            type="button"
            className="welcome-page__close"
            onClick={() =>
              leaveWelcome(destination)
            }
            aria-label="Close welcome experience"
          >
            <svg
              width="23"
              height="23"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.9"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        </header>

        <section className="welcome-page__content">
          <div className="welcome-page__copy">
            <div className="welcome-page__kicker">
              <span className="welcome-page__home-icon">
                <svg
                  width="25"
                  height="25"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="m3 11 9-8 9 8" />
                  <path d="M5 10v11h14V10M9 21v-7h6v7" />
                  <path d="M9.5 8.5c1-1 2.5-.5 2.5.7 0-1.2 1.5-1.7 2.5-.7 1.3 1.4-.2 3.1-2.5 4.7-2.3-1.6-3.8-3.3-2.5-4.7Z" />
                </svg>
              </span>

              <span>Home away from home.</span>
            </div>

            <p className="welcome-page__eyebrow">
              Membership confirmed
            </p>

            <h1>
              Welcome home,
              <span>{user.firstName}!</span>
            </h1>

            <p className="welcome-page__message">
              Congratulations on joining. You have
              taken a meaningful step toward simpler
              stays, stronger rewards, and a more
              personal rental experience.
            </p>

            <div className="welcome-page__actions">
              <button
                type="button"
                className="welcome-page__primary"
                onClick={() =>
                  leaveWelcome(destination)
                }
              >
                <svg
                  width="21"
                  height="21"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.9"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="m3 11 9-8 9 8" />
                  <path d="M5 10v11h14V10M9 21v-7h6v7" />
                </svg>

                {primaryLabel}
              </button>

              <button
                type="button"
                className="welcome-page__secondary"
                onClick={() => leaveWelcome('/')}
              >
                Explore properties

                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.9"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M5 12h14M14 7l5 5-5 5" />
                </svg>
              </button>
            </div>

            <div className="welcome-page__family">
              <span aria-hidden="true">♥</span>

              <p>
                You are not just a user.
                <strong>
                  You are part of the family now.
                </strong>
              </p>
            </div>
          </div>

          <div className="welcome-page__visual">
            <div
              className="welcome-page__visual-ring"
              aria-hidden="true"
            />

            <img
              src="/welcome/welcome.png"
              alt="A new Rental Platform member enjoying the mobile experience"
              draggable={false}
            />

            <div className="welcome-page__reward-chip">
              <span>Member status</span>
              <strong>Welcome reward ready</strong>
            </div>
          </div>
        </section>

        <footer className="welcome-page__footer">
          <span>
            Membership created securely
          </span>

          <span>
            Terms acceptance recorded
          </span>

          <span>
            Rewards journey activated
          </span>
        </footer>
      </div>
    </main>
  )
}

export default WelcomePage
