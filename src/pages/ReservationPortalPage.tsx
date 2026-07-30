import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from 'react'
import {
  Link,
  useParams,
} from 'react-router'
import PlatformPage from '../components/layout/PlatformPage'
import { useAuth } from '../context/AuthContext'
import { getPropertyById } from '../data/properties'
import {
  getReservationById,
} from '../lib/reservations'
import {
  getStayPortalSettings,
  STAY_PORTAL_UPDATED_EVENT,
  type StayPortalSettings,
} from '../lib/stayPortal'
import {
  getStayMessages,
  sendStayMessage,
  STAY_CHAT_UPDATED_EVENT,
  type StayChatMessage,
} from '../lib/stayChat'
import './ReservationPortalExperience.css'

type StayPhase =
  | 'upcoming'
  | 'active'
  | 'complete'

const dateFormatter =
  new Intl.DateTimeFormat(
    'en-US',
    {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    },
  )

const messageTimeFormatter =
  new Intl.DateTimeFormat(
    'en-US',
    {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    },
  )

function formatDate(dateValue: string) {
  return dateFormatter.format(
    new Date(`${dateValue}T12:00:00`),
  )
}

function parseClockTime(
  timeValue: string,
) {
  const match = timeValue
    .trim()
    .match(
      /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i,
    )

  if (!match) {
    return {
      hours: 0,
      minutes: 0,
    }
  }

  let hours = Number(match[1])
  const minutes = Number(match[2])
  const period = match[3].toUpperCase()

  if (period === 'AM' && hours === 12) {
    hours = 0
  }

  if (period === 'PM' && hours !== 12) {
    hours += 12
  }

  return {
    hours,
    minutes,
  }
}

function getTimeZoneOffset(
  timestamp: number,
  timeZone: string,
) {
  const parts =
    new Intl.DateTimeFormat(
      'en-US',
      {
        timeZone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hourCycle: 'h23',
      },
    ).formatToParts(
      new Date(timestamp),
    )

  const values = Object.fromEntries(
    parts.map((part) => [
      part.type,
      part.value,
    ]),
  ) as Record<string, string>

  const representedTimestamp = Date.UTC(
    Number(values.year),
    Number(values.month) - 1,
    Number(values.day),
    Number(values.hour),
    Number(values.minute),
    Number(values.second),
  )

  return (
    representedTimestamp -
    Math.floor(timestamp / 1000) * 1000
  )
}

function getZonedTimestamp(
  dateValue: string,
  timeValue: string,
  timeZone: string,
) {
  const [
    year,
    month,
    day,
  ] = dateValue
    .split('-')
    .map(Number)

  const {
    hours,
    minutes,
  } = parseClockTime(timeValue)

  const targetUtc = Date.UTC(
    year,
    month - 1,
    day,
    hours,
    minutes,
    0,
  )

  const initialOffset =
    getTimeZoneOffset(
      targetUtc,
      timeZone,
    )

  let timestamp =
    targetUtc - initialOffset

  const correctedOffset =
    getTimeZoneOffset(
      timestamp,
      timeZone,
    )

  if (
    correctedOffset !== initialOffset
  ) {
    timestamp =
      targetUtc - correctedOffset
  }

  return timestamp
}

function getCountdown(
  difference: number,
) {
  const safeDifference =
    Math.max(difference, 0)

  const days = Math.floor(
    safeDifference / 86_400_000,
  )

  const hours = Math.floor(
    (
      safeDifference %
      86_400_000
    ) / 3_600_000,
  )

  const minutes = Math.floor(
    (
      safeDifference %
      3_600_000
    ) / 60_000,
  )

  const seconds = Math.floor(
    (
      safeDifference %
      60_000
    ) / 1000,
  )

  return {
    days,
    hours,
    minutes,
    seconds,
  }
}

