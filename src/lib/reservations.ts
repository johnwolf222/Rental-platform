import { checkPropertyAvailability } from './availability'

export type ReservationPaymentPlan =
  | 'pay-in-full'
  | 'split-stay'

export type ReservationPaymentMethod =
  | 'card'
  | 'paypal'
  | 'apple-pay'

export type ReservationStatus =
  | 'confirmed'
  | 'cancellation-requested'
  | 'cancelled'

export type ReservationPaymentStatus =
  | 'pending-authorization'
  | 'refund-review'
  | 'refund-pending'
  | 'partially-refunded'
  | 'refunded'
  | 'non-refundable'

export type ReservationRefundStatus =
  | 'not-applicable'
  | 'review-required'
  | 'pending'
  | 'partial'
  | 'full'
  | 'not-refundable'
  | 'completed'

export type ReservationHistoryActor =
  | 'member'
  | 'manager'
  | 'system'

export type ReservationHistoryEvent = {
  id: string
  title: string
  detail: string
  actor: ReservationHistoryActor
  createdAt: string
}

export const RESERVATIONS_UPDATED_EVENT =
  'rental-platform-reservations-updated'

export type ReservationRecord = {
  id: string
  memberId: string
  propertyId: number
  propertyTitle: string
  checkIn: string
  checkOut: string
  guests: number
  nights: number
  nightlyRate: number
  lodgingSubtotal: number
  cleaningFee: number
  serviceFee: number
  estimatedTaxes: number
  totalInvestment: number
  dueToday: number
  remainingBalance: number
  paymentPlan: ReservationPaymentPlan
  paymentMethod: ReservationPaymentMethod
  expectedPoints: number
  reservationStatus: ReservationStatus
  paymentStatus: ReservationPaymentStatus
  refundStatus: ReservationRefundStatus
  cancellationReason?: string
  cancellationRequestedAt?: string
  cancelledAt?: string
  managerDecisionNote?: string
  statusHistory: ReservationHistoryEvent[]
  createdAt: string
}

const RESERVATIONS_STORAGE_KEY =
  'rental-platform-reservations-v1'

function createHistoryEventId() {
  return `STATUS-${Date.now()
    .toString(36)
    .toUpperCase()}-${Math.random()
    .toString(36)
    .slice(2, 7)
    .toUpperCase()}`
}

export function createReservationHistoryEvent({
  title,
  detail,
  actor,
  createdAt = new Date().toISOString(),
}: {
  title: string
  detail: string
  actor: ReservationHistoryActor
  createdAt?: string
}): ReservationHistoryEvent {
  return {
    id: createHistoryEventId(),
    title: title.trim(),
    detail: detail.trim(),
    actor,
    createdAt,
  }
}

function normalizeReservation(
  reservation: ReservationRecord,
): ReservationRecord {
  const createdAt =
    reservation.createdAt ||
    new Date().toISOString()

  const statusHistory: ReservationHistoryEvent[] =
    Array.isArray(reservation.statusHistory) &&
    reservation.statusHistory.length > 0
      ? reservation.statusHistory
      : [
          {
            id:
              `STATUS-${reservation.id}-CONFIRMED`,
            title: 'Reservation confirmed',
            detail:
              'The reservation was confirmed and the selected dates were blocked.',
            actor: 'system',
            createdAt,
          },
        ]

  return {
    ...reservation,
    reservationStatus:
      reservation.reservationStatus ??
      'confirmed',
    paymentStatus:
      reservation.paymentStatus ??
      'pending-authorization',
    refundStatus:
      reservation.refundStatus ??
      'not-applicable',
    statusHistory,
    createdAt,
  }
}

function readReservations(): ReservationRecord[] {
  if (typeof window === 'undefined') {
    return []
  }

  try {
    const storedValue = window.localStorage.getItem(
      RESERVATIONS_STORAGE_KEY,
    )

    if (!storedValue) {
      return []
    }

    const parsedValue = JSON.parse(storedValue)

    return Array.isArray(parsedValue)
      ? (parsedValue as ReservationRecord[]).map(
          normalizeReservation,
        )
      : []
  } catch {
    return []
  }
}

function writeReservations(
  reservations: ReservationRecord[],
) {
  window.localStorage.setItem(
    RESERVATIONS_STORAGE_KEY,
    JSON.stringify(reservations),
  )

  window.dispatchEvent(
    new CustomEvent(
      RESERVATIONS_UPDATED_EVENT,
    ),
  )

  window.dispatchEvent(
    new CustomEvent(
      'rental-platform-availability-updated',
    ),
  )
}

function createReservationId() {
  const timestamp = Date.now()
    .toString(36)
    .toUpperCase()

  const randomValue = Math.random()
    .toString(36)
    .slice(2, 7)
    .toUpperCase()

  return `RP-${timestamp}-${randomValue}`
}

export function isReservationAvailabilityBlocking(
  reservationStatus: ReservationStatus,
) {
  return (
    reservationStatus === 'confirmed' ||
    reservationStatus ===
      'cancellation-requested'
  )
}

export function createReservation(
  input: Omit<
    ReservationRecord,
    | 'id'
    | 'reservationStatus'
    | 'paymentStatus'
    | 'refundStatus'
    | 'statusHistory'
    | 'createdAt'
  >,
): ReservationRecord {
  const currentReservations = readReservations()

  const availability = checkPropertyAvailability({
    propertyId: input.propertyId,
    checkIn: input.checkIn,
    checkOut: input.checkOut,
    reservations: currentReservations,
  })

  if (!availability.available) {
    throw new Error(availability.message)
  }

  const createdAt =
    new Date().toISOString()

  const reservation: ReservationRecord = {
    ...input,
    id: createReservationId(),
    reservationStatus: 'confirmed',
    paymentStatus: 'pending-authorization',
    refundStatus: 'not-applicable',
    statusHistory: [
      createReservationHistoryEvent({
        title: 'Reservation confirmed',
        detail:
          'The reservation was confirmed and the selected dates were blocked.',
        actor: 'system',
        createdAt,
      }),
    ],
    createdAt,
  }

  writeReservations([
    reservation,
    ...currentReservations,
  ])

  return reservation
}

export function updateReservation(
  reservationId: string,
  updater: (
    reservation: ReservationRecord,
  ) => ReservationRecord,
): ReservationRecord {
  const reservations = readReservations()

  const reservationIndex =
    reservations.findIndex(
      (reservation) =>
        reservation.id === reservationId,
    )

  if (reservationIndex < 0) {
    throw new Error(
      'That reservation could not be found.',
    )
  }

  const nextReservation = normalizeReservation(
    updater({
      ...reservations[reservationIndex],
      statusHistory: [
        ...reservations[reservationIndex]
          .statusHistory,
      ],
    }),
  )

  const nextReservations = [
    ...reservations,
  ]

  nextReservations[reservationIndex] =
    nextReservation

  writeReservations(nextReservations)

  return nextReservation
}

export function getReservations() {
  return readReservations()
}

export function getReservationById(
  reservationId: string | undefined,
): ReservationRecord | undefined {
  if (!reservationId) {
    return undefined
  }

  return readReservations().find(
    (reservation) =>
      reservation.id === reservationId,
  )
}

export function getReservationsForMember(
  memberId: string,
): ReservationRecord[] {
  return readReservations().filter(
    (reservation) =>
      reservation.memberId === memberId,
  )
}
