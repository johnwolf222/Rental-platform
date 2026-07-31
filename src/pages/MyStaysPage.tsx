import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from 'react'
import { Link } from 'react-router'
import PlatformPage from '../components/layout/PlatformPage'
import ReservationStatusBadge from '../components/reservations/ReservationStatusBadge'
import ReservationTimeline from '../components/reservations/ReservationTimeline'
import { useAuth } from '../context/AuthContext'
import {
  getPropertyById,
  properties,
} from '../data/properties'
import {
  createNotification,
} from '../lib/notifications'
import {
  canMemberRequestCancellation,
  requestReservationCancellation,
} from '../lib/reservationManagement'
import {
  getReservationsForMember,
  RESERVATIONS_UPDATED_EVENT,
  type ReservationRecord,
} from '../lib/reservations'
import '../components/reservations/ReservationManagement.css'
import './MyStaysExperience.css'

type StayPhase =
  | 'upcoming'
  | 'active'
  | 'complete'
  | 'cancellation-requested'
  | 'cancelled'

const dateFormatter =
  new Intl.DateTimeFormat(
    'en-US',
    {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    },
  )

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
  return dateFormatter.format(
    new Date(`${dateValue}T12:00:00`),
  )
}

function getStayPhase(
  reservation: ReservationRecord,
): StayPhase {
  if (
    reservation.reservationStatus ===
    'cancelled'
  ) {
    return 'cancelled'
  }

  if (
    reservation.reservationStatus ===
    'cancellation-requested'
  ) {
    return 'cancellation-requested'
  }

  const currentTime = Date.now()

  const arrivalTime =
    new Date(
      `${reservation.checkIn}T00:00:00`,
    ).getTime()

  const departureTime =
    new Date(
      `${reservation.checkOut}T23:59:59`,
    ).getTime()

  if (currentTime >= departureTime) {
    return 'complete'
  }

  if (
    currentTime >= arrivalTime &&
    currentTime < departureTime
  ) {
    return 'active'
  }

  return 'upcoming'
}

function getDaysUntil(
  reservation: ReservationRecord,
) {
  const arrivalTime =
    new Date(
      `${reservation.checkIn}T00:00:00`,
    ).getTime()

  return Math.max(
    Math.ceil(
      (arrivalTime - Date.now()) /
        86_400_000,
    ),
    0,
  )
}

function phaseLabel(
  phase: StayPhase,
  reservation: ReservationRecord,
) {
  if (
    phase ===
    'cancellation-requested'
  ) {
    return 'Cancellation under review'
  }

  if (phase === 'cancelled') {
    return 'Reservation cancelled'
  }

  if (phase === 'active') {
    return 'Stay active'
  }

  if (phase === 'complete') {
    return 'Stay complete'
  }

  const daysUntil =
    getDaysUntil(reservation)

  if (daysUntil === 0) {
    return 'Arrival today'
  }

  if (daysUntil === 1) {
    return '1 day until arrival'
  }

  return `${daysUntil} days until arrival`
}

