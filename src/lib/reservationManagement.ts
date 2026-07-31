import { getTodayDateValue } from './availability'
import { createNotification } from './notifications'
import {
  createReservationHistoryEvent,
  getReservationById,
  updateReservation,
  type ReservationRecord,
  type ReservationRefundStatus,
} from './reservations'

export type ReservationStatusPresentation = {
  label: string
  description: string
  tone:
    | 'confirmed'
    | 'requested'
    | 'cancelled'
}

export function getReservationStatusPresentation(
  reservation: Pick<
    ReservationRecord,
    'reservationStatus'
  >,
): ReservationStatusPresentation {
  switch (reservation.reservationStatus) {
    case 'cancellation-requested':
      return {
        label: 'Cancellation requested',
        description:
          'Management is reviewing this request. The dates remain unavailable until a decision is made.',
        tone: 'requested',
      }

    case 'cancelled':
      return {
        label: 'Cancelled',
        description:
          'This reservation is closed and its dates are available again unless management has blocked them.',
        tone: 'cancelled',
      }

    case 'confirmed':
    default:
      return {
        label: 'Confirmed',
        description:
          'This reservation is active and the selected dates are protected.',
        tone: 'confirmed',
      }
  }
}

export function getRefundStatusLabel(
  refundStatus: ReservationRefundStatus,
) {
  switch (refundStatus) {
    case 'review-required':
      return 'Refund review required'
    case 'pending':
      return 'Refund pending'
    case 'partial':
      return 'Partial refund'
    case 'full':
      return 'Full refund approved'
    case 'not-refundable':
      return 'Nonrefundable'
    case 'completed':
      return 'Refund completed'
    case 'not-applicable':
    default:
      return 'No refund activity'
  }
}

export function canMemberRequestCancellation(
  reservation: ReservationRecord,
) {
  return (
    reservation.reservationStatus ===
      'confirmed' &&
    reservation.checkIn >
      getTodayDateValue()
  )
}

export function requestReservationCancellation({
  reservationId,
  memberId,
  reason,
}: {
  reservationId: string
  memberId: string
  reason: string
}) {
  const existingReservation =
    getReservationById(reservationId)

  if (!existingReservation) {
    throw new Error(
      'That reservation could not be found.',
    )
  }

  if (
    existingReservation.memberId !== memberId
  ) {
    throw new Error(
      'This reservation belongs to a different member account.',
    )
  }

  if (
    !canMemberRequestCancellation(
      existingReservation,
    )
  ) {
    throw new Error(
      existingReservation.reservationStatus ===
        'cancellation-requested'
        ? 'A cancellation request is already under review.'
        : 'This reservation can no longer be cancelled from the member dashboard.',
    )
  }

  const cleanReason = reason.trim()

  if (cleanReason.length < 5) {
    throw new Error(
      'Add a brief reason for the cancellation request.',
    )
  }

  const requestedAt =
    new Date().toISOString()

  const reservation = updateReservation(
    reservationId,
    (currentReservation) => ({
      ...currentReservation,
      reservationStatus:
        'cancellation-requested',
      paymentStatus: 'refund-review',
      refundStatus: 'review-required',
      cancellationReason: cleanReason,
      cancellationRequestedAt:
        requestedAt,
      managerDecisionNote: undefined,
      statusHistory: [
        ...currentReservation.statusHistory,
        createReservationHistoryEvent({
          title: 'Cancellation requested',
          detail:
            `The member requested cancellation. Reason: ${cleanReason}`,
          actor: 'member',
          createdAt: requestedAt,
        }),
      ],
    }),
  )

  createNotification({
    memberId,
    type: 'booking',
    title: 'Cancellation request received',
    message:
      `${reservation.propertyTitle} remains confirmed while management reviews your cancellation request.`,
    link: '/stays',
    dedupeKey:
      `cancellation-requested:${reservation.id}:${requestedAt}`,
  })

  return reservation
}

export function approveReservationCancellation({
  reservationId,
  managerNote,
}: {
  reservationId: string
  managerNote: string
}) {
  const existingReservation =
    getReservationById(reservationId)

  if (!existingReservation) {
    throw new Error(
      'That reservation could not be found.',
    )
  }

  if (
    existingReservation.reservationStatus !==
    'cancellation-requested'
  ) {
    throw new Error(
      'This reservation does not have a pending cancellation request.',
    )
  }

  const cancelledAt =
    new Date().toISOString()

  const cleanNote =
    managerNote.trim() ||
    'Cancellation approved by management.'

  const reservation = updateReservation(
    reservationId,
    (currentReservation) => ({
      ...currentReservation,
      reservationStatus: 'cancelled',
      paymentStatus: 'refund-review',
      refundStatus: 'review-required',
      cancelledAt,
      managerDecisionNote: cleanNote,
      statusHistory: [
        ...currentReservation.statusHistory,
        createReservationHistoryEvent({
          title: 'Cancellation approved',
          detail:
            `${cleanNote} The property dates were released.`,
          actor: 'manager',
          createdAt: cancelledAt,
        }),
      ],
    }),
  )

  createNotification({
    memberId: reservation.memberId,
    type: 'booking',
    title: 'Reservation cancelled',
    message:
      `${reservation.propertyTitle} was cancelled. Refund eligibility is now under review.`,
    link: '/stays',
    dedupeKey:
      `cancellation-approved:${reservation.id}:${cancelledAt}`,
  })

  return reservation
}

