import {
  getRefundStatusLabel,
  getReservationStatusPresentation,
} from '../../lib/reservationManagement'
import type {
  ReservationRecord,
  ReservationRefundStatus,
} from '../../lib/reservations'

type ReservationStatusBadgeProps = {
  reservation: Pick<
    ReservationRecord,
    'reservationStatus' | 'refundStatus'
  >
  showRefund?: boolean
}

export default function ReservationStatusBadge({
  reservation,
  showRefund = false,
}: ReservationStatusBadgeProps) {
  const presentation =
    getReservationStatusPresentation(
      reservation,
    )

  const refundStatus =
    reservation.refundStatus ??
    ('not-applicable' as ReservationRefundStatus)

  return (
    <span
      className={`reservation-status-badge reservation-status-badge--${presentation.tone}`}
      title={presentation.description}
    >
      <i aria-hidden="true" />

      <span>
        {presentation.label}

        {showRefund &&
          refundStatus !==
            'not-applicable' && (
            <small>
              {getRefundStatusLabel(
                refundStatus,
              )}
            </small>
          )}
      </span>
    </span>
  )
}
