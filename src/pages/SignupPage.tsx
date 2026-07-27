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
import {
  MEMBERSHIP_TERMS,
  PRIVACY_POLICY,
} from '../data/legal'
import './AccessPage.css'

type ReturnState = {
  from?: {
    pathname?: string
  }
}

function SignupPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, signUp } = useAuth()

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] =
    useState('')
  const [marketingOptIn, setMarketingOptIn] =
    useState(false)
  const [termsAccepted, setTermsAccepted] =
    useState(false)
  const [termsViewedAt, setTermsViewedAt] =
    useState('')
  const [privacyViewedAt, setPrivacyViewedAt] =
    useState('')
  const [error, setError] = useState('')

  const destination =
    (location.state as ReturnState | null)?.from?.pathname ??
    '/profile'

  const documentsReviewed =
    Boolean(termsViewedAt) &&
    Boolean(privacyViewedAt)

  const formIsValid =
    firstName.trim().length > 1 &&
    lastName.trim().length > 1 &&
    email.includes('@') &&
    phone.trim().length >= 7 &&
    password.length >= 8 &&
    password === confirmPassword &&
    documentsReviewed &&
    termsAccepted

  if (user) {
    return <Navigate to={destination} replace />
  }

  const handleSubmit = (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault()
    setError('')

    if (!formIsValid) {
      setError(
        'Complete every required field, review both legal documents, and confirm your agreement.',
      )
      return
    }

    const result = signUp({
      firstName,
      lastName,
      email,
      phone,
      marketingOptIn,
      termsViewedAt,
      privacyViewedAt,
    })

    if (!result.success) {
      setError(
        result.error ??
          'The account could not be created.',
      )
      return
    }

    navigate(destination, { replace: true })
  }

  return (
    <PlatformPage
      eyebrow="Begin your membership"
      title="Create an Account"
      description="Create your private member profile, review the current legal documents, and record your agreement before entering the platform."
      backLabel="Already a member?"
      backTo="/login"
    >
      <div className="access-grid">
        <section className="access-card">
          <header className="access-card__heading">
            <span>Member registration</span>
            <h2>Your membership begins here.</h2>
            <p>
              Required legal acceptance is recorded with
              the exact document versions and acceptance
              time.
            </p>
          </header>

          <form
            className="access-form"
            onSubmit={handleSubmit}
          >
            <div className="access-form__row">
              <label className="access-field">
                <span>First name</span>
                <input
                  type="text"
                  value={firstName}
                  onChange={(event) =>
                    setFirstName(event.target.value)
                  }
                  autoComplete="given-name"
                  required
                />
              </label>

              <label className="access-field">
                <span>Last name</span>
                <input
                  type="text"
                  value={lastName}
                  onChange={(event) =>
                    setLastName(event.target.value)
                  }
                  autoComplete="family-name"
                  required
                />
              </label>
            </div>

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
              <span>Phone number</span>
              <input
                type="tel"
                value={phone}
                onChange={(event) =>
                  setPhone(event.target.value)
                }
                autoComplete="tel"
                required
              />
            </label>

            <div className="access-form__row">
              <label className="access-field">
                <span>Password</span>
                <input
                  type="password"
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  autoComplete="new-password"
                  minLength={8}
                  required
                />
                <small>
                  Use at least eight characters.
                </small>
              </label>

              <label className="access-field">
                <span>Confirm password</span>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(event) =>
                    setConfirmPassword(
                      event.target.value,
                    )
                  }
                  autoComplete="new-password"
                  minLength={8}
                  required
                />
              </label>
            </div>

            <section className="access-review">
              <div className="access-review__heading">
                <strong>Review required documents</strong>
                <span>
                  {documentsReviewed
                    ? 'Review recorded'
                    : 'Action required'}
                </span>
              </div>

              <p>
                Open both documents before the agreement
                checkbox becomes available.
              </p>

              <div className="access-review__links">
                <Link
                  to="/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={
                    termsViewedAt ? 'is-reviewed' : ''
                  }
                  onClick={() =>
                    setTermsViewedAt(
                      new Date().toISOString(),
                    )
                  }
                >
                  {termsViewedAt
                    ? 'Terms reviewed ✓'
                    : 'Review Terms and Conditions'}
                </Link>

                <Link
                  to="/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={
                    privacyViewedAt ? 'is-reviewed' : ''
                  }
                  onClick={() =>
                    setPrivacyViewedAt(
                      new Date().toISOString(),
                    )
                  }
                >
                  {privacyViewedAt
                    ? 'Privacy reviewed ✓'
                    : 'Review Privacy Policy'}
                </Link>
              </div>

              <p>
                Terms version: {MEMBERSHIP_TERMS.version}
                <br />
                Privacy version: {PRIVACY_POLICY.version}
              </p>
            </section>

            <label
              className={`access-consent ${
                documentsReviewed
                  ? ''
                  : 'is-disabled'
              }`}
            >
              <input
                type="checkbox"
                checked={termsAccepted}
                disabled={!documentsReviewed}
                onChange={(event) =>
                  setTermsAccepted(
                    event.target.checked,
                  )
                }
                required
              />

              <span>
                <strong>
                  Required membership agreement.
                </strong>{' '}
                I have reviewed, read, and agree to
                the{' '}
                <Link to="/terms" target="_blank">
                  Terms and Conditions
                </Link>{' '}
                and acknowledge the{' '}
                <Link to="/privacy" target="_blank">
                  Privacy Policy
                </Link>
                .
              </span>
            </label>

            <label className="access-consent">
              <input
                type="checkbox"
                checked={marketingOptIn}
                onChange={(event) =>
                  setMarketingOptIn(
                    event.target.checked,
                  )
                }
              />

              <span>
                <strong>Optional marketing consent.</strong>{' '}
                Send me property announcements,
                reward offers, and promotional
                messages. This is not required for
                membership.
              </span>
            </label>

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
              disabled={!formIsValid}
            >
              Create member account
            </button>
          </form>

          <p className="access-switch">
            Already registered?{' '}
            <Link
              to="/login"
              state={location.state}
            >
              Sign in
            </Link>
          </p>
        </section>

        <aside className="access-aside">
          <span className="access-aside__eyebrow">
            Recorded protection
          </span>

          <h2>Clear consent before access.</h2>

          <p>
            Membership consent and promotional consent
            remain separate so members can make an
            informed choice.
          </p>

          <div className="access-aside__list">
            <span>
              <strong>Versioned acceptance</strong>
              The precise Terms and Privacy versions are
              stored with the account.
            </span>

            <span>
              <strong>Acceptance timestamp</strong>
              The confirmation time is recorded for later
              audit and migration.
            </span>

            <span>
              <strong>Separate booking terms</strong>
              Property rules and cancellation terms will
              require another confirmation before final
              booking.
            </span>
          </div>

          <div className="access-aside__notice">
            Prototype notice: passwords are not stored by
            this frontend demonstration. Production
            authentication will be handled securely by
            Supabase.
          </div>
        </aside>
      </div>
    </PlatformPage>
  )
}

export default SignupPage
