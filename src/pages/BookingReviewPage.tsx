import { creditRewardPoints } from '../lib/rewards'
import { createNotification } from '../lib/notifications'
import {
  AVAILABILITY_UPDATED_EVENT,
  checkPropertyAvailability,
  formatUnavailableRange,
  getPropertyUnavailableRanges,
  getTodayDateValue,
} from '../lib/availability'
import {
  useEffect,
  useMemo,
  useState,
} from 'react'
import {
  Link,
  useNavigate,
} from 'react-router'
import PlatformPage from '../components/layout/PlatformPage'
import { useAuth } from '../context/AuthContext'
import { getPropertyById } from '../data/properties'
import {
  clearBookingIntent,
  getBookingIntent,
} from '../lib/bookingIntent'
import {
  createReservation,
  getReservations,
  RESERVATIONS_UPDATED_EVENT,
  type ReservationPaymentMethod,
  type ReservationPaymentPlan,
} from '../lib/reservations'
import '../components/booking/BookingAvailability.css'
import './StayConfirmationExperience.css'

const currencyFormatter =
  new Intl.NumberFormat(
    'en-US',
    {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    },
  )

function formatDate(dateValue: string) {
  if (!dateValue) {
    return 'Select date'
  }

  return new Date(
    `${dateValue}T12:00:00`,
  ).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

function calculateNights(
  checkIn: string,
  checkOut: string,
) {
  if (!checkIn || !checkOut) {
    return 0
  }

  const startDate = new Date(
    `${checkIn}T12:00:00`,
  )

  const endDate = new Date(
    `${checkOut}T12:00:00`,
  )

  const difference =
    endDate.getTime() - startDate.getTime()

  if (
    !Number.isFinite(difference) ||
    difference <= 0
  ) {
    return 0
  }

  return Math.ceil(
    difference / 86_400_000,
  )
}

function PaymentIcon({
  method,
}: {
  method: ReservationPaymentMethod
}) {
  if (method === 'paypal') {
    return <strong aria-hidden="true">P</strong>
  }

  if (method === 'apple-pay') {
    return <strong aria-hidden="true">●</strong>
  }

  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect
        x="2.5"
        y="5"
        width="19"
        height="14"
        rx="2.5"
      />
      <path d="M2.5 10h19" />
      <path d="M6 15h4" />
    </svg>
  )
}

function BookingReviewPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [intent] = useState(() =>
    getBookingIntent(),
  )

  const property = intent
    ? getPropertyById(intent.propertyId)
    : undefined

  const heroImage = property?.image

  const [checkIn, setCheckIn] = useState(
    intent?.checkIn ?? '',
  )

  const [checkOut, setCheckOut] = useState(
    intent?.checkOut ?? '',
  )

  const [guests, setGuests] = useState(
    intent?.guests ?? 1,
  )

  const [paymentPlan, setPaymentPlan] =
    useState<ReservationPaymentPlan>(
      'pay-in-full',
    )

  const [
    paymentMethod,
    setPaymentMethod,
  ] =
    useState<ReservationPaymentMethod>(
      'card',
    )

  const [
    acceptedConfirmation,
    setAcceptedConfirmation,
  ] = useState(false)

  const [availabilityError, setAvailabilityError] =
    useState('')
  const [availabilityVersion, setAvailabilityVersion] =
    useState(0)

  useEffect(() => {
    const refreshAvailability = () =>
      setAvailabilityVersion(
        (currentVersion) => currentVersion + 1,
      )

    window.addEventListener(
      AVAILABILITY_UPDATED_EVENT,
      refreshAvailability,
    )
    window.addEventListener(
      RESERVATIONS_UPDATED_EVENT,
      refreshAvailability,
    )
    window.addEventListener(
      'storage',
      refreshAvailability,
    )

    return () => {
      window.removeEventListener(
        AVAILABILITY_UPDATED_EVENT,
        refreshAvailability,
      )
      window.removeEventListener(
        RESERVATIONS_UPDATED_EVENT,
        refreshAvailability,
      )
      window.removeEventListener(
        'storage',
        refreshAvailability,
      )
    }
  }, [])

  const nights = calculateNights(
    checkIn,
    checkOut,
  )

  const financials = useMemo(() => {
    if (!property || !intent || nights === 0) {
      return {
        lodgingSubtotal: 0,
        cleaningFee: 0,
        serviceFee: 0,
        estimatedTaxes: 0,
        totalInvestment: 0,
        dueToday: 0,
        remainingBalance: 0,
        expectedPoints: 0,
      }
    }

    const lodgingSubtotal =
      intent.nightlyRate * nights

    const cleaningFee = Math.max(
      95,
      Math.round(intent.nightlyRate * 0.34),
    )

    const serviceFee = Math.round(
      lodgingSubtotal * 0.08,
    )

    const estimatedTaxes = Math.round(
      (
        lodgingSubtotal +
        cleaningFee +
        serviceFee
      ) * 0.075,
    )

    const totalInvestment =
      lodgingSubtotal +
      cleaningFee +
      serviceFee +
      estimatedTaxes

    const dueToday =
      paymentPlan === 'split-stay'
        ? Math.round(totalInvestment * 0.5)
        : totalInvestment

    return {
      lodgingSubtotal,
      cleaningFee,
      serviceFee,
      estimatedTaxes,
      totalInvestment,
      dueToday,
      remainingBalance:
        totalInvestment - dueToday,
      expectedPoints:
        intent.pointsPerNight * nights,
    }
  }, [
    intent,
    nights,
    paymentPlan,
    property,
  ])

  const today = getTodayDateValue()

  const reservations = useMemo(
    () => getReservations(),
    [availabilityVersion],
  )

  const unavailableRanges = property
    ? getPropertyUnavailableRanges(
        property.id,
        reservations,
      ).filter(
        (range) => range.endDate >= today,
      )
    : []

  const availability = property
    ? checkPropertyAvailability({
        propertyId: property.id,
        checkIn,
        checkOut,
        reservations,
      })
    : {
        available: false,
        message: '',
        conflicts: [],
      }

  const availabilityMessage =
    availabilityError ||
    (checkIn && checkOut
      ? availability.message
      : '')

  const canConfirm =
    Boolean(user) &&
    Boolean(property) &&
    Boolean(intent) &&
    nights > 0 &&
    guests > 0 &&
    availability.available &&
    acceptedConfirmation

  const handleConfirmStay = () => {
    if (
      !canConfirm ||
      !user ||
      !property ||
      !intent
    ) {
      return
    }

    const latestAvailability =
      checkPropertyAvailability({
        propertyId: property.id,
        checkIn,
        checkOut,
        reservations: getReservations(),
      })

    if (!latestAvailability.available) {
      setAvailabilityError(
        latestAvailability.message,
      )
      return
    }

    setAvailabilityError('')

    let reservation: ReturnType<
      typeof createReservation
    >

    try {
      reservation = createReservation({
      memberId: user.id,
      propertyId: property.id,
      propertyTitle: property.title,
      checkIn,
      checkOut,
      guests,
      nights,
      nightlyRate: intent.nightlyRate,
      lodgingSubtotal:
        financials.lodgingSubtotal,
      cleaningFee: financials.cleaningFee,
      serviceFee: financials.serviceFee,
      estimatedTaxes:
        financials.estimatedTaxes,
      totalInvestment:
        financials.totalInvestment,
      dueToday: financials.dueToday,
      remainingBalance:
        financials.remainingBalance,
      paymentPlan,
      paymentMethod,
        expectedPoints:
          financials.expectedPoints,
      })
    } catch (error) {
      setAvailabilityError(
        error instanceof Error
          ? error.message
          : 'These dates are no longer available.',
      )
      return
    }

    const rewardResult =
      creditRewardPoints({
        memberId: user.id,
        amount:
          reservation.expectedPoints,
        reason:
          `Confirmed stay at ${property.title}`,
        sourceKey:
          `reservation-reward:${reservation.id}`,
      })

    createNotification({
      memberId: user.id,
      type: 'booking',
      title: 'Reservation confirmed',
      message:
        `${property.title} is confirmed from ${checkIn} through ${checkOut}. Your Welcome Home portal is ready.`,
      link:
        `/stays/${reservation.id}`,
      dedupeKey:
        `reservation-confirmed:${reservation.id}`,
    })

    if (rewardResult.created) {
      createNotification({
        memberId: user.id,
        type: 'reward',
        title: 'Reward points added',
        message:
          `${rewardResult.transaction.amount.toLocaleString(
            'en-US',
          )} points were added for your confirmed stay. Your new balance is ${rewardResult.balance.toLocaleString(
            'en-US',
          )} points.`,
        link: '/profile',
        dedupeKey:
          `reservation-points:${reservation.id}`,
      })
    }

    clearBookingIntent()

    navigate(
      `/stays/${reservation.id}`,
      {
        replace: true,
      },
    )
  }

  return (
    <PlatformPage
      memberNavigation
      heroImage={heroImage}
      eyebrow="Secure reservation"
      title="Stay Confirmation"
      description="Finalize your dates, guests, stay investment, and preferred payment plan for your home away from home."
      backLabel="Return to property search"
      backTo="/"
    >
      {!intent || !property ? (
        <section className="stay-empty">
          <span>Nothing selected yet</span>

          <h2>
            Choose your home away from home.
          </h2>

          <p>
            Open a property, select your dates and
            guests, and continue here to confirm the
            stay.
          </p>

          <Link to="/">
            Browse available properties
            <span aria-hidden="true">→</span>
          </Link>
        </section>
      ) : (
        <section
          className="stay-confirmation"
          aria-label="Stay confirmation checkout"
        >
          <div className="stay-confirmation__main">
            <article className="stay-property-hero">
              <img
                src={property.image}
                alt={property.title}
              />

              <div className="stay-property-hero__shade" />

              <div className="stay-property-hero__content">
                <span>{property.label}</span>

                <h2>{property.title}</h2>

                <p>
                  {property.city}, {property.state}
                </p>

                <div className="stay-property-hero__facts">
                  <span>
                    <strong>
                      ★ {property.rating}
                    </strong>
                    Guest rating
                  </span>

                  <span>
                    <strong>
                      {property.beds}
                    </strong>
                    Bedrooms
                  </span>

                  <span>
                    <strong>
                      {property.guests}
                    </strong>
                    Maximum guests
                  </span>

                  <span>
                    <strong>
                      +{property.pointsPerNight}
                    </strong>
                    Points per night
                  </span>
                </div>
              </div>
            </article>

            <article className="stay-panel">
              <header className="stay-panel__heading">
                <div>
                  <span>Stay details</span>

                  <h2>
                    Make it yours.
                  </h2>
                </div>

                <Link
                  to={`/properties/${property.id}`}
                >
                  Return to property
                </Link>
              </header>

              <div className="stay-detail-fields">
                <label>
                  <span>Check-in</span>

                  <input
                    type="date"
                    min={today}
                    value={checkIn}
                    onChange={(event) => {
                      const nextCheckIn =
                        event.target.value

                      setAvailabilityError('')
                      setCheckIn(nextCheckIn)

                      if (
                        checkOut &&
                        nextCheckIn >= checkOut
                      ) {
                        setCheckOut('')
                      }
                    }}
                  />
                </label>

                <label>
                  <span>Check-out</span>

                  <input
                    type="date"
                    min={checkIn || today}
                    value={checkOut}
                    onChange={(event) => {
                      setAvailabilityError('')
                      setCheckOut(
                        event.target.value,
                      )
                    }}
                  />
                </label>

                <label>
                  <span>Guests</span>

                  <select
                    value={guests}
                    onChange={(event) =>
                      setGuests(
                        Number(
                          event.target.value,
                        ),
                      )
                    }
                  >
                    {Array.from(
                      {
                        length:
                          property.guests,
                      },
                      (_, index) =>
                        index + 1,
                    ).map((guestCount) => (
                      <option
                        value={guestCount}
                        key={guestCount}
                      >
                        {guestCount}{' '}
                        {guestCount === 1
                          ? 'guest'
                          : 'guests'}
                      </option>
                    ))}
                  </select>
                </label>

                <div className="stay-detail-fields__nights">
                  <span>Length of stay</span>

                  <strong>
                    {nights > 0
                      ? `${nights} ${
                          nights === 1
                            ? 'night'
                            : 'nights'
                        }`
                      : 'Select valid dates'}
                  </strong>
                </div>
              </div>

              <div
                className={`booking-availability ${
                  availabilityMessage &&
                  !availability.available
                    ? 'is-conflict'
                    : ''
                }`}
                aria-live="polite"
              >
                <div className="booking-availability__status">
                  <i aria-hidden="true" />
                  <div>
                    <strong>
                      {availabilityMessage ||
                        'Availability is checked again before confirmation.'}
                    </strong>
                    <p>
                      {availability.available
                        ? 'The selected stay is currently available.'
                        : 'Select dates that do not overlap a reserved or manager-blocked range.'}
                    </p>
                  </div>
                </div>

                {unavailableRanges.length > 0 && (
                  <ul className="booking-availability__ranges">
                    {unavailableRanges
                      .slice(0, 5)
                      .map((range) => (
                        <li key={`${range.source}:${range.id}`}>
                          <span>{formatUnavailableRange(range)}</span>
                          <small>{range.label}</small>
                        </li>
                      ))}
                  </ul>
                )}
              </div>
            </article>

            <article className="stay-panel">
              <header className="stay-panel__heading">
                <div>
                  <span>Stay investment</span>

                  <h2>
                    Choose how you commit.
                  </h2>
                </div>
              </header>

              <div className="stay-plan-grid">
                <button
                  type="button"
                  className={
                    paymentPlan === 'pay-in-full'
                      ? 'is-selected'
                      : ''
                  }
                  onClick={() =>
                    setPaymentPlan(
                      'pay-in-full',
                    )
                  }
                  aria-pressed={
                    paymentPlan === 'pay-in-full'
                  }
                >
                  <span className="stay-plan-grid__check">
                    ✓
                  </span>

                  <small>
                    Full stay investment
                  </small>

                  <strong>
                    Pay in full today
                  </strong>

                  <p>
                    Complete the entire stay
                    investment in one payment.
                  </p>

                  <b>
                    {currencyFormatter.format(
                      financials.totalInvestment,
                    )}
                  </b>
                </button>

                <button
                  type="button"
                  className={
                    paymentPlan === 'split-stay'
                      ? 'is-selected'
                      : ''
                  }
                  onClick={() =>
                    setPaymentPlan(
                      'split-stay',
                    )
                  }
                  aria-pressed={
                    paymentPlan === 'split-stay'
                  }
                >
                  <span className="stay-plan-grid__check">
                    ✓
                  </span>

                  <small>
                    Split stay investment
                  </small>

                  <strong>
                    50% today
                  </strong>

                  <p>
                    Commit half today and schedule
                    the remaining balance.
                  </p>

                  <b>
                    {currencyFormatter.format(
                      Math.round(
                        financials.totalInvestment *
                          0.5,
                      ),
                    )}
                  </b>
                </button>
              </div>
            </article>

            <article className="stay-panel">
              <header className="stay-panel__heading">
                <div>
                  <span>Payment preference</span>

                  <h2>
                    Select your method.
                  </h2>
                </div>
              </header>

              <div className="stay-payment-methods">
                {(
                  [
                    {
                      value: 'card',
                      title:
                        'Credit or debit card',
                      description:
                        'Use a secure card payment.',
                    },
                    {
                      value: 'paypal',
                      title: 'PayPal',
                      description:
                        'Continue through PayPal.',
                    },
                    {
                      value: 'apple-pay',
                      title: 'Apple Pay',
                      description:
                        'Use an eligible Apple device.',
                    },
                  ] as const
                ).map((method) => (
                  <button
                    type="button"
                    key={method.value}
                    className={
                      paymentMethod ===
                      method.value
                        ? 'is-selected'
                        : ''
                    }
                    onClick={() =>
                      setPaymentMethod(
                        method.value,
                      )
                    }
                    aria-pressed={
                      paymentMethod ===
                      method.value
                    }
                  >
                    <span>
                      <PaymentIcon
                        method={method.value}
                      />
                    </span>

                    <div>
                      <strong>
                        {method.title}
                      </strong>

                      <small>
                        {method.description}
                      </small>
                    </div>

                    <i aria-hidden="true">✓</i>
                  </button>
                ))}
              </div>

              <div className="stay-payment-notice">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <rect
                    x="4"
                    y="10"
                    width="16"
                    height="11"
                    rx="2"
                  />
                  <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                </svg>

                <p>
                  Payment details must be handled by
                  the connected payment processor.
                  This application does not store raw
                  card numbers.
                </p>
              </div>
            </article>

            <article className="stay-panel">
              <header className="stay-panel__heading">
                <div>
                  <span>Before you confirm</span>

                  <h2>
                    Know your stay.
                  </h2>
                </div>
              </header>

              <div className="stay-conditions">
                <details open>
                  <summary>
                    Cancellation schedule
                    <span>+</span>
                  </summary>

                  <p>
                    Full refund until 14 days before
                    arrival. A 50% lodging refund
                    applies from 13 to 7 days before
                    arrival. The stay becomes
                    nonrefundable within 7 days of
                    check-in.
                  </p>
                </details>

                <details>
                  <summary>
                    Property conditions
                    <span>+</span>
                  </summary>

                  <p>
                    The reservation is limited to
                    {` ${guests} `}
                    registered
                    {guests === 1
                      ? ' guest'
                      : ' guests'}.
                    Unauthorized events, smoking,
                    property damage, or occupancy
                    beyond the approved guest count
                    may result in additional charges
                    or termination of the stay.
                  </p>
                </details>

                <details>
                  <summary>
                    Reward eligibility
                    <span>+</span>
                  </summary>

                  <p>
                    This stay is expected to earn{' '}
                    {financials.expectedPoints.toLocaleString(
                      'en-US',
                    )}{' '}
                    points after checkout and
                    successful completion of the
                    reservation.
                  </p>
                </details>
              </div>

              <label className="stay-confirmation-consent">
                <input
                  type="checkbox"
                  checked={acceptedConfirmation}
                  onChange={(event) =>
                    setAcceptedConfirmation(
                      event.target.checked,
                    )
                  }
                />

                <span>
                  <strong>
                    I am ready to confirm this stay.
                  </strong>

                  I have reviewed the dates, guest
                  count, investment breakdown,
                  cancellation schedule, and property
                  conditions.
                </span>
              </label>
            </article>
          </div>

          <aside className="stay-investment-summary">
            <div className="stay-investment-summary__heading">
              <span>Home away from home</span>

              <h2>
                Your stay investment
              </h2>

              <p>
                {formatDate(checkIn)} —{' '}
                {formatDate(checkOut)}
              </p>
            </div>

            <div className="stay-investment-summary__property">
              <img
                src={
                  property.thumbnails[0] ??
                  property.image
                }
                alt=""
                aria-hidden="true"
              />

              <div>
                <strong>
                  {property.title}
                </strong>

                <span>
                  {property.city},{' '}
                  {property.state}
                </span>
              </div>
            </div>

            <div className="stay-investment-lines">
              <span>
                <small>
                  {currencyFormatter.format(
                    intent.nightlyRate,
                  )}{' '}
                  × {nights || 0}{' '}
                  {nights === 1
                    ? 'night'
                    : 'nights'}
                </small>

                <strong>
                  {currencyFormatter.format(
                    financials.lodgingSubtotal,
                  )}
                </strong>
              </span>

              <span>
                <small>
                  Cleaning investment
                </small>

                <strong>
                  {currencyFormatter.format(
                    financials.cleaningFee,
                  )}
                </strong>
              </span>

              <span>
                <small>
                  Platform service
                </small>

                <strong>
                  {currencyFormatter.format(
                    financials.serviceFee,
                  )}
                </strong>
              </span>

              <span>
                <small>
                  Estimated taxes
                </small>

                <strong>
                  {currencyFormatter.format(
                    financials.estimatedTaxes,
                  )}
                </strong>
              </span>
            </div>

            <div className="stay-investment-total">
              <span>
                Total stay investment
              </span>

              <strong>
                {currencyFormatter.format(
                  financials.totalInvestment,
                )}
              </strong>
            </div>

            <div className="stay-investment-due">
              <span>
                <small>Due today</small>

                <strong>
                  {currencyFormatter.format(
                    financials.dueToday,
                  )}
                </strong>
              </span>

              {financials.remainingBalance >
                0 && (
                <span>
                  <small>
                    Scheduled balance
                  </small>

                  <strong>
                    {currencyFormatter.format(
                      financials.remainingBalance,
                    )}
                  </strong>
                </span>
              )}
            </div>

            <div className="stay-investment-rewards">
              <span aria-hidden="true">★</span>

              <div>
                <small>
                  Expected member rewards
                </small>

                <strong>
                  +
                  {financials.expectedPoints.toLocaleString(
                    'en-US',
                  )}{' '}
                  points
                </strong>
              </div>
            </div>

            <button
              type="button"
              disabled={!canConfirm}
              onClick={handleConfirmStay}
            >
              <span>
                Confirm stay
              </span>

              <strong>
                {currencyFormatter.format(
                  financials.dueToday,
                )}{' '}
                due today
              </strong>
            </button>

            {!acceptedConfirmation && (
              <p className="stay-investment-summary__requirement">
                Review the confirmation and select
                the agreement checkbox to continue.
              </p>
            )}

            <div className="stay-investment-summary__trust">
              <span>
                Secure member reservation
              </span>

              <span>
                Reservation record stored
              </span>

              <span>
                No raw card data stored
              </span>
            </div>
          </aside>
        </section>
      )}
    </PlatformPage>
  )
}

export default BookingReviewPage
