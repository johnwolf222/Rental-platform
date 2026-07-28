import { useState } from 'react'
import { Link } from 'react-router'
import PlatformPage from '../components/layout/PlatformPage'
import { useAuth } from '../context/AuthContext'
import { getPropertyById } from '../data/properties'
import {
  clearBookingIntent,
  getBookingIntent,
} from '../lib/bookingIntent'
import './AccessPage.css'

const currencyFormatter = new Intl.NumberFormat(
  'en-US',
  {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  },
)

function formatDate(dateValue: string) {
  return new Date(
    `${dateValue}T12:00:00`,
  ).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function BookingReviewPage() {
  const { user } = useAuth()
  const [intent, setIntent] = useState(() =>
    getBookingIntent(),
  )

  const property = intent
    ? getPropertyById(intent.propertyId)
    : undefined

  const handleClear = () => {
    clearBookingIntent()
    setIntent(null)
  }

  return (
    <PlatformPage
      memberNavigation
      eyebrow="Protected booking step"
      title="Booking Review"
      description="Review the property, dates, guests, price snapshot, and reward value preserved before member authentication."
      backLabel="Return to rentals"
      backTo="/"
    >
      <article className="booking-review">
        {!intent || !property ? (
          <>
            <span className="booking-review__eyebrow">
              No pending booking
            </span>

            <h2>Select a stay to continue.</h2>

            <p>
              Choose dates and guests from a property page
              before entering the secure booking flow.
            </p>

            <div className="booking-review__actions">
              <Link to="/">Browse properties</Link>
            </div>
          </>
        ) : (
          <>
            <span className="booking-review__eyebrow">
              Saved booking details
            </span>

            <h2>Review before property terms.</h2>

            <p>
              These values were captured before sign-in
              and will later be validated against live
              availability.
            </p>

            <div className="booking-review__property">
              <img
                src={property.image}
                alt={property.title}
              />

              <div className="booking-review__summary">
                <span className="booking-review__eyebrow">
                  {property.city}, {property.state}
                </span>

                <h3>{property.title}</h3>

                <div className="booking-review__facts">
                  <span>
                    Check-in
                    <strong>
                      {formatDate(intent.checkIn)}
                    </strong>
                  </span>

                  <span>
                    Check-out
                    <strong>
                      {formatDate(intent.checkOut)}
                    </strong>
                  </span>

                  <span>
                    Guests
                    <strong>{intent.guests}</strong>
                  </span>

                  <span>
                    Nights
                    <strong>{intent.nights}</strong>
                  </span>

                  <span>
                    Nightly rate snapshot
                    <strong>
                      {currencyFormatter.format(
                        intent.nightlyRate,
                      )}
                    </strong>
                  </span>

                  <span>
                    Nightly subtotal
                    <strong>
                      {currencyFormatter.format(
                        intent.subtotal,
                      )}
                    </strong>
                  </span>

                  <span>
                    Reward rate snapshot
                    <strong>
                      +{intent.pointsPerNight} points/night
                    </strong>
                  </span>

                  <span>
                    Expected points
                    <strong>
                      +{intent.expectedPoints.toLocaleString(
                        'en-US',
                      )}
                    </strong>
                  </span>
                </div>
              </div>
            </div>

            <div className="booking-review__agreement">
              <strong>
                Membership agreement on file
              </strong>

              <p>
                {user?.firstName}, your accepted Terms
                version is{' '}
                {user?.legalAcceptance.termsVersion}.
                Property-specific rules, fees,
                cancellation terms, and booking conditions
                will require a separate confirmation in
                the next booking phase.
              </p>
            </div>

            <div className="booking-review__actions">
              <Link
                to={`/properties/${property.id}`}
              >
                Return to property
              </Link>

              <button
                type="button"
                onClick={handleClear}
              >
                Clear pending booking
              </button>
            </div>
          </>
        )}
      </article>
    </PlatformPage>
  )
}

export default BookingReviewPage
