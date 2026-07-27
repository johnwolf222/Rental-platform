import PlatformPage from '../components/layout/PlatformPage'
import { PRIVACY_POLICY } from '../data/legal'
import './AccessPage.css'

function PrivacyPage() {
  return (
    <PlatformPage
      eyebrow="Information practices"
      title="Privacy Policy"
      description="How member, booking, communication, payment-provider, and platform-usage information may be handled."
      backLabel="Return to signup"
      backTo="/signup"
    >
      <article className="legal-document">
        <div className="legal-document__notice">
          Development draft for interface testing. Data
          practices, retention periods, service providers,
          contact details, and jurisdiction-specific
          rights must be verified before launch.
        </div>

        <header className="legal-document__header">
          <span className="legal-document__eyebrow">
            Privacy notice
          </span>

          <h2>{PRIVACY_POLICY.title}</h2>

          <div className="legal-document__meta">
            <span>
              Effective: {PRIVACY_POLICY.effectiveDate}
            </span>
            <span>
              Version: {PRIVACY_POLICY.version}
            </span>
          </div>
        </header>

        <div className="legal-document__sections">
          <section>
            <h3>1. Information members provide</h3>
            <p>
              The platform may collect names, email
              addresses, phone numbers, account
              preferences, booking details, guest
              information, messages, reviews, and other
              information a member submits.
            </p>
          </section>

          <section>
            <h3>2. Booking and property activity</h3>
            <p>
              Information may include properties viewed or
              saved, selected dates, guest counts,
              reservations, completed stays, reward
              activity, cancellation history, and
              property-related support requests.
            </p>
          </section>

          <section>
            <h3>3. How information may be used</h3>
            <ul>
              <li>Provide and maintain member accounts.</li>
              <li>Process and manage booking requests.</li>
              <li>Calculate and administer rewards.</li>
              <li>Send transactional and safety notices.</li>
              <li>Respond to member support requests.</li>
              <li>Prevent fraud, misuse, and security threats.</li>
              <li>Improve platform performance and usability.</li>
            </ul>
          </section>

          <section>
            <h3>4. Service providers and management</h3>
            <p>
              Information may be shared with property
              management, payment processors, hosting
              providers, authentication providers,
              communication services, analytics services,
              or other vendors necessary to operate the
              platform. Providers should receive only the
              information required for their role.
            </p>
          </section>

          <section>
            <h3>5. Payment information</h3>
            <p>
              Production payment methods should be
              tokenized and handled by an approved payment
              provider. The platform should not directly
              store complete payment-card numbers,
              security codes, or other raw card
              credentials.
            </p>
          </section>

          <section>
            <h3>6. Browser storage and prototype data</h3>
            <p>
              During frontend development, this prototype
              uses browser local storage for temporary
              member profiles and session storage for
              pending booking details. Clearing browser
              data may remove these prototype records.
              Production data will require secure
              server-side storage and access controls.
            </p>
          </section>

          <section>
            <h3>7. Retention</h3>
            <p>
              Production retention periods should reflect
              booking administration, legal obligations,
              fraud prevention, dispute handling, tax or
              accounting requirements, and legitimate
              operational needs. Data that is no longer
              required should be deleted or de-identified.
            </p>
          </section>

          <section>
            <h3>8. Security</h3>
            <p>
              Reasonable administrative, technical, and
              organizational safeguards should protect
              personal information. No system can
              guarantee absolute security, and production
              security practices must be tested and
              documented.
            </p>
          </section>

          <section>
            <h3>9. Member choices</h3>
            <p>
              Members should be able to review and update
              account information, control optional
              promotional communications, and submit
              applicable privacy requests. Specific rights
              depend on location and must be finalized
              through legal review.
            </p>
          </section>

          <section>
            <h3>10. Children</h3>
            <p>
              The service is not intended for children who
              are not legally able to create a membership
              or enter booking agreements. Production age
              requirements must be stated consistently
              with applicable law.
            </p>
          </section>

          <section>
            <h3>11. Policy updates</h3>
            <p>
              Material Privacy Policy changes may be
              communicated through the platform or by
              email. The active version and effective date
              should remain visible, and renewed
              acknowledgement may be required when
              appropriate.
            </p>
          </section>
        </div>
      </article>
    </PlatformPage>
  )
}

export default PrivacyPage
