export type BookingIntent = {
  propertyId: number
  propertyTitle: string
  checkIn: string
  checkOut: string
  guests: number
  nights: number
  nightlyRate: number
  subtotal: number
  pointsPerNight: number
  expectedPoints: number
  createdAt: string
}

const BOOKING_INTENT_KEY = 'rental-platform-booking-intent-v1'

export function saveBookingIntent(
  intent: Omit<BookingIntent, 'createdAt'>,
): BookingIntent {
  const completeIntent: BookingIntent = {
    ...intent,
    createdAt: new Date().toISOString(),
  }

  window.sessionStorage.setItem(
    BOOKING_INTENT_KEY,
    JSON.stringify(completeIntent),
  )

  return completeIntent
}

export function getBookingIntent(): BookingIntent | null {
  try {
    const storedIntent = window.sessionStorage.getItem(
      BOOKING_INTENT_KEY,
    )

    if (!storedIntent) {
      return null
    }

    return JSON.parse(storedIntent) as BookingIntent
  } catch {
    return null
  }
}

export function clearBookingIntent() {
  window.sessionStorage.removeItem(BOOKING_INTENT_KEY)
}