export function rejectReservationCancellation({
  reservationId,
  managerNote,
}: {
  reservationId: string
  managerNote: string
}) {
  const existingReservation =
    getReservationById(reservationId)

  if (!existingReservation) {
    throw new Error(
      'That reservation could not be found.',
    )
  }

  if (
    existingReservation.reservationStatus !==
    'cancellation-requested'
  ) {
    throw new Error(
      'This reservation does not have a pending cancellation request.',
    )
  }

  const decidedAt =
    new Date().toISOString()

  const cleanNote =
    managerNote.trim() ||
    'Management kept the reservation active.'

  const reservation = updateReservation(
    reservationId,
    (currentReservation) => ({
      ...currentReservation,
      reservationStatus: 'confirmed',
      paymentStatus:
        'pending-authorization',
      refundStatus: 'not-applicable',
      managerDecisionNote: cleanNote,
      statusHistory: [
        ...currentReservation.statusHistory,
        createReservationHistoryEvent({
          title:
            'Cancellation request declined',
          detail:
            `${cleanNote} The reservation remains confirmed.`,
          actor: 'manager',
          createdAt: decidedAt,
        }),
      ],
    }),
  )

  createNotification({
    memberId: reservation.memberId,
    type: 'booking',
    title:
      'Reservation remains confirmed',
    message:
      `${reservation.propertyTitle} remains active. Open My Stays to review management’s decision.`,
    link: '/stays',
    dedupeKey:
      `cancellation-declined:${reservation.id}:${decidedAt}`,
  })

  return reservation
}

export function cancelReservationByManager({
  reservationId,
  managerNote,
}: {
  reservationId: string
  managerNote: string
}) {
  const existingReservation =
    getReservationById(reservationId)

  if (!existingReservation) {
    throw new Error(
      'That reservation could not be found.',
    )
  }

  if (
    existingReservation.reservationStatus ===
    'cancelled'
  ) {
    throw new Error(
      'This reservation is already cancelled.',
    )
  }

  const cancelledAt =
    new Date().toISOString()

  const cleanNote =
    managerNote.trim() ||
    'Reservation cancelled by management.'

  const reservation = updateReservation(
    reservationId,
    (currentReservation) => ({
      ...currentReservation,
      reservationStatus: 'cancelled',
      paymentStatus: 'refund-review',
      refundStatus: 'review-required',
      cancelledAt,
      managerDecisionNote: cleanNote,
      statusHistory: [
        ...currentReservation.statusHistory,
        createReservationHistoryEvent({
          title:
            'Reservation cancelled by management',
          detail:
            `${cleanNote} The property dates were released.`,
          actor: 'manager',
          createdAt: cancelledAt,
        }),
      ],
    }),
  )

  createNotification({
    memberId: reservation.memberId,
    type: 'booking',
    title:
      'Reservation cancelled by management',
    message:
      `${reservation.propertyTitle} was cancelled. Refund eligibility is now under review.`,
    link: '/stays',
    dedupeKey:
      `manager-cancelled:${reservation.id}:${cancelledAt}`,
  })

  return reservation
}

function paymentStatusForRefund(
  refundStatus: ReservationRefundStatus,
): ReservationRecord['paymentStatus'] {
  switch (refundStatus) {
    case 'pending':
      return 'refund-pending'
    case 'partial':
      return 'partially-refunded'
    case 'full':
    case 'completed':
      return 'refunded'
    case 'not-refundable':
      return 'non-refundable'
    case 'review-required':
      return 'refund-review'
    case 'not-applicable':
    default:
      return 'pending-authorization'
  }
}

export function updateReservationRefundStatus({
  reservationId,
  refundStatus,
  managerNote,
}: {
  reservationId: string
  refundStatus: ReservationRefundStatus
  managerNote: string
}) {
  const existingReservation =
    getReservationById(reservationId)

  if (!existingReservation) {
    throw new Error(
      'That reservation could not be found.',
    )
  }

  if (
    existingReservation.reservationStatus !==
    'cancelled'
  ) {
    throw new Error(
      'Refund tracking is available after a reservation is cancelled.',
    )
  }

  const updatedAt =
    new Date().toISOString()

  const cleanNote =
    managerNote.trim() ||
    getRefundStatusLabel(refundStatus)

  const reservation = updateReservation(
    reservationId,
    (currentReservation) => ({
      ...currentReservation,
      refundStatus,
      paymentStatus:
        paymentStatusForRefund(
          refundStatus,
        ),
      managerDecisionNote: cleanNote,
      statusHistory: [
        ...currentReservation.statusHistory,
        createReservationHistoryEvent({
          title:
            getRefundStatusLabel(
              refundStatus,
            ),
          detail: cleanNote,
          actor: 'manager',
          createdAt: updatedAt,
        }),
      ],
    }),
  )

  createNotification({
    memberId: reservation.memberId,
    type: 'booking',
    title: 'Refund status updated',
    message:
      `${reservation.propertyTitle}: ${getRefundStatusLabel(
        refundStatus,
      )}.`,
    link: '/stays',
    dedupeKey:
      `refund-status:${reservation.id}:${refundStatus}:${updatedAt}`,
  })

  return reservation
}
