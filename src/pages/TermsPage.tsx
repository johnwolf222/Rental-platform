import PlatformPage from '../components/layout/PlatformPage'
import { MEMBERSHIP_TERMS } from '../data/legal'
import './AccessPage.css'

function TermsPage() {
  return (
    <PlatformPage
      eyebrow="Membership agreement"
      title="Terms and Conditions"
      description="The rules governing membership access, property use, bookings, rewards, reviews, and platform conduct."
      backLabel="Return to signup"
      backTo="/signup"
    >
      <article className="legal-document">
        <div className="legal-document__notice">
          Development draft for interface testing. This
          document has not been represented as
          attorney-reviewed and must receive qualified
          legal review before public launch.
        </div>

        <header className="legal-document__header">
          <span className="legal-document__eyebrow">
            Membership Terms
          </span>

          <h2>{MEMBERSHIP_TERMS.title}</h2>

          <div className="legal-document__meta">
            <span>
              Effective: {MEMBERSHIP_TERMS.effectiveDate}
            </span>
            <span>
              Version: {MEMBERSHIP_TERMS.version}
            </span>
          </div>
        </header>

        <div className="legal-document__sections">
          <section>
            <h3>1. Agreement and membership</h3>
            <p>
              By creating an account, accessing member
              features, or using the platform, a member
              confirms that they have reviewed and agreed
              to the current version of these Terms.
              Membership access may be limited, suspended,
              or discontinued when these Terms are
              violated.
            </p>
          </section>

          <section>
            <h3>2. Eligibility and account accuracy</h3>
            <p>
              Members must provide accurate, current, and
              complete registration information and must
              be legally able to enter binding agreements.
              An account may not be transferred, shared,
              impersonated, or used to misrepresent the
              identity of a guest.
            </p>
          </section>

          <section>
            <h3>3. Account security</h3>
            <p>
              Members are responsible for protecting their
              login credentials and promptly reporting
              suspected unauthorized access. Production
              credentials and payment information will be
              handled through approved secure providers.
            </p>
          </section>

          <section>
            <h3>4. Property information and availability</h3>
            <p>
              Listings may include descriptions, images,
              pricing, amenities, guest limits, reward
              values, and availability supplied or
              approved by management. Information may
              change before booking confirmation.
              Availability is not guaranteed until the
              reservation is accepted and confirmed.
            </p>
          </section>

          <section>
            <h3>5. Bookings and property-specific terms</h3>
            <p>
              Each booking will require a separate review
              of property rules, dates, guest information,
              pricing, fees, cancellation terms, and other
              booking conditions. Membership acceptance
              does not replace the required booking
              agreement.
            </p>
          </section>

          <section>
            <h3>6. Payments, deposits, and fees</h3>
            <p>
              Charges may include nightly rates, taxes,
              deposits, cleaning fees, service fees,
              damage-related charges, or other disclosed
              amounts. Final totals must be presented
              before payment authorization. Raw payment
              card details should not be stored by this
              platform.
            </p>
          </section>

          <section>
            <h3>7. Cancellations and refunds</h3>
            <p>
              Cancellation, modification, refund, and
              no-show rules may vary by property and
              reservation. The controlling policy will be
              displayed before the member confirms the
              booking.
            </p>
          </section>

          <section>
            <h3>8. Rewards and points</h3>
            <p>
              Points are promotional membership benefits,
              not cash, currency, or transferable
              property. Reward rates may vary by property.
              The applicable points-per-night rate should
              be saved when a booking is confirmed.
              Management may correct errors, reverse
              ineligible awards, or modify future program
              rules with appropriate notice.
            </p>
          </section>

          <section>
            <h3>9. Member and guest conduct</h3>
            <p>
              Members and their guests must respect
              occupancy limits, property rules, safety
              requirements, neighbors, applicable laws,
              and management instructions. Fraud,
              harassment, unlawful conduct, unauthorized
              parties, property damage, or abusive
              platform use may result in cancellation or
              account termination.
            </p>
          </section>

          <section>
            <h3>10. Reviews and member content</h3>
            <p>
              Reviews may be submitted only after a
              completed stay. Members must provide honest,
              relevant, and lawful content. Management may
              hide or remove content that violates
              platform rules but should not silently alter
              the substance of a member’s original review.
            </p>
          </section>

          <section>
            <h3>11. Communications</h3>
            <p>
              Transactional communications may be used for
              account verification, booking updates,
              safety notices, legal updates, and support.
              Promotional communication consent is
              separate and optional unless otherwise
              permitted by applicable law.
            </p>
          </section>

          <section>
            <h3>12. Platform availability and limitations</h3>
            <p>
              The platform may experience maintenance,
              outages, third-party service interruptions,
              inaccurate availability, or technical
              errors. Production disclaimers, liability
              limitations, dispute procedures, governing
              law, and venue provisions must be finalized
              through legal review before launch.
            </p>
          </section>

          <section>
            <h3>13. Changes and renewed acceptance</h3>
            <p>
              Terms may be updated. When a material change
              occurs, the platform may require members to
              review and affirmatively accept the new
              version before using protected features or
              completing another booking.
            </p>
          </section>
        </div>
      </article>
    </PlatformPage>
  )
}

export default TermsPage
