import {
  creditRewardPoints,
  debitRewardPoints,
  getRewardBalance,
} from '../lib/rewards'
import { createNotification } from '../lib/notifications'
import {
  addManagerDateBlock,
  formatUnavailableRange,
  getManagerDateBlocks,
  removeManagerDateBlock,
} from '../lib/availability'
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
  RESERVATIONS_UPDATED_EVENT,
  type ReservationRecord,
  type ReservationRefundStatus,
} from '../lib/reservations'
import {
  approveReservationCancellation,
  cancelReservationByManager,
  rejectReservationCancellation,
  updateReservationRefundStatus,
} from '../lib/reservationManagement'
import ReservationStatusBadge from '../components/reservations/ReservationStatusBadge'
import ReservationTimeline from '../components/reservations/ReservationTimeline'
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
import '../components/booking/BookingAvailability.css'
import '../components/reservations/ReservationManagement.css'
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
  const [
    reservationVersion,
    setReservationVersion,
  ] = useState(0)

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

  const reservations =
    useMemo(
      () => {
        void reservationVersion
        return getReservations()
      },
      [reservationVersion],
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

  const [
    announcementType,
    setAnnouncementType,
  ] = useState<'property' | 'deal'>(
    'property',
  )

  const [
    announcementTitle,
    setAnnouncementTitle,
  ] = useState('')

  const [
    announcementMessage,
    setAnnouncementMessage,
  ] = useState('')

  const [
    announcementStatus,
    setAnnouncementStatus,
  ] = useState('')

  const [
    pointAmount,
    setPointAmount,
  ] = useState('100')

  const [
    pointReason,
    setPointReason,
  ] = useState('Manager reward adjustment')

  const [
    pointStatus,
    setPointStatus,
  ] = useState('')

  const [blockStartDate, setBlockStartDate] =
    useState('')
  const [blockEndDate, setBlockEndDate] =
    useState('')
  const [blockReason, setBlockReason] =
    useState('Maintenance or owner hold')
  const [availabilityStatus, setAvailabilityStatus] =
    useState('')
  const [availabilityVersion, setAvailabilityVersion] =
    useState(0)

  const [
    reservationActionStatus,
    setReservationActionStatus,
  ] = useState('')

  const [
    managerDecisionNote,
    setManagerDecisionNote,
  ] = useState('')

  const [
    selectedRefundStatus,
    setSelectedRefundStatus,
  ] =
    useState<ReservationRefundStatus>(
      'review-required',
    )

  const managerDateBlocks = useMemo(
    () => {
      void availabilityVersion
      return getManagerDateBlocks(
        selectedPropertyId,
      )
    },
    [
      availabilityVersion,
      selectedPropertyId,
    ],
  )

  useEffect(() => {
    // Synchronize persisted portal settings with the selected property.
    // eslint-disable-next-line react-hooks/set-state-in-effect
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
      // Clear a prior conversation when no reservation is selected.
      // eslint-disable-next-line react-hooks/set-state-in-effect
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

    const notifiedMemberIds =
      new Set(
        reservationsForProperty.map(
          (reservation) =>
            reservation.memberId,
        ),
      )

    notifiedMemberIds.forEach(
      (memberId) => {
        createNotification({
          memberId,
          type: 'stay',
          title: 'Stay information updated',
          message:
            `${selectedProperty?.title ?? 'Your property'} has updated arrival information, reminders, or stay instructions.`,
          link: '/stays',
        })
      },
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

    createNotification({
      memberId:
        selectedReservation.memberId,
      type: 'message',
      title: 'New property-manager message',
      message:
        `Property management sent a new private message regarding ${selectedReservation.propertyTitle}.`,
      link:
        `/stays/${selectedReservation.id}`,
    })

    setReplyMessage('')
  }

  const handlePublishAnnouncement = (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault()

    if (
      !announcementTitle.trim() ||
      !announcementMessage.trim()
    ) {
      setAnnouncementStatus(
        'Enter both a title and message.',
      )
      return
    }

    createNotification({
      memberId: 'all',
      type: announcementType,
      title: announcementTitle,
      message: announcementMessage,
      link:
        announcementType === 'property' &&
        selectedProperty
          ? `/properties/${selectedProperty.id}`
          : '/',
    })

    setAnnouncementStatus(
      `${
        announcementType === 'property'
          ? 'Property'
          : 'Deal'
      } update published.`,
    )

    setAnnouncementTitle('')
    setAnnouncementMessage('')
  }

  const handleRewardAdjustment = (
    direction: 'credit' | 'debit',
  ) => {
    if (!selectedReservation) {
      setPointStatus(
        'Select a confirmed reservation first.',
      )
      return
    }

    const amount = Number.parseInt(
      pointAmount,
      10,
    )

    if (
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      setPointStatus(
        'Enter a valid point amount.',
      )
      return
    }

    try {
      const result =
        direction === 'credit'
          ? creditRewardPoints({
              memberId:
                selectedReservation.memberId,
              amount,
              reason: pointReason,
            })
          : debitRewardPoints({
              memberId:
                selectedReservation.memberId,
              amount,
              reason: pointReason,
            })

      createNotification({
        memberId:
          selectedReservation.memberId,
        type: 'reward',
        title:
          direction === 'credit'
            ? 'Reward points added'
            : 'Reward points used',
        message:
          `${amount.toLocaleString(
            'en-US',
          )} points were ${
            direction === 'credit'
              ? 'added to'
              : 'used from'
          } your reward account. Your available balance is ${result.balance.toLocaleString(
            'en-US',
          )} points.`,
        link: '/profile',
      })

      setPointStatus(
        `${amount.toLocaleString(
          'en-US',
        )} points ${
          direction === 'credit'
            ? 'added'
            : 'used'
        }.`,
      )
    } catch (error) {
      setPointStatus(
        error instanceof Error
          ? error.message
          : 'The reward adjustment could not be completed.',
      )
    }
  }

  const handleAddDateBlock = (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault()

    try {
      addManagerDateBlock(
        {
          propertyId: selectedPropertyId,
          startDate: blockStartDate,
          endDate: blockEndDate,
          reason: blockReason,
        },
        getReservations(),
      )

      setBlockStartDate('')
      setBlockEndDate('')
      setAvailabilityStatus(
        'Unavailable dates saved.',
      )
      setAvailabilityVersion(
        (currentVersion) => currentVersion + 1,
      )
    } catch (error) {
      setAvailabilityStatus(
        error instanceof Error
          ? error.message
          : 'The unavailable dates could not be saved.',
      )
    }
  }

  const handleRemoveDateBlock = (
    blockId: string,
  ) => {
    if (!removeManagerDateBlock(blockId)) {
      setAvailabilityStatus(
        'That blocked range was not found.',
      )
      return
    }

    setAvailabilityStatus(
      'Unavailable dates removed.',
    )
    setAvailabilityVersion(
      (currentVersion) => currentVersion + 1,
    )
  }

  const handleApproveCancellation = () => {
    if (!selectedReservation) {
      setReservationActionStatus(
        'Select a reservation first.',
      )
      return
    }

    if (
      !window.confirm(
        'Approve this cancellation and release the dates?',
      )
    ) {
      return
    }

    try {
      approveReservationCancellation({
        reservationId:
          selectedReservation.id,
        managerNote:
          managerDecisionNote,
      })

      setReservationActionStatus(
        'Cancellation approved. The dates are available again.',
      )
      setManagerDecisionNote('')
    } catch (error) {
      setReservationActionStatus(
        error instanceof Error
          ? error.message
          : 'The cancellation could not be approved.',
      )
    }
  }

  const handleRejectCancellation = () => {
    if (!selectedReservation) {
      setReservationActionStatus(
        'Select a reservation first.',
      )
      return
    }

    try {
      rejectReservationCancellation({
        reservationId:
          selectedReservation.id,
        managerNote:
          managerDecisionNote,
      })

      setReservationActionStatus(
        'Cancellation request declined. The reservation remains confirmed.',
      )
      setManagerDecisionNote('')
    } catch (error) {
      setReservationActionStatus(
        error instanceof Error
          ? error.message
          : 'The cancellation request could not be declined.',
      )
    }
  }

  const handleManagerCancellation = () => {
    if (!selectedReservation) {
      setReservationActionStatus(
        'Select a reservation first.',
      )
      return
    }

    if (
      !window.confirm(
        'Cancel this reservation and release the dates?',
      )
    ) {
      return
    }

    try {
      cancelReservationByManager({
        reservationId:
          selectedReservation.id,
        managerNote:
          managerDecisionNote,
      })

      setReservationActionStatus(
        'Reservation cancelled. The dates are available again.',
      )
      setManagerDecisionNote('')
    } catch (error) {
      setReservationActionStatus(
        error instanceof Error
          ? error.message
          : 'The reservation could not be cancelled.',
      )
    }
  }

  const handleRefundStatusUpdate = () => {
    if (!selectedReservation) {
      setReservationActionStatus(
        'Select a reservation first.',
      )
      return
    }

    try {
      updateReservationRefundStatus({
        reservationId:
          selectedReservation.id,
        refundStatus:
          selectedRefundStatus,
        managerNote:
          managerDecisionNote,
      })

      setReservationActionStatus(
        'Refund status updated.',
      )
      setManagerDecisionNote('')
    } catch (error) {
      setReservationActionStatus(
        error instanceof Error
          ? error.message
          : 'The refund status could not be updated.',
      )
    }
  }

  const selectedMemberBalance =
    selectedReservation
      ? getRewardBalance(
          selectedReservation.memberId,
        )
      : 0

  return (
    <PlatformPage
      heroImage={selectedProperty?.image}
      eyebrow="Manager stay operations"
      title="Manager Dashboard"
      description="Manage reservations, cancellation requests, refund status, arrival portals, availability, rewards, and private member communication."
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
                onChange={(event) => {
                  setSelectedPropertyId(
                    Number(
                      event.target.value,
                    ),
                  )
                  setAvailabilityStatus('')
                }}
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
                Total reservations
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

        <section
          className="manager-availability-panel"
          aria-label="Property availability controls"
        >
          <header className="manager-availability-panel__header">
            <div>
              <span>Booking availability</span>
              <h2>Block unavailable dates.</h2>
            </div>

            <p>
              Confirmed reservations are blocked automatically.
              Add maintenance, owner-use, or preparation holds here.
            </p>
          </header>

          <form
            className="manager-availability-form"
            onSubmit={handleAddDateBlock}
          >
            <label>
              <span>Unavailable from</span>
              <input
                type="date"
                value={blockStartDate}
                onChange={(event) => {
                  setBlockStartDate(event.target.value)
                  setAvailabilityStatus('')
                }}
                required
              />
            </label>

            <label>
              <span>Available again</span>
              <input
                type="date"
                min={blockStartDate || undefined}
                value={blockEndDate}
                onChange={(event) => {
                  setBlockEndDate(event.target.value)
                  setAvailabilityStatus('')
                }}
                required
              />
            </label>

            <label>
              <span>Reason</span>
              <input
                value={blockReason}
                onChange={(event) =>
                  setBlockReason(event.target.value)
                }
                placeholder="Maintenance or owner hold"
              />
            </label>

            <button type="submit">Block dates</button>
          </form>

          {availabilityStatus && (
            <p
              className="manager-availability-panel__message"
              role="status"
            >
              {availabilityStatus}
            </p>
          )}

          <div className="manager-availability-list">
            {managerDateBlocks.length > 0 ? (
              managerDateBlocks.map((block) => (
                <article key={block.id}>
                  <div>
                    <strong>
                      {formatUnavailableRange({
                        startDate: block.startDate,
                        endDate: block.endDate,
                      })}
                    </strong>
                    <small>{block.reason}</small>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      handleRemoveDateBlock(block.id)
                    }
                  >
                    Remove
                  </button>
                </article>
              ))
            ) : (
              <p className="manager-availability-list__empty">
                No manager-blocked dates for this property.
              </p>
            )}
          </div>
        </section>

        <section
          className="manager-reservation-management"
          aria-label="Reservation management controls"
        >
          <header className="manager-reservation-management__header">
            <div>
              <span>Reservation management</span>
              <h2>
                Review changes and cancellations.
              </h2>
            </div>

            <p>
              Cancellation requests keep dates blocked
              until management records a decision.
              Cancelled reservations release dates
              automatically.
            </p>
          </header>

          <div className="manager-reservation-selector">
            <label>
              <span>
                Reservation for this property
              </span>

              <select
                value={selectedReservationId}
                onChange={(event) => {
                  setSelectedReservationId(
                    event.target.value,
                  )
                  setReservationActionStatus('')
                  setManagerDecisionNote('')
                }}
              >
                <option value="">
                  Select a reservation
                </option>

                {reservationsForProperty.map(
                  (reservation) => (
                    <option
                      value={reservation.id}
                      key={reservation.id}
                    >
                      {reservation.propertyTitle} —{' '}
                      {formatDate(
                        reservation.checkIn,
                      )}{' '}
                      —{' '}
                      {reservation.reservationStatus}
                    </option>
                  ),
                )}
              </select>
            </label>

            {selectedReservation && (
              <ReservationStatusBadge
                reservation={
                  selectedReservation
                }
                showRefund
              />
            )}
          </div>

          {selectedReservation ? (
            <article className="manager-reservation-summary">
              <div className="manager-reservation-summary__facts">
                <span>
                  <small>Member</small>
                  <strong>
                    {selectedReservation.memberId}
                  </strong>
                </span>

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
                  <small>Confirmation</small>
                  <strong>
                    {selectedReservation.id}
                  </strong>
                </span>
              </div>

              <div className="manager-reservation-review">
                <details
                  className="reservation-history-details"
                  open={
                    selectedReservation
                      .reservationStatus ===
                    'cancellation-requested'
                  }
                >
                  <summary>
                    Reservation history
                  </summary>

                  <ReservationTimeline
                    events={
                      selectedReservation.statusHistory
                    }
                  />
                </details>

                <div className="manager-reservation-decision">
                  {selectedReservation
                    .cancellationReason && (
                    <p>
                      <strong>
                        Member request:
                      </strong>{' '}
                      {
                        selectedReservation
                          .cancellationReason
                      }
                    </p>
                  )}

                  <label>
                    <span>
                      Management note
                    </span>

                    <textarea
                      value={managerDecisionNote}
                      onChange={(event) =>
                        setManagerDecisionNote(
                          event.target.value,
                        )
                      }
                      rows={4}
                      placeholder="Add a clear decision or refund note."
                    />
                  </label>

                  {selectedReservation
                    .reservationStatus ===
                    'cancelled' && (
                    <label>
                      <span>
                        Refund status
                      </span>

                      <select
                        value={
                          selectedRefundStatus
                        }
                        onChange={(event) =>
                          setSelectedRefundStatus(
                            event.target
                              .value as ReservationRefundStatus,
                          )
                        }
                      >
                        <option value="review-required">
                          Review required
                        </option>
                        <option value="pending">
                          Refund pending
                        </option>
                        <option value="partial">
                          Partial refund
                        </option>
                        <option value="full">
                          Full refund approved
                        </option>
                        <option value="not-refundable">
                          Nonrefundable
                        </option>
                        <option value="completed">
                          Refund completed
                        </option>
                      </select>
                    </label>
                  )}

                  <div className="manager-reservation-actions">
                    {selectedReservation
                      .reservationStatus ===
                      'cancellation-requested' && (
                      <>
                        <button
                          type="button"
                          onClick={
                            handleApproveCancellation
                          }
                        >
                          Approve cancellation
                        </button>

                        <button
                          type="button"
                          onClick={
                            handleRejectCancellation
                          }
                        >
                          Keep reservation
                        </button>
                      </>
                    )}

                    {selectedReservation
                      .reservationStatus ===
                      'confirmed' && (
                      <button
                        type="button"
                        className="is-danger"
                        onClick={
                          handleManagerCancellation
                        }
                      >
                        Cancel reservation
                      </button>
                    )}

                    {selectedReservation
                      .reservationStatus ===
                      'cancelled' && (
                      <button
                        type="button"
                        onClick={
                          handleRefundStatusUpdate
                        }
                      >
                        Save refund status
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {reservationActionStatus && (
                <p
                  className="manager-reservation-message"
                  role="status"
                >
                  {reservationActionStatus}
                </p>
              )}
            </article>
          ) : (
            <p className="manager-reservation-message">
              No reservation is selected for this
              property.
            </p>
          )}
        </section>

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

        <section className="manager-member-activity">
          <article className="manager-activity-card">
            <header>
              <span>
                Member announcement publisher
              </span>

              <h2>
                Publish a property or deal update.
              </h2>

              <p>
                The announcement appears instantly
                in every member’s notification
                center and unread bell count.
              </p>
            </header>

            <form
              onSubmit={
                handlePublishAnnouncement
              }
            >
              <label>
                <span>Update type</span>

                <select
                  value={announcementType}
                  onChange={(event) =>
                    setAnnouncementType(
                      event.target.value as
                        | 'property'
                        | 'deal',
                    )
                  }
                >
                  <option value="property">
                    New property
                  </option>

                  <option value="deal">
                    New member deal
                  </option>
                </select>
              </label>

              <label>
                <span>Notification title</span>

                <input
                  value={announcementTitle}
                  onChange={(event) =>
                    setAnnouncementTitle(
                      event.target.value,
                    )
                  }
                  placeholder="Example: New Atlanta property available"
                />
              </label>

              <label>
                <span>Member update</span>

                <textarea
                  value={announcementMessage}
                  onChange={(event) =>
                    setAnnouncementMessage(
                      event.target.value,
                    )
                  }
                  placeholder="Describe the new property, offer, dates, or deal."
                  rows={5}
                />
              </label>

              <button type="submit">
                Publish member update
              </button>

              {announcementStatus && (
                <strong>
                  {announcementStatus}
                </strong>
              )}
            </form>
          </article>

          <article className="manager-activity-card">
            <header>
              <span>
                Member reward controls
              </span>

              <h2>
                Add or use reward points.
              </h2>

              <p>
                Every adjustment creates a permanent
                reward transaction and an immediate
                member notification.
              </p>
            </header>

            {selectedReservation ? (
              <>
                <div className="manager-reward-member">
                  <span>
                    <small>
                      Selected confirmation
                    </small>

                    <strong>
                      {selectedReservation.id}
                    </strong>
                  </span>

                  <span>
                    <small>
                      Current balance
                    </small>

                    <strong>
                      {selectedMemberBalance.toLocaleString(
                        'en-US',
                      )}{' '}
                      points
                    </strong>
                  </span>
                </div>

                <div className="manager-reward-form">
                  <label>
                    <span>Point amount</span>

                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={pointAmount}
                      onChange={(event) =>
                        setPointAmount(
                          event.target.value,
                        )
                      }
                    />
                  </label>

                  <label>
                    <span>
                      Adjustment reason
                    </span>

                    <input
                      value={pointReason}
                      onChange={(event) =>
                        setPointReason(
                          event.target.value,
                        )
                      }
                    />
                  </label>

                  <div>
                    <button
                      type="button"
                      onClick={() =>
                        handleRewardAdjustment(
                          'credit',
                        )
                      }
                    >
                      Add points
                    </button>

                    <button
                      type="button"
                      className="is-secondary"
                      onClick={() =>
                        handleRewardAdjustment(
                          'debit',
                        )
                      }
                    >
                      Use points
                    </button>
                  </div>

                  {pointStatus && (
                    <strong>
                      {pointStatus}
                    </strong>
                  )}
                </div>
              </>
            ) : (
              <div className="manager-reward-empty">
                Select a property with a confirmed
                reservation to manage member points.
              </div>
            )}
          </article>
        </section>
      </section>
    </PlatformPage>
  )
}

export default ManagerDashboardPage
