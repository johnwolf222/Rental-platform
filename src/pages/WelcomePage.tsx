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
      ? 'Continue booking'
      : 'Welcome home'

  return (
    <main className="welcome-page">
      <section
        className="welcome-card"
        aria-labelledby="welcome-card-title"
      >
        <div
          className="welcome-card__green-field"
          aria-hidden="true"
        />

        <img
          className="welcome-card__art"
          src="/welcome/welcome.png"
          alt=""
          aria-hidden="true"
          draggable={false}
        />

        <img
          className="welcome-card__confetti"
          src="/welcome/confetti.png"
          alt=""
          aria-hidden="true"
          draggable={false}
        />

        <button
          type="button"
          className="welcome-card__close"
          onClick={() =>
            leaveWelcome(destination)
          }
          aria-label="Close welcome message"
        >
          <svg
            width="30"
            height="30"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <path d="M6 6l12 12M18 6 6 18" />
          </svg>
        </button>

        <div className="welcome-card__copy">
          <div className="welcome-card__kicker">
            <svg
              width="36"
              height="36"
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

            <span>home away from home.</span>
          </div>

          <h1 id="welcome-card-title">
            Welcome
            <span>home!</span>
          </h1>

          <p className="welcome-card__message">
            Congratulations on joining,{' '}
            <strong>{user.firstName}!</strong> You’ve
            taken a great step toward simpler stays,
            meaningful rewards, and a rental experience
            that feels more personal.
          </p>

          <div className="welcome-card__actions">
            <button
              type="button"
              className="welcome-card__primary"
              onClick={() =>
                leaveWelcome(destination)
              }
            >
              <svg
                width="29"
                height="29"
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
              className="welcome-card__secondary"
              onClick={() => leaveWelcome('/')}
            >
              <svg
                width="25"
                height="25"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.9"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M7 8h10v7a5 5 0 0 1-10 0V8Z" />
                <path d="M17 10h1.5a2.5 2.5 0 0 1 0 5H17" />
                <path d="M6 21h12" />
              </svg>

              Get comfy
            </button>
          </div>

          <div className="welcome-card__family">
            <span aria-hidden="true">♥</span>

            <p>
              You’re not just a user.
              <strong>
                You’re part of the family now.
              </strong>
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}

export default WelcomePage