function ReservationPortalPage() {
  const {
    reservationId,
  } = useParams()

  const { user } = useAuth()

  useEffect(() => {
    document.body.classList.add(
      'reservation-portal-page-active',
    )

    window.scrollTo({
      top: 0,
      behavior: 'auto',
    })

    return () => {
      document.body.classList.remove(
        'reservation-portal-page-active',
      )
    }
  }, [])

  const reservation = useMemo(
    () =>
      getReservationById(
        reservationId,
      ),
    [reservationId],
  )

  const property = useMemo(
    () =>
      getPropertyById(
        reservation?.propertyId,
      ),
    [reservation?.propertyId],
  )

  const [
    settings,
    setSettings,
  ] =
    useState<StayPortalSettings | null>(
      () =>
        property
          ? getStayPortalSettings(
              property.id,
            )
          : null,
    )

  const [
    messages,
    setMessages,
  ] = useState<StayChatMessage[]>([])

  const [
    chatMessage,
    setChatMessage,
  ] = useState('')

  const [
    now,
    setNow,
  ] = useState(() => Date.now())

  useEffect(() => {
    const intervalId =
      window.setInterval(() => {
        setNow(Date.now())
      }, 1000)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [])

  useEffect(() => {
    if (!property) {
      // Clear settings when the referenced property is unavailable.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSettings(null)
      return
    }

    setSettings(
      getStayPortalSettings(
        property.id,
      ),
    )
  }, [property])

  useEffect(() => {
    if (!reservation || !property) {
      // Clear a prior conversation when no valid stay is available.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMessages([])
      return
    }

    setMessages(
      getStayMessages(
        reservation.id,
        property.title,
      ),
    )
  }, [
    property,
    reservation,
  ])

  useEffect(() => {
    if (!property) {
      return
    }

    const refreshSettings = (
      event: Event,
    ) => {
      const detail = (
        event as CustomEvent<{
          propertyId: number
        }>
      ).detail

      if (
        detail?.propertyId !==
        property.id
      ) {
        return
      }

      setSettings(
        getStayPortalSettings(
          property.id,
        ),
      )
    }

    window.addEventListener(
      STAY_PORTAL_UPDATED_EVENT,
      refreshSettings,
    )

    return () => {
      window.removeEventListener(
        STAY_PORTAL_UPDATED_EVENT,
        refreshSettings,
      )
    }
  }, [property])

  useEffect(() => {
    if (!reservation || !property) {
      return
    }

    const refreshMessages = (
      event: Event,
    ) => {
      const detail = (
        event as CustomEvent<{
          reservationId: string
        }>
      ).detail

      if (
        detail?.reservationId !==
        reservation.id
      ) {
        return
      }

      setMessages(
        getStayMessages(
          reservation.id,
          property.title,
        ),
      )
    }

    window.addEventListener(
      STAY_CHAT_UPDATED_EVENT,
      refreshMessages,
    )

    return () => {
      window.removeEventListener(
        STAY_CHAT_UPDATED_EVENT,
        refreshMessages,
      )
    }
  }, [
    property,
    reservation,
  ])

  if (
    !reservation ||
    !property ||
    !settings
  ) {
    return (
      <PlatformPage
        memberNavigation
        eyebrow="Reservation portal"
        title="Stay not found"
        description="This private stay portal could not be located."
        backLabel="Return to rentals"
        backTo="/"
      >
        <section className="portal-empty-state">
          <span>
            Reservation unavailable
          </span>

          <h2>
            We could not open this stay.
          </h2>

          <p>
            Confirm that you are using the
            reservation link attached to your
            member account.
          </p>

          <Link to="/">
            Return to rental search
          </Link>
        </section>
      </PlatformPage>
    )
  }

  if (
    !user ||
    reservation.memberId !== user.id
  ) {
    return (
      <PlatformPage
        memberNavigation
        heroImage={property.image}
        eyebrow="Private reservation"
        title="Access restricted"
        description="This stay belongs to a different member account."
        backLabel="Return to rentals"
        backTo="/"
      >
        <section className="portal-empty-state">
          <span>
            Ownership verification failed
          </span>

          <h2>
            This reservation is private.
          </h2>

          <p>
            Sign in with the member account
            used to confirm this stay.
          </p>

          <Link to="/profile">
            Open member profile
          </Link>
        </section>
      </PlatformPage>
    )
  }

  const arrivalTimestamp =
    getZonedTimestamp(
      reservation.checkIn,
      settings.checkInTime,
      settings.timeZone,
    )

  const departureTimestamp =
    getZonedTimestamp(
      reservation.checkOut,
      settings.checkOutTime,
      settings.timeZone,
    )

  let phase: StayPhase = 'upcoming'

  if (
    now >= arrivalTimestamp &&
    now < departureTimestamp
  ) {
    phase = 'active'
  }

  if (now >= departureTimestamp) {
    phase = 'complete'
  }

  const countdown = getCountdown(
    arrivalTimestamp - now,
  )

  const enabledReminders =
    settings.reminders.filter(
      (reminder) =>
        reminder.enabled,
    )

  const handleSendMessage = (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault()

    if (!chatMessage.trim()) {
      return
    }

    sendStayMessage({
      reservationId:
        reservation.id,
      senderRole: 'member',
      senderName:
        `${user.firstName} ${user.lastName}`,
      message: chatMessage,
    })

    setChatMessage('')
  }

  const mapUrl =
    settings.propertyAddress.trim()
      ? `https://www.google.com/maps?q=${encodeURIComponent(
          settings.propertyAddress,
        )}&output=embed`
      : ''

  const directionsUrl =
    settings.propertyAddress.trim()
      ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
          settings.propertyAddress,
        )}`
      : ''

  const pageTitle =
    phase === 'upcoming'
      ? 'Welcome Home'
      : phase === 'active'
        ? 'Enjoy Your Stay'
        : 'Stay Complete'

  const pageEyebrow =
    phase === 'upcoming'
      ? 'Your arrival is approaching'
      : phase === 'active'
        ? 'Arrival access unlocked'
        : 'Reservation completed'

  const pageDescription =
    phase === 'upcoming'
      ? 'Your private countdown, reminders, reservation details, and manager conversation are ready.'
      : phase === 'active'
        ? 'Your property directions, arrival information, emergency details, and private manager chat are now available.'
        : 'Your reservation has ended, but your confirmation details and private conversation remain available.'

  return (
    <PlatformPage
      memberNavigation
      heroImage={property.image}
      eyebrow={pageEyebrow}
      title={pageTitle}
      description={pageDescription}
      backLabel="Return to rentals"
      backTo="/"
    >
      <section
        className={`reservation-portal reservation-portal--${phase}`}
      >
        <article className="reservation-portal__hero">
          <img
            src={property.image}
            alt={property.title}
          />

          <div className="reservation-portal__hero-shade" />

          <aside className="reservation-portal__account-status">
            <span>
              <i />
              Secure workspace
            </span>

            <strong>
              Account
              <br />
              active
            </strong>

            <small>
              Reservations, rewards, and account
              tools are protected.
            </small>
          </aside>

          <div className="reservation-portal__hero-copy">
            <span>
              {phase === 'upcoming'
                ? 'Your home is waiting'
                : phase === 'active'
                  ? 'You have arrived'
                  : 'Thank you for staying'}
            </span>

            <h2>
              {phase === 'upcoming' && (
                <>
                  Welcome home,
                  <strong>
                    {user.firstName}.
                  </strong>
                </>
              )}

              {phase === 'active' && (
                <>
                  Enjoy your stay,
                  <strong>
                    {user.firstName}.
                  </strong>
                </>
              )}

              {phase === 'complete' && (
                <>
                  Until next time,
                  <strong>
                    {user.firstName}.
                  </strong>
                </>
              )}
            </h2>

            <p>
              {property.title}
              <br />
              {property.city},{' '}
              {property.state}
            </p>

            <div className="reservation-portal__reservation-line">
              <span>
                <small>
                  Confirmation
                </small>

                <strong>
                  {reservation.id}
                </strong>
              </span>

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

              <span>
                <small>Guests</small>

                <strong>
                  {reservation.guests}
                </strong>
              </span>
            </div>
          </div>

          {phase === 'upcoming' && (
            <div className="stay-countdown">
              <span>
                <strong>
                  {String(
                    countdown.days,
                  ).padStart(2, '0')}
                </strong>
                <small>Days</small>
              </span>

              <span>
                <strong>
                  {String(
                    countdown.hours,
                  ).padStart(2, '0')}
                </strong>
                <small>Hours</small>
              </span>

              <span>
                <strong>
                  {String(
                    countdown.minutes,
                  ).padStart(2, '0')}
                </strong>
                <small>Minutes</small>
              </span>

              <span>
                <strong>
                  {String(
                    countdown.seconds,
                  ).padStart(2, '0')}
                </strong>
                <small>Seconds</small>
              </span>
            </div>
          )}

          {phase === 'active' && (
            <div className="stay-live-badge">
              <span />
              Stay access is active
            </div>
          )}
        </article>

        {phase === 'upcoming' && (
          <article className="stay-access-lock">
            <div className="stay-access-lock__icon">
              <svg
                width="27"
                height="27"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
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
            </div>

            <div>
              <span>
                Arrival information protected
              </span>

              <h2>
                Your private access details unlock automatically.
              </h2>

              <p>
                The property address, map,
                directions, entry instructions,
                and emergency contact remain
                hidden until{' '}
                {formatDate(
                  reservation.checkIn,
                )}{' '}
                at {settings.checkInTime}{' '}
                in the property’s local time.
              </p>
            </div>

            <strong>
              {settings.timeZone}
            </strong>
          </article>
        )}

        {phase === 'active' && (
          <section className="stay-access-section">
            <header className="portal-section-heading">
              <div>
                <span>
                  Private arrival access
                </span>

                <h2>
                  Everything you need to settle in.
                </h2>
              </div>

              {directionsUrl && (
                <a
                  href={directionsUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open turn-by-turn directions
                  <span aria-hidden="true">
                    →
                  </span>
                </a>
              )}
            </header>

            <div className="stay-access-grid">
              <article>
                <span>Property address</span>

                <h3>
                  {settings.propertyAddress.trim() ||
                    'Address awaiting manager publication'}
                </h3>
              </article>

              <article>
                <span>
                  Arrival directions
                </span>

                <p>
                  {settings.directions.trim() ||
                    'The manager has not published additional arrival directions yet.'}
                </p>
              </article>

              <article>
                <span>
                  Entry instructions
                </span>

                <p>
                  {settings.entryInstructions.trim() ||
                    'Entry instructions are awaiting manager publication.'}
                </p>
              </article>

              <article>
                <span>
                  Property emergency contact
                </span>

                <h3>
                  {settings.emergencyContact.trim() ||
                    'Contact information awaiting manager publication'}
                </h3>
              </article>
            </div>

            {mapUrl ? (
              <div className="stay-map">
                <iframe
                  src={mapUrl}
                  title={`Map for ${property.title}`}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              </div>
            ) : (
              <div className="stay-map stay-map--empty">
                <span>
                  Map awaiting property address
                </span>

                <p>
                  Management must publish the
                  verified address before the map
                  can appear.
                </p>
              </div>
            )}
          </section>
        )}

        {phase === 'complete' && (
          <article className="stay-complete-card">
            <span>Reservation complete</span>

            <h2>
              We hope this felt like home.
            </h2>

            <p>
              Your private conversation and
              confirmation details remain available
              for reference. Arrival access details
              are no longer displayed.
            </p>

            <Link to="/">
              Find your next home away from home
              <span aria-hidden="true">→</span>
            </Link>
          </article>
        )}

        <div className="reservation-portal__content-grid">
          <section className="stay-reminders">
            <header className="portal-section-heading">
              <div>
                <span>
                  A few things to remember
                </span>

                <h2>
                  Treat it like home.
                </h2>
              </div>
            </header>

            <div className="stay-reminders__grid">
              {enabledReminders.map(
                (
                  reminder,
                  index,
                ) => (
                  <article
                    key={reminder.id}
                  >
                    <strong>
                      {String(
                        index + 1,
                      ).padStart(2, '0')}
                    </strong>

                    <div>
                      <h3>
                        {reminder.title}
                      </h3>

                      <p>
                        {reminder.message}
                      </p>
                    </div>
                  </article>
                ),
              )}
            </div>

            {settings.complimentaryItems
              .length > 0 && (
              <div className="stay-complimentary">
                <span aria-hidden="true">
                  ✦
                </span>

                <div>
                  <small>
                    Complimentary during your stay
                  </small>

                  <strong>
                    {settings.complimentaryItems.join(
                      ' · ',
                    )}
                  </strong>
                </div>
              </div>
            )}
          </section>

          <section className="stay-chat">
            <header className="stay-chat__header">
              <div>
                <span>
                  Private owner communication
                </span>

                <h2>
                  Property chat
                </h2>
              </div>

              <strong>
                <i />
                Open
              </strong>
            </header>

            <div className="stay-chat__messages">
              {messages.map(
                (message) => (
                  <article
                    className={
                      message.senderRole ===
                      'member'
                        ? 'is-member'
                        : 'is-manager'
                    }
                    key={message.id}
                  >
                    <div>
                      <strong>
                        {message.senderName}
                      </strong>

                      <small>
                        {messageTimeFormatter.format(
                          new Date(
                            message.createdAt,
                          ),
                        )}
                      </small>
                    </div>

                    <p>
                      {message.message}
                    </p>
                  </article>
                ),
              )}
            </div>

            <form
              className="stay-chat__composer"
              onSubmit={
                handleSendMessage
              }
            >
              <label>
                <span>
                  Message property management
                </span>

                <textarea
                  value={chatMessage}
                  onChange={(event) =>
                    setChatMessage(
                      event.target.value,
                    )
                  }
                  placeholder="Write a private message..."
                  rows={3}
                />
              </label>

              <button
                type="submit"
                disabled={
                  !chatMessage.trim()
                }
              >
                Send message
                <span aria-hidden="true">
                  →
                </span>
              </button>
            </form>
          </section>
        </div>
      </section>
    </PlatformPage>
  )
}

export default ReservationPortalPage
