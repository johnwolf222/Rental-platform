import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from 'react'
import PlatformPage from '../components/layout/PlatformPage'
import {
  getPropertyById,
  properties,
} from '../data/properties'
import {
  getReservations,
  type ReservationRecord,
} from '../lib/reservations'
import {
  getStayPortalSettings,
  saveStayPortalSettings,
  type StayPortalSettings,
} from '../lib/stayPortal'
import {
  getStayMessages,
  sendStayMessage,
  STAY_CHAT_UPDATED_EVENT,
  type StayChatMessage,
} from '../lib/stayChat'
import './ManagerStayExperience.css'

const dateFormatter =
  new Intl.DateTimeFormat(
    'en-US',
    {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    },
  )

function formatDate(dateValue: string) {
  return dateFormatter.format(
    new Date(`${dateValue}T12:00:00`),
  )
}

function ManagerDashboardPage() {
  const reservations =
    useMemo(
      () => getReservations(),
      [],
    )

  const initialPropertyId =
    properties[0]?.id ?? 1

  const [
    selectedPropertyId,
    setSelectedPropertyId,
  ] = useState(initialPropertyId)

  const [
    settings,
    setSettings,
  ] =
    useState<StayPortalSettings>(
      () =>
        getStayPortalSettings(
          initialPropertyId,
        ),
    )

  const [
    savedMessage,
    setSavedMessage,
  ] = useState('')

  const reservationsForProperty =
    useMemo(
      () =>
        reservations.filter(
          (reservation) =>
            reservation.propertyId ===
            selectedPropertyId,
        ),
      [
        reservations,
        selectedPropertyId,
      ],
    )

  const [
    selectedReservationId,
    setSelectedReservationId,
  ] = useState(
    reservationsForProperty[0]?.id ??
      '',
  )

  const selectedReservation:
    | ReservationRecord
    | undefined =
    reservations.find(
      (reservation) =>
        reservation.id ===
        selectedReservationId,
    )

  const selectedProperty =
    getPropertyById(
      selectedPropertyId,
    ) ?? properties[0]

  const [
    messages,
    setMessages,
  ] = useState<StayChatMessage[]>([])

  const [
    replyMessage,
    setReplyMessage,
  ] = useState('')

  useEffect(() => {
    setSettings(
      getStayPortalSettings(
        selectedPropertyId,
      ),
    )

    setSavedMessage('')

    const matchingReservation =
      reservations.find(
        (reservation) =>
          reservation.propertyId ===
          selectedPropertyId,
      )

    setSelectedReservationId(
      matchingReservation?.id ?? '',
    )
  }, [
    reservations,
    selectedPropertyId,
  ])

  useEffect(() => {
    if (
      !selectedReservation ||
      !selectedProperty
    ) {
      setMessages([])
      return
    }

    setMessages(
      getStayMessages(
        selectedReservation.id,
        selectedProperty.title,
      ),
    )
  }, [
    selectedProperty,
    selectedReservation,
  ])

  useEffect(() => {
    if (
      !selectedReservation ||
      !selectedProperty
    ) {
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
        selectedReservation.id
      ) {
        return
      }

      setMessages(
        getStayMessages(
          selectedReservation.id,
          selectedProperty.title,
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
    selectedProperty,
    selectedReservation,
  ])

  const updateReminder = (
    reminderId: string,
    field:
      | 'title'
      | 'message'
      | 'enabled',
    value: string | boolean,
  ) => {
    setSettings(
      (currentSettings) => ({
        ...currentSettings,
        reminders:
          currentSettings.reminders.map(
            (reminder) =>
              reminder.id === reminderId
                ? {
                    ...reminder,
                    [field]: value,
                  }
                : reminder,
          ),
      }),
    )
  }

  const handleSaveSettings = () => {
    const savedSettings =
      saveStayPortalSettings(
        settings,
      )

    setSettings(savedSettings)

    setSavedMessage(
      'Stay portal settings saved.',
    )
  }

  const handleManagerReply = (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault()

    if (
      !selectedReservation ||
      !replyMessage.trim()
    ) {
      return
    }

    sendStayMessage({
      reservationId:
        selectedReservation.id,
      senderRole: 'manager',
      senderName: 'Property Manager',
      message: replyMessage,
    })

    setReplyMessage('')
  }

  return (
    <PlatformPage
      heroImage={selectedProperty?.image}
      eyebrow="Manager stay operations"
      title="Manager Dashboard"
      description="Configure member arrival portals, publish protected stay information, update reminders, and communicate privately with confirmed guests."
      backLabel="Return to rentals"
      backTo="/"
    >
      <section className="manager-stay-dashboard">
        <article className="manager-stay-overview">
          {selectedProperty && (
            <img
              src={selectedProperty.image}
              alt={selectedProperty.title}
            />
          )}

          <div className="manager-stay-overview__shade" />

          <div>
            <span>
              Property stay operations
            </span>

            <h2>
              Configure the member’s homecoming.
            </h2>

            <p>
              Publish the information members
              receive before arrival and the
              protected details that unlock when
              the stay begins.
            </p>

            <label>
              <span>
                Property being managed
              </span>

              <select
                value={selectedPropertyId}
                onChange={(event) =>
                  setSelectedPropertyId(
                    Number(
                      event.target.value,
                    ),
                  )
                }
              >
                {properties.map(
                  (property) => (
                    <option
                      value={property.id}
                      key={property.id}
                    >
                      {property.title} —{' '}
                      {property.city},{' '}
                      {property.state}
                    </option>
                  ),
                )}
              </select>
            </label>
          </div>

          <aside>
            <span>
              <small>
                Confirmed reservations
              </small>

              <strong>
                {
                  reservationsForProperty.length
                }
              </strong>
            </span>

            <span>
              <small>
                Check-in time
              </small>

              <strong>
                {settings.checkInTime}
              </strong>
            </span>

            <span>
              <small>
                Portal time zone
              </small>

              <strong>
                {settings.timeZone}
              </strong>
            </span>
          </aside>
        </article>

        <div className="manager-stay-grid">
          <section className="manager-settings-panel">
            <header>
              <span>
                Arrival portal configuration
              </span>

              <h2>
                What members receive.
              </h2>

              <p>
                Address, directions, entry
                instructions, and emergency
                contact information remain hidden
                until the confirmed check-in time.
              </p>
            </header>

            <div className="manager-field-grid">
              <label>
                <span>Check-in time</span>

                <input
                  value={
                    settings.checkInTime
                  }
                  onChange={(event) =>
                    setSettings(
                      (
                        currentSettings,
                      ) => ({
                        ...currentSettings,
                        checkInTime:
                          event.target.value,
                      }),
                    )
                  }
                />
              </label>

              <label>
                <span>Check-out time</span>

                <input
                  value={
                    settings.checkOutTime
                  }
                  onChange={(event) =>
                    setSettings(
                      (
                        currentSettings,
                      ) => ({
                        ...currentSettings,
                        checkOutTime:
                          event.target.value,
                      }),
                    )
                  }
                />
              </label>

              <label className="manager-field-grid__wide">
                <span>
                  Property time zone
                </span>

                <select
                  value={settings.timeZone}
                  onChange={(event) =>
                    setSettings(
                      (
                        currentSettings,
                      ) => ({
                        ...currentSettings,
                        timeZone:
                          event.target.value,
                      }),
                    )
                  }
                >
                  <option value="America/New_York">
                    Eastern Time
                  </option>

                  <option value="America/Chicago">
                    Central Time
                  </option>

                  <option value="America/Denver">
                    Mountain Time
                  </option>

                  <option value="America/Phoenix">
                    Arizona Time
                  </option>

                  <option value="America/Los_Angeles">
                    Pacific Time
                  </option>
                </select>
              </label>

              <label className="manager-field-grid__wide">
                <span>
                  Verified property address
                </span>

                <input
                  value={
                    settings.propertyAddress
                  }
                  onChange={(event) =>
                    setSettings(
                      (
                        currentSettings,
                      ) => ({
                        ...currentSettings,
                        propertyAddress:
                          event.target.value,
                      }),
                    )
                  }
                  placeholder="Enter the verified stay address"
                />
              </label>

              <label className="manager-field-grid__wide">
                <span>
                  Arrival directions
                </span>

                <textarea
                  value={
                    settings.directions
                  }
                  onChange={(event) =>
                    setSettings(
                      (
                        currentSettings,
                      ) => ({
                        ...currentSettings,
                        directions:
                          event.target.value,
                      }),
                    )
                  }
                  placeholder="Parking, gate, driveway, building, or arrival directions"
                  rows={4}
                />
              </label>

              <label className="manager-field-grid__wide">
                <span>
                  Entry instructions
                </span>

                <textarea
                  value={
                    settings.entryInstructions
                  }
                  onChange={(event) =>
                    setSettings(
                      (
                        currentSettings,
                      ) => ({
                        ...currentSettings,
                        entryInstructions:
                          event.target.value,
                      }),
                    )
                  }
                  placeholder="Door, lockbox, concierge, key, or entry instructions"
                  rows={4}
                />
              </label>

              <label className="manager-field-grid__wide">
                <span>
                  Property emergency contact
                </span>

                <input
                  value={
                    settings.emergencyContact
                  }
                  onChange={(event) =>
                    setSettings(
                      (
                        currentSettings,
                      ) => ({
                        ...currentSettings,
                        emergencyContact:
                          event.target.value,
                      }),
                    )
                  }
                  placeholder="Name and emergency contact number"
                />
              </label>

              <label className="manager-field-grid__wide">
                <span>
                  Complimentary items
                </span>

                <textarea
                  value={
                    settings.complimentaryItems.join(
                      '\n',
                    )
                  }
                  onChange={(event) =>
                    setSettings(
                      (
                        currentSettings,
                      ) => ({
                        ...currentSettings,
                        complimentaryItems:
                          event.target.value
                            .split('\n')
                            .map((item) =>
                              item.trim(),
                            )
                            .filter(Boolean),
                      }),
                    )
                  }
                  placeholder="One complimentary item per line"
                  rows={4}
                />
              </label>
            </div>

            <div className="manager-reminders">
              <header>
                <span>
                  Welcome Home reminders
                </span>

                <h3>
                  Edit what members should remember.
                </h3>
              </header>

              {settings.reminders.map(
                (reminder) => (
                  <article
                    key={reminder.id}
                  >
                    <label className="manager-reminder-toggle">
                      <input
                        type="checkbox"
                        checked={
                          reminder.enabled
                        }
                        onChange={(
                          event,
                        ) =>
                          updateReminder(
                            reminder.id,
                            'enabled',
                            event.target
                              .checked,
                          )
                        }
                      />

                      <span>
                        {reminder.enabled
                          ? 'Visible'
                          : 'Hidden'}
                      </span>
                    </label>

                    <label>
                      <span>Reminder title</span>

                      <input
                        value={
                          reminder.title
                        }
                        onChange={(
                          event,
                        ) =>
                          updateReminder(
                            reminder.id,
                            'title',
                            event.target
                              .value,
                          )
                        }
                      />
                    </label>

                    <label>
                      <span>
                        Reminder message
                      </span>

                      <textarea
                        value={
                          reminder.message
                        }
                        onChange={(
                          event,
                        ) =>
                          updateReminder(
                            reminder.id,
                            'message',
                            event.target
                              .value,
                          )
                        }
                        rows={3}
                      />
                    </label>
                  </article>
                ),
              )}
            </div>

            <div className="manager-settings-actions">
              <button
                type="button"
                onClick={
                  handleSaveSettings
                }
              >
                Save stay portal settings
              </button>

              {savedMessage && (
                <span>
                  {savedMessage}
                </span>
              )}
            </div>
          </section>

          <aside className="manager-chat-panel">
            <header>
              <span>
                Private member communication
              </span>

              <h2>
                Reservation chat
              </h2>
            </header>

            {reservationsForProperty.length >
            0 ? (
              <>
                <label className="manager-reservation-select">
                  <span>
                    Confirmed reservation
                  </span>

                  <select
                    value={
                      selectedReservationId
                    }
                    onChange={(event) =>
                      setSelectedReservationId(
                        event.target.value,
                      )
                    }
                  >
                    {reservationsForProperty.map(
                      (reservation) => (
                        <option
                          value={
                            reservation.id
                          }
                          key={
                            reservation.id
                          }
                        >
                          {reservation.id} —{' '}
                          {formatDate(
                            reservation.checkIn,
                          )}
                        </option>
                      ),
                    )}
                  </select>
                </label>

                {selectedReservation && (
                  <div className="manager-reservation-summary">
                    <span>
                      <small>Arrival</small>

                      <strong>
                        {formatDate(
                          selectedReservation.checkIn,
                        )}
                      </strong>
                    </span>

                    <span>
                      <small>Departure</small>

                      <strong>
                        {formatDate(
                          selectedReservation.checkOut,
                        )}
                      </strong>
                    </span>

                    <span>
                      <small>Guests</small>

                      <strong>
                        {
                          selectedReservation.guests
                        }
                      </strong>
                    </span>
                  </div>
                )}

                <div className="manager-chat-messages">
                  {messages.map(
                    (message) => (
                      <article
                        className={
                          message.senderRole ===
                          'manager'
                            ? 'is-manager'
                            : 'is-member'
                        }
                        key={message.id}
                      >
                        <strong>
                          {message.senderName}
                        </strong>

                        <p>
                          {message.message}
                        </p>
                      </article>
                    ),
                  )}
                </div>

                <form
                  onSubmit={
                    handleManagerReply
                  }
                  className="manager-chat-composer"
                >
                  <label>
                    <span>
                      Reply privately
                    </span>

                    <textarea
                      value={replyMessage}
                      onChange={(event) =>
                        setReplyMessage(
                          event.target.value,
                        )
                      }
                      rows={4}
                      placeholder="Write a message to the member..."
                    />
                  </label>

                  <button
                    type="submit"
                    disabled={
                      !replyMessage.trim()
                    }
                  >
                    Send manager reply
                  </button>
                </form>
              </>
            ) : (
              <div className="manager-chat-empty">
                <span>
                  No confirmed reservations
                </span>

                <p>
                  Reservation conversations will
                  appear here after a member
                  confirms this property.
                </p>
              </div>
            )}
          </aside>
        </div>
      </section>
    </PlatformPage>
  )
}

export default ManagerDashboardPage
