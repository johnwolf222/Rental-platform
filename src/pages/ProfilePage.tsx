import { useNavigate } from 'react-router'
import PlatformPage from '../components/layout/PlatformPage'
import PlatformPlaceholder from '../components/layout/PlatformPlaceholder'
import { useAuth } from '../context/AuthContext'
import './ProfilePage.css'

const memberDateFormatter = new Intl.DateTimeFormat(
  'en-US',
  {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  },
)

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
      eyebrow="Private member account"
      title="Profile & Rewards"
      description="Profile editing, reward progress, previous stays, saved properties, recent views, payment methods, notification preferences, and security settings will live here."
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

      <PlatformPlaceholder
        title="The complete member account center."
        description="The next profile phase will introduce the approved 1,400-point and 2,800-point rewards, the permanent rewards ledger, completed stays, and member settings."
      />
    </PlatformPage>
  )
}

export default ProfilePage
