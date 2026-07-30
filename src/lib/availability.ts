export type AvailabilityReservation = {
  id: string
  propertyId: number
  propertyTitle: string
  checkIn: string
  checkOut: string
  reservationStatus: 'confirmed'
}

export type ManagerDateBlock = {
  id: string
  propertyId: number
  startDate: string
  endDate: string
  reason: string
  createdAt: string
}

export type UnavailableDateRange = {
  id: string
  propertyId: number
  startDate: string
  endDate: string
  source: 'reservation' | 'manager-block'
  label: string
}

export type AvailabilityResult = {
  available: boolean
  message: string
  conflicts: UnavailableDateRange[]
}

const MANAGER_BLOCKS_STORAGE_KEY =
  'rental-platform-manager-date-blocks-v1'

export const AVAILABILITY_UPDATED_EVENT =
  'rental-platform-availability-updated'

const dateFormatter = new Intl.DateTimeFormat(
  'en-US',
  {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  },
)

function isDateValue(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value)
}

function readManagerDateBlocks(): ManagerDateBlock[] {
  if (typeof window === 'undefined') {
    return []
  }

  try {
    const storedValue = window.localStorage.getItem(
      MANAGER_BLOCKS_STORAGE_KEY,
    )

    if (!storedValue) {
      return []
    }

    const parsedValue = JSON.parse(storedValue)

    return Array.isArray(parsedValue)
      ? (parsedValue as ManagerDateBlock[]).filter(
          (block) =>
            Number.isFinite(block.propertyId) &&
            isDateValue(block.startDate) &&
            isDateValue(block.endDate) &&
            block.startDate < block.endDate,
        )
      : []
  } catch {
    return []
  }
}

function writeManagerDateBlocks(
  blocks: ManagerDateBlock[],
) {
  window.localStorage.setItem(
    MANAGER_BLOCKS_STORAGE_KEY,
    JSON.stringify(blocks),
  )

  window.dispatchEvent(
    new CustomEvent(AVAILABILITY_UPDATED_EVENT),
  )
}

function createBlockId() {
  return `BLOCK-${Date.now()
    .toString(36)
    .toUpperCase()}-${Math.random()
    .toString(36)
    .slice(2, 7)
    .toUpperCase()}`
}

export function getTodayDateValue(
  date = new Date(),
) {
  const localDate = new Date(
    date.getTime() -
      date.getTimezoneOffset() * 60_000,
  )

  return localDate.toISOString().split('T')[0]
}

export function dateRangesOverlap(
  firstStart: string,
  firstEnd: string,
  secondStart: string,
  secondEnd: string,
) {
  return (
    firstStart < secondEnd &&
    firstEnd > secondStart
  )
}

export function formatAvailabilityDate(
  dateValue: string,
) {
  return dateFormatter.format(
    new Date(`${dateValue}T12:00:00`),
  )
}

export function formatUnavailableRange(
  range: Pick<
    UnavailableDateRange,
    'startDate' | 'endDate'
  >,
) {
  return `${formatAvailabilityDate(
    range.startDate,
  )} – ${formatAvailabilityDate(
    range.endDate,
  )}`
}

export function getManagerDateBlocks(
  propertyId?: number,
) {
  return readManagerDateBlocks()
    .filter(
      (block) =>
        propertyId === undefined ||
        block.propertyId === propertyId,
    )
    .sort((first, second) =>
      first.startDate.localeCompare(
        second.startDate,
      ),
    )
}

export function getPropertyUnavailableRanges(
  propertyId: number,
  reservations: AvailabilityReservation[],
): UnavailableDateRange[] {
  const reservationRanges = reservations
    .filter(
      (reservation) =>
        reservation.propertyId === propertyId &&
        reservation.reservationStatus === 'confirmed',
    )
    .map(
      (reservation): UnavailableDateRange => ({
        id: reservation.id,
        propertyId,
        startDate: reservation.checkIn,
        endDate: reservation.checkOut,
        source: 'reservation',
        label: 'Reserved stay',
      }),
    )

  const managerRanges = getManagerDateBlocks(
    propertyId,
  ).map(
    (block): UnavailableDateRange => ({
      id: block.id,
      propertyId,
      startDate: block.startDate,
      endDate: block.endDate,
      source: 'manager-block',
      label:
        block.reason ||
        'Unavailable by management',
    }),
  )

  return [...reservationRanges, ...managerRanges].sort(
    (first, second) =>
      first.startDate.localeCompare(
        second.startDate,
      ),
  )
}

export function checkPropertyAvailability({
  propertyId,
  checkIn,
  checkOut,
  reservations,
}: {
  propertyId: number
  checkIn: string
  checkOut: string
  reservations: AvailabilityReservation[]
}): AvailabilityResult {
  if (!checkIn || !checkOut) {
    return {
      available: false,
      message:
        'Select both check-in and check-out dates.',
      conflicts: [],
    }
  }

  if (
    !isDateValue(checkIn) ||
    !isDateValue(checkOut) ||
    checkIn >= checkOut
  ) {
    return {
      available: false,
      message:
        'Check-out must be after check-in.',
      conflicts: [],
    }
  }

  if (checkIn < getTodayDateValue()) {
    return {
      available: false,
      message: 'Check-in cannot be in the past.',
      conflicts: [],
    }
  }

  const conflicts = getPropertyUnavailableRanges(
    propertyId,
    reservations,
  ).filter((range) =>
    dateRangesOverlap(
      checkIn,
      checkOut,
      range.startDate,
      range.endDate,
    ),
  )

  if (conflicts.length > 0) {
    return {
      available: false,
      message:
        'Part of this stay is no longer available. Select different dates.',
      conflicts,
    }
  }

  return {
    available: true,
    message: 'These dates are currently available.',
    conflicts: [],
  }
}

export function addManagerDateBlock(
  input: {
    propertyId: number
    startDate: string
    endDate: string
    reason: string
  },
  reservations: AvailabilityReservation[],
) {
  const {
    propertyId,
    startDate,
    endDate,
    reason,
  } = input

  if (
    !isDateValue(startDate) ||
    !isDateValue(endDate) ||
    startDate >= endDate
  ) {
    throw new Error(
      'The blocked end date must be after the start date.',
    )
  }

  const conflict = getPropertyUnavailableRanges(
    propertyId,
    reservations,
  ).find((range) =>
    dateRangesOverlap(
      startDate,
      endDate,
      range.startDate,
      range.endDate,
    ),
  )

  if (conflict) {
    throw new Error(
      `That range overlaps ${formatUnavailableRange(
        conflict,
      )}.`,
    )
  }

  const block: ManagerDateBlock = {
    id: createBlockId(),
    propertyId,
    startDate,
    endDate,
    reason:
      reason.trim() ||
      'Unavailable by management',
    createdAt: new Date().toISOString(),
  }

  writeManagerDateBlocks([
    block,
    ...readManagerDateBlocks(),
  ])

  return block
}

export function removeManagerDateBlock(
  blockId: string,
) {
  const currentBlocks = readManagerDateBlocks()
  const nextBlocks = currentBlocks.filter(
    (block) => block.id !== blockId,
  )

  if (nextBlocks.length === currentBlocks.length) {
    return false
  }

  writeManagerDateBlocks(nextBlocks)
  return true
}
