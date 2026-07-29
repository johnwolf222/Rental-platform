export type ReservationPaymentPlan =
  | 'pay-in-full'
  | 'split-stay'

export type ReservationPaymentMethod =
  | 'card'
  | 'paypal'
  | 'apple-pay'

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
  reservationStatus: 'confirmed'
  paymentStatus: 'pending-authorization'
  createdAt: string
}

const RESERVATIONS_STORAGE_KEY =
  'rental-platform-reservations-v1'

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
      ? (parsedValue as ReservationRecord[])
      : []
  } catch {
    return []
  }
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

export function createReservation(
  input: Omit<
    ReservationRecord,
    | 'id'
    | 'reservationStatus'
    | 'paymentStatus'
    | 'createdAt'
  >,
): ReservationRecord {
  const reservation: ReservationRecord = {
    ...input,
    id: createReservationId(),
    reservationStatus: 'confirmed',
    paymentStatus: 'pending-authorization',
    createdAt: new Date().toISOString(),
  }

  const currentReservations = readReservations()

  window.localStorage.setItem(
    RESERVATIONS_STORAGE_KEY,
    JSON.stringify([
      reservation,
      ...currentReservations,
    ]),
  )

  return reservation
}

export function getReservations() {
  return readReservations()
}