function MyStaysPage() {
  const { user } = useAuth()

  const [
    reservationVersion,
    setReservationVersion,
  ] = useState(0)

  const [
    cancellationReservationId,
    setCancellationReservationId,
  ] = useState('')

  const [
    cancellationReason,
    setCancellationReason,
  ] = useState('')

  const [
    cancellationMessage,
    setCancellationMessage,
  ] = useState('')

  useEffect(() => {
    const refreshReservations = () =>
      setReservationVersion(
        (currentVersion) =>
          currentVersion + 1,
      )

    window.addEventListener(
      RESERVATIONS_UPDATED_EVENT,
      refreshReservations,
    )

    window.addEventListener(
      'storage',
      refreshReservations,
    )

    return () => {
      window.removeEventListener(
        RESERVATIONS_UPDATED_EVENT,
        refreshReservations,
      )

      window.removeEventListener(
        'storage',
        refreshReservations,
      )
    }
  }, [])

  const reservations = useMemo(
    () => {
      void reservationVersion

      return user
        ? getReservationsForMember(
            user.id,
          ).sort(
            (first, second) =>
              new Date(
                second.checkIn,
              ).getTime() -
              new Date(
                first.checkIn,
              ).getTime(),
          )
        : []
    },
    [
      reservationVersion,
      user,
    ],
  )

  const reservationProperties =
    reservations
      .map((reservation) =>
        getPropertyById(
          reservation.propertyId,
        ),
      )
      .filter(
        (property) => property !== undefined,
      )

  const heroProperty =
    reservationProperties[0] ??
    properties[0]

  useEffect(() => {
    if (!user) {
      return
    }

    reservations.forEach(
      (reservation) => {
        if (
          reservation.reservationStatus !==
            'confirmed' ||
          getStayPhase(reservation) !==
            'active'
        ) {
          return
        }

        createNotification({
          memberId: user.id,
          type: 'stay',
          title: 'Enjoy Your Stay is unlocked',
          message:
            `Arrival access for ${reservation.propertyTitle} is now available in your private stay portal.`,
          link:
            `/stays/${reservation.id}`,
          dedupeKey:
            `stay-active:${reservation.id}`,
        })
      },
    )
  }, [
    reservations,
    user,
  ])

  if (!user) {
    return null
  }

  const upcomingCount =
    reservations.filter(
      (reservation) =>
        getStayPhase(reservation) ===
        'upcoming',
    ).length

  const activeCount =
    reservations.filter(
      (reservation) =>
        getStayPhase(reservation) ===
        'active',
    ).length

  const completedCount =
    reservations.filter(
      (reservation) =>
        getStayPhase(reservation) ===
        'complete',
    ).length

  const cancelledCount =
    reservations.filter(
      (reservation) =>
        getStayPhase(reservation) ===
        'cancelled',
    ).length

  const handleCancellationRequest = (
    event: FormEvent<HTMLFormElement>,
    reservation: ReservationRecord,
  ) => {
    event.preventDefault()

    try {
      requestReservationCancellation({
        reservationId: reservation.id,
        memberId: user.id,
        reason: cancellationReason,
      })

      setCancellationMessage(
        'Cancellation request sent to management.',
      )
      setCancellationReservationId('')
      setCancellationReason('')
    } catch (error) {
      setCancellationMessage(
        error instanceof Error
          ? error.message
          : 'The cancellation request could not be sent.',
      )
    }
  }

  return (
    <PlatformPage
      memberNavigation
      heroImage={heroProperty?.image}
      eyebrow="Private reservation library"
      title="My Stays"
      description="Review upcoming stays, active arrival access, completed reservations, cancellation requests, and refund updates."
      backLabel="Return to rentals"
      backTo="/"
    >
      <section
        className="my-stays"
        aria-label="Member reservation dashboard"
      >
        <article className="my-stays-overview">
          {heroProperty && (
            <img
              src={heroProperty.image}
              alt=""
              aria-hidden="true"
            />
          )}

          <span className="my-stays-overview__shade" />

          <div className="my-stays-overview__copy">
            <span>Your reservation collection</span>

            <h2>
              Every stay.
              <strong>
                One private home.
              </strong>
            </h2>

            <p>
              Confirmations, arrival countdowns,
              manager decisions, refund updates,
              and completed stays remain connected
              to your account.
            </p>

            <Link to="/">
              Discover another property
              <span aria-hidden="true">→</span>
            </Link>
          </div>

          <aside>
            <span>
              <small>Upcoming</small>
              <strong>{upcomingCount}</strong>
            </span>

            <span>
              <small>Active</small>
              <strong>{activeCount}</strong>
            </span>

            <span>
              <small>Completed</small>
              <strong>{completedCount}</strong>
            </span>

            <span>
              <small>Cancelled</small>
              <strong>{cancelledCount}</strong>
            </span>
          </aside>
        </article>

        {cancellationMessage && (
          <p
            className="reservation-action-message"
            role="status"
          >
            {cancellationMessage}
          </p>
        )}

        {reservations.length > 0 ? (
          <section className="my-stays-list">
            <header className="my-stays-heading">
              <div>
                <span>Reservation history</span>
                <h2>Your homes away from home.</h2>
              </div>

              <strong>
                {reservations.length}{' '}
                {reservations.length === 1
                  ? 'stay'
                  : 'stays'}
              </strong>
            </header>

            <div className="my-stays-grid">
              {reservations.map(
                (reservation) => {
                  const property =
                    getPropertyById(
                      reservation.propertyId,
                    )

                  const phase =
                    getStayPhase(
                      reservation,
                    )

                  const canCancel =
                    canMemberRequestCancellation(
                      reservation,
                    )

                  return (
                    <article
                      className={`my-stay-card my-stay-card--${phase}`}
                      key={reservation.id}
                    >
                      <div className="my-stay-card__media">
                        {property && (
                          <img
                            src={property.image}
                            alt={property.title}
                          />
                        )}

                        <span className="my-stay-card__shade" />

                        <div className="my-stay-card__status">
                          <i />
                          {phaseLabel(
                            phase,
                            reservation,
                          )}
                        </div>

                        <div className="my-stay-card__location">
                          <small>
                            {property
                              ? `${property.city}, ${property.state}`
                              : 'Reserved property'}
                          </small>

                          <h3>
                            {reservation.propertyTitle}
                          </h3>
                        </div>
                      </div>

                      <div className="my-stay-card__content">
                        <div className="reservation-card-status-row">
                          <ReservationStatusBadge
                            reservation={reservation}
                            showRefund
                          />
                        </div>

                        <div className="my-stay-card__dates">
                          <span>
                            <small>Arrival</small>
                            <strong>
                              {formatDate(
                                reservation.checkIn,
                              )}
                            </strong>
                          </span>

                          <span>
                            <small>Departure</small>
                            <strong>
                              {formatDate(
                                reservation.checkOut,
                              )}
                            </strong>
                          </span>
                        </div>

                        <div className="my-stay-card__facts">
                          <span>
                            <small>Guests</small>
                            <strong>
                              {reservation.guests}
                            </strong>
                          </span>

                          <span>
                            <small>Nights</small>
                            <strong>
                              {reservation.nights}
                            </strong>
                          </span>

                          <span>
                            <small>Reward value</small>
                            <strong>
                              +
                              {reservation.expectedPoints.toLocaleString(
                                'en-US',
                              )}
                            </strong>
                          </span>
                        </div>

                        {reservation.reservationStatus ===
                          'cancellation-requested' && (
                          <div className="reservation-request-note">
                            <strong>
                              Management review pending
                            </strong>

                            <p>
                              {reservation.cancellationReason}
                            </p>
                          </div>
                        )}

                        {canCancel && (
                          <div className="reservation-cancellation-panel">
                            {cancellationReservationId ===
                            reservation.id ? (
                              <form
                                onSubmit={(event) =>
                                  handleCancellationRequest(
                                    event,
                                    reservation,
                                  )
                                }
                              >
                                <label>
                                  <span>
                                    Reason for cancellation
                                  </span>

                                  <textarea
                                    value={cancellationReason}
                                    onChange={(event) =>
                                      setCancellationReason(
                                        event.target.value,
                                      )
                                    }
                                    rows={3}
                                    placeholder="Briefly explain why you need to cancel."
                                    required
                                  />
                                </label>

                                <div>
                                  <button
                                    type="submit"
                                  >
                                    Send request
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      setCancellationReservationId(
                                        '',
                                      )
                                      setCancellationReason(
                                        '',
                                      )
                                    }}
                                  >
                                    Keep reservation
                                  </button>
                                </div>
                              </form>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  setCancellationReservationId(
                                    reservation.id,
                                  )
                                  setCancellationMessage(
                                    '',
                                  )
                                }}
                              >
                                Request cancellation
                              </button>
                            )}
                          </div>
                        )}

                        <details className="reservation-history-details">
                          <summary>
                            Reservation history
                          </summary>

                          <ReservationTimeline
                            events={
                              reservation.statusHistory
                            }
                          />
                        </details>

                        <footer>
                          <div>
                            <small>
                              Total stay investment
                            </small>

                            <strong>
                              {currencyFormatter.format(
                                reservation.totalInvestment,
                              )}
                            </strong>

                            <span>
                              Confirmation{' '}
                              {reservation.id}
                            </span>
                          </div>

                          {reservation.reservationStatus ===
                          'cancelled' ? (
                            <span className="reservation-closed-label">
                              Reservation closed
                            </span>
                          ) : (
                            <Link
                              to={`/stays/${reservation.id}`}
                            >
                              {phase === 'upcoming'
                                ? 'Open Welcome Home'
                                : phase === 'active'
                                  ? 'Enjoy Your Stay'
                                  : phase ===
                                      'cancellation-requested'
                                    ? 'Review stay'
                                    : 'View completed stay'}

                              <span aria-hidden="true">
                                →
                              </span>
                            </Link>
                          )}
                        </footer>
                      </div>
                    </article>
                  )
                },
              )}
            </div>
          </section>
        ) : (
          <section className="my-stays-empty">
            <span>No reservations yet</span>

            <h2>
              Your reservation collection begins here.
            </h2>

            <p>
              Select a property, choose your dates,
              and confirm your first home away from
              home.
            </p>

            <Link to="/">
              Browse available rentals
              <span aria-hidden="true">→</span>
            </Link>
          </section>
        )}
      </section>
    </PlatformPage>
  )
}

export default MyStaysPage
