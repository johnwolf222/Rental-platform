import type { ReactNode } from 'react'
import {
  Link,
  NavLink,
} from 'react-router'
import './PlatformPage.css'
import './MemberAppExperience.css'

type PlatformPageProps = {
  eyebrow: string
  title: string
  description: string
  children?: ReactNode
  backLabel?: string
  backTo?: string
  compact?: boolean
  memberNavigation?: boolean
}

type MemberIconName =
  | 'search'
  | 'heart'
  | 'bell'
  | 'calendar'
  | 'profile'

type MemberNavigationItem = {
  to: string
  label: string
  mobileLabel: string
  icon: MemberIconName
}

const memberNavigationItems: MemberNavigationItem[] = [
  {
    to: '/',
    label: 'Rental Search',
    mobileLabel: 'Search',
    icon: 'search',
  },
  {
    to: '/favorites',
    label: 'Favorites',
    mobileLabel: 'Saved',
    icon: 'heart',
  },
  {
    to: '/notifications',
    label: 'Notifications',
    mobileLabel: 'Alerts',
    icon: 'bell',
  },
  {
    to: '/booking/review',
    label: 'Booking',
    mobileLabel: 'Booking',
    icon: 'calendar',
  },
  {
    to: '/profile',
    label: 'Profile',
    mobileLabel: 'Profile',
    icon: 'profile',
  },
]

function MemberIcon({
  name,
}: {
  name: MemberIconName
}) {
  const shared = {
    width: 19,
    height: 19,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  }

  switch (name) {
    case 'search':
      return (
        <svg {...shared}>
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-4-4" />
        </svg>
      )

    case 'heart':
      return (
        <svg {...shared}>
          <path d="M20.8 4.7a5.5 5.5 0 0 0-7.8 0L12 5.8l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21.4l7.8-7.8 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z" />
        </svg>
      )

    case 'bell':
      return (
        <svg {...shared}>
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
          <path d="M10 21h4" />
        </svg>
      )

    case 'calendar':
      return (
        <svg {...shared}>
          <rect x="3" y="5" width="18" height="16" rx="2" />
          <path d="M16 3v4M8 3v4M3 10h18" />
        </svg>
      )

    case 'profile':
      return (
        <svg {...shared}>
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21a8 8 0 0 1 16 0" />
        </svg>
      )

    default:
      return null
  }
}

function MemberNavigation({
  mobile = false,
}: {
  mobile?: boolean
}) {
  return (
    <nav
      className={`member-app-nav ${
        mobile
          ? 'member-app-nav--mobile'
          : 'member-app-nav--desktop'
      }`}
      aria-label={
        mobile
          ? 'Mobile member navigation'
          : 'Member account navigation'
      }
    >
      {memberNavigationItems.map((item) => (
        <NavLink
          to={item.to}
          end={item.to === '/'}
          key={item.to}
          className={({ isActive }) =>
            isActive ? 'is-active' : undefined
          }
        >
          <span className="member-app-nav__icon">
            <MemberIcon name={item.icon} />

            {item.to === '/notifications' && (
              <i aria-label="2 unread notifications">2</i>
            )}
          </span>

          <span>
            {mobile ? item.mobileLabel : item.label}
          </span>
        </NavLink>
      ))}
    </nav>
  )
}

function PlatformPage({
  eyebrow,
  title,
  description,
  children,
  backLabel = 'Return to rental search',
  backTo = '/',
  compact = false,
  memberNavigation = false,
}: PlatformPageProps) {
  const pageClassName = [
    'platform-page',
    compact ? 'platform-page--compact' : '',
    memberNavigation ? 'platform-page--member' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <main className={pageClassName}>
      <header className="platform-page__header">
        <Link
          className="platform-page__brand"
          to="/"
          aria-label="Return to the rental platform homepage"
        >
          <span
            className="platform-page__brand-mark"
            aria-hidden="true"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m3 11 9-8 9 8" />
              <path d="M5 10v11h14V10M9 21v-7h6v7" />
            </svg>
          </span>

          <span className="platform-page__brand-copy">
            RENTAL
            <strong>PLATFORM</strong>
          </span>
        </Link>

        {memberNavigation && (
          <MemberNavigation />
        )}

        <Link
          className="platform-page__back-link"
          to={backTo}
        >
          {backLabel}

          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M5 12h14" />
            <path d="m14 7 5 5-5 5" />
          </svg>
        </Link>
      </header>

      <section className="platform-page__hero">
        <div className="platform-page__hero-copy">
          <span className="platform-page__eyebrow">
            {eyebrow}
          </span>

          <h1>{title}</h1>
          <p>{description}</p>
        </div>

        {memberNavigation ? (
          <aside
            className="member-app-status"
            aria-label="Member account status"
          >
            <span>
              <i />
              Secure workspace
            </span>

            <strong>Account active</strong>

            <small>
              Reservations, rewards, and account tools
              are protected.
            </small>
          </aside>
        ) : (
          <div
            className="platform-page__seal"
            aria-hidden="true"
          >
            <span>Member</span>
            <strong>Access</strong>
          </div>
        )}
      </section>

      {children && (
        <section className="platform-page__content">
          {children}
        </section>
      )}

      {memberNavigation && (
        <MemberNavigation mobile />
      )}
    </main>
  )
}

export default PlatformPage
