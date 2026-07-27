import {
  useState,
  type FormEvent,
} from 'react'
import {
  Link,
  Navigate,
  useLocation,
  useNavigate,
} from 'react-router'
import PlatformPage from '../components/layout/PlatformPage'
import { useAuth } from '../context/AuthContext'
import { getBookingIntent } from '../lib/bookingIntent'
import './AccessPage.css'

type ReturnState = {
  from?: {
    pathname?: string
  }
}

function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, signIn } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const pendingBooking = getBookingIntent()

  const destination =
    (location.state as ReturnState | null)?.from?.pathname ??
    (pendingBooking
      ? '/booking/review'
      : '/profile')

  if (user) {
    return <Navigate to={destination} replace />
  }

  const handleSubmit = (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault()
    setError('')

    const result = signIn({
      email,
      password,
    })

    if (!result.success) {
      setError(
        result.error ??
          'The account could not be opened.',
      )
      return
    }

    navigate(destination, { replace: true })
  }

  return (
    <PlatformPage
      eyebrow="Members only"
      title="Member Login"
      description="Return to your private rental account, saved properties, rewards, notifications, and pending booking details."
      backLabel="Create an account"
      backTo="/signup"
      compact
    >
      <div className="access-grid">
        <section className="access-card">
          <header className="access-card__heading">
            <span>Secure member access</span>
            <h2>Welcome back.</h2>
            <p>
              Sign in with an account created in this
              browser during the current prototype phase.
            </p>
          </header>

          <form
            className="access-form"
            onSubmit={handleSubmit}
          >
            <label className="access-field">
              <span>Email address</span>
              <input
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                autoComplete="email"
                required
              />
            </label>

            <label className="access-field">
              <span>Password</span>
              <input
                type="password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                autoComplete="current-password"
                minLength={8}
                required
              />
              <small>
                Prototype accounts require eight or more
                characters, but no password is stored.
              </small>
            </label>

            {pendingBooking && (
              <div className="access-review">
                <div className="access-review__heading">
                  <strong>Booking details preserved</strong>
                  <span>{pendingBooking.nights} nights</span>
                </div>

                <p>
                  After sign-in, you will return to the
                  saved booking review for{' '}
                  {pendingBooking.propertyTitle}.
                </p>
              </div>
            )}

            {error && (
              <div
                className="access-error"
                role="alert"
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              className="access-submit"
              disabled={
                !email.includes('@') ||
                password.length < 8
              }
            >
              Enter member account
            </button>
          </form>

          <p className="access-switch">
            Need a membership?{' '}
            <Link
              to="/signup"
              state={location.state}
            >
              Create an account
            </Link>
          </p>
        </section>

        <aside className="access-aside">
          <span className="access-aside__eyebrow">
            Member continuity
          </span>

          <h2>Your activity follows you.</h2>

          <p>
            Authentication will eventually restore
            bookings, saved properties, reward history,
            review requests, and account preferences.
          </p>

          <div className="access-aside__list">
            <span>
              <strong>Protected member routes</strong>
              Favorites, notifications, profiles, and
              booking review now require an account.
            </span>

            <span>
              <strong>Pending booking recovery</strong>
              Selected dates, guests, price, and reward
              values are preserved through sign-in.
            </span>

            <span>
              <strong>Legal acceptance on file</strong>
              Every prototype member account contains a
              versioned membership acceptance record.
            </span>
          </div>

          <div className="access-aside__notice">
            This is temporary frontend authentication for
            interface development. It is not production
            security.
          </div>
        </aside>
      </div>
    </PlatformPage>
  )
}

export default LoginPage
