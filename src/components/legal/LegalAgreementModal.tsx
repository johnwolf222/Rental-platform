import {
  useEffect,
  useRef,
  useState,
  type UIEvent,
} from 'react'
import { createPortal } from 'react-dom'
import {
  MEMBERSHIP_TERMS,
  PRIVACY_POLICY,
} from '../../data/legal'

type LegalTab = 'terms' | 'privacy'

type LegalAgreementModalProps = {
  open: boolean
  onClose: () => void
  onReviewed: () => void
}

type LegalSection = {
  title: string
  body: string
}

const termsSections: LegalSection[] = [
  {
    title: '1. Agreement and membership',
    body:
      'Creating an account or using member features confirms agreement with the active membership terms. Access may be limited or suspended when these requirements are violated.',
  },
  {
    title: '2. Eligibility and account accuracy',
    body:
      'Members must provide accurate and current information, be legally able to enter binding agreements, and may not transfer, share, or misrepresent an account.',
  },
  {
    title: '3. Account security',
    body:
      'Members are responsible for protecting their credentials and promptly reporting suspected unauthorized access or misuse.',
  },
  {
    title: '4. Property information and availability',
    body:
      'Listings may include descriptions, images, pricing, amenities, capacity, rewards, and availability approved by management. Information may change before a booking is confirmed.',
  },
  {
    title: '5. Bookings and property-specific conditions',
    body:
      'Each booking requires a separate review of dates, guests, property rules, pricing, fees, cancellation terms, and other reservation conditions.',
  },
  {
    title: '6. Payments, deposits, and fees',
    body:
      'Final charges may include nightly rates, taxes, cleaning fees, service fees, deposits, or other disclosed amounts. Complete payment details must appear before authorization.',
  },
  {
    title: '7. Cancellations and refunds',
    body:
      'Cancellation, modification, refund, and no-show policies may vary by property. The policy displayed during booking controls that reservation.',
  },
  {
    title: '8. Rewards and points',
    body:
      'Reward points are promotional membership benefits and are not cash or transferable currency. The applicable points-per-night rate is preserved when a qualifying booking is confirmed.',
  },
  {
    title: '9. Member and guest conduct',
    body:
      'Members and guests must follow occupancy limits, safety requirements, property rules, applicable laws, and reasonable management instructions.',
  },
  {
    title: '10. Reviews and member content',
    body:
      'Reviews may be submitted only following completed stays. Content must be honest, relevant, lawful, and consistent with platform standards.',
  },
  {
    title: '11. Communications',
    body:
      'Transactional messages may be sent for verification, booking activity, legal notices, security, and support. Promotional consent remains separate and optional.',
  },
  {
    title: '12. Platform availability',
    body:
      'The platform may experience maintenance, service interruptions, technical errors, or inaccurate availability. Final production limitations require legal review.',
  },
  {
    title: '13. Updated terms',
    body:
      'Material updates may require members to review and affirmatively accept a new version before continuing to protected features or future bookings.',
  },
]

const privacySections: LegalSection[] = [
  {
    title: '1. Information provided by members',
    body:
      'The platform may collect names, email addresses, telephone numbers, preferences, booking details, guest information, messages, reviews, and other submitted information.',
  },
  {
    title: '2. Property and booking activity',
    body:
      'Records may include viewed or saved properties, selected dates, guest counts, reservations, completed stays, reward activity, and support requests.',
  },
  {
    title: '3. How information may be used',
    body:
      'Information may be used to operate accounts, manage bookings, administer rewards, provide support, prevent misuse, send transactional notices, and improve the platform.',
  },
  {
    title: '4. Management and service providers',
    body:
      'Necessary information may be shared with property management, hosting, authentication, communication, payment, analytics, or other approved operational providers.',
  },
  {
    title: '5. Payment information',
    body:
      'Production payment information should be tokenized and processed by an approved provider. Complete card numbers and security codes should not be stored directly by this platform.',
  },
  {
    title: '6. Browser storage during development',
    body:
      'This prototype uses local browser storage for temporary member profiles and session storage for pending booking information. Clearing browser data may remove those records.',
  },
  {
    title: '7. Retention',
    body:
      'Production retention periods should reflect booking administration, accounting, legal obligations, fraud prevention, disputes, and legitimate operational needs.',
  },
  {
    title: '8. Security',
    body:
      'Reasonable administrative and technical safeguards should protect personal information, although no electronic system can guarantee absolute security.',
  },
  {
    title: '9. Member choices',
    body:
      'Members should be able to update account information, control optional marketing messages, and submit privacy requests available under applicable law.',
  },
  {
    title: '10. Children',
    body:
      'The service is not intended for individuals who are not legally able to create a membership or enter a booking agreement.',
  },
  {
    title: '11. Policy updates',
    body:
      'Material policy changes may be communicated through the platform or email. The active version and effective date should remain available to members.',
  },
]

