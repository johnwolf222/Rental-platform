import type { ReactNode } from 'react'
import { Link } from 'react-router'
import './PlatformPage.css'

type PlatformPageProps = {
  eyebrow: string
  title: string
  description: string
  children?: ReactNode
  backLabel?: string
  backTo?: string
}

function PlatformPage({
  eyebrow,
  title,
  description,
  children,
  backLabel = 'Return to rental search',
  backTo = '/',
}: PlatformPageProps) {
  return (
    <main className="platform-page">
      <header className="platform-page__header">
        <Link
          className="platform-page__brand"
          to="/"
          aria-label="Return to the rental platform homepage"
        >
          <span className="platform-page__brand-mark" aria-hidden="true">
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

        <Link className="platform-page__back-link" to={backTo}>
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
          <span className="platform-page__eyebrow">{eyebrow}</span>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>

        <div className="platform-page__seal" aria-hidden="true">
          <span>Member</span>
          <strong>Access</strong>
        </div>
      </section>

      {children && (
        <section className="platform-page__content">{children}</section>
      )}
    </main>
  )
}

export default PlatformPage