function LegalAgreementModal({
  open,
  onClose,
  onReviewed,
}: LegalAgreementModalProps) {
  const [activeTab, setActiveTab] =
    useState<LegalTab>('terms')

  const [readTabs, setReadTabs] = useState({
    terms: false,
    privacy: false,
  })

  const scrollAreaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) {
      return
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [open, onClose])

  useEffect(() => {
    if (!open) {
      return
    }

    scrollAreaRef.current?.scrollTo({
      top: 0,
      behavior: 'instant',
    })
  }, [activeTab, open])

  if (!open) {
    return null
  }

  const sections =
    activeTab === 'terms'
      ? termsSections
      : privacySections

  const documentData =
    activeTab === 'terms'
      ? MEMBERSHIP_TERMS
      : PRIVACY_POLICY

  const handleScroll = (
    event: UIEvent<HTMLDivElement>,
  ) => {
    const element = event.currentTarget

    const reachedBottom =
      element.scrollHeight -
        element.scrollTop -
        element.clientHeight <
      28

    if (!reachedBottom) {
      return
    }

    setReadTabs((current) => ({
      ...current,
      [activeTab]: true,
    }))
  }

  const bothDocumentsRead =
    readTabs.terms && readTabs.privacy

  return createPortal(
    <div
      className="legal-modal-overlay"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose()
        }
      }}
    >
      <section
        className="legal-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="legal-modal-title"
      >
        <header className="legal-modal__header">
          <div>
            <span>Required membership review</span>
            <h2 id="legal-modal-title">
              Terms & Privacy
            </h2>
          </div>

          <button
            type="button"
            className="legal-modal__close"
            onClick={onClose}
            aria-label="Close legal document"
          >
            ×
          </button>
        </header>

        <nav
          className="legal-modal__tabs"
          aria-label="Legal documents"
        >
          <button
            type="button"
            className={
              activeTab === 'terms'
                ? 'is-active'
                : ''
            }
            onClick={() => setActiveTab('terms')}
          >
            Terms and Conditions
            {readTabs.terms && <span>✓</span>}
          </button>

          <button
            type="button"
            className={
              activeTab === 'privacy'
                ? 'is-active'
                : ''
            }
            onClick={() => setActiveTab('privacy')}
          >
            Privacy Policy
            {readTabs.privacy && <span>✓</span>}
          </button>
        </nav>

        <div
          ref={scrollAreaRef}
          className="legal-modal__content"
          onScroll={handleScroll}
        >
          <div className="legal-modal__notice">
            Development draft for interface testing.
            Qualified legal review is required before
            public launch.
          </div>

          <div className="legal-modal__document-heading">
            <span>
              Effective: {documentData.effectiveDate}
            </span>

            <h3>{documentData.title}</h3>

            <small>
              Version: {documentData.version}
            </small>
          </div>

          <div className="legal-modal__sections">
            {sections.map((section) => (
              <section key={section.title}>
                <h4>{section.title}</h4>
                <p>{section.body}</p>
              </section>
            ))}
          </div>

          <div className="legal-modal__end">
            End of {activeTab === 'terms'
              ? 'Terms and Conditions'
              : 'Privacy Policy'}
          </div>
        </div>

        <footer className="legal-modal__footer">
          <div>
            <span
              className={
                readTabs.terms ? 'is-complete' : ''
              }
            >
              Terms {readTabs.terms ? 'reviewed' : 'not completed'}
            </span>

            <span
              className={
                readTabs.privacy ? 'is-complete' : ''
              }
            >
              Privacy {readTabs.privacy ? 'reviewed' : 'not completed'}
            </span>
          </div>

          <button
            type="button"
            disabled={!bothDocumentsRead}
            onClick={onReviewed}
          >
            {bothDocumentsRead
              ? 'I have read both documents'
              : 'Review both documents to continue'}
          </button>
        </footer>
      </section>
    </div>,
    document.body,
  )
}

export default LegalAgreementModal
