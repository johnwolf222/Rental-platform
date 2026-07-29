export type StayReminder = {
  id: string
  title: string
  message: string
  enabled: boolean
}

export type StayPortalSettings = {
  propertyId: number
  checkInTime: string
  checkOutTime: string
  timeZone: string
  propertyAddress: string
  directions: string
  entryInstructions: string
  emergencyContact: string
  complimentaryItems: string[]
  reminders: StayReminder[]
  updatedAt: string
}

export const STAY_PORTAL_UPDATED_EVENT =
  'rental-platform-stay-portal-updated'

const STAY_PORTAL_STORAGE_KEY =
  'rental-platform-stay-portal-settings-v1'

const PROPERTY_TIME_ZONES: Record<
  number,
  string
> = {
  1: 'America/New_York',
  2: 'America/New_York',
  3: 'America/New_York',
  4: 'America/Phoenix',
  5: 'America/Chicago',
  6: 'America/New_York',
}

const DEFAULT_REMINDERS: StayReminder[] = [
  {
    id: 'care-for-home',
    title: 'Care for your home away from home',
    message:
      'Please keep the home clean and return shared spaces in the condition in which you received them.',
    enabled: true,
  },
  {
    id: 'no-smoking',
    title: 'No smoking inside',
    message:
      'Smoking is not permitted inside the property. Additional restoration charges may apply when this rule is violated.',
    enabled: true,
  },
  {
    id: 'cancellation',
    title: 'Cancellation reminder',
    message:
      'Untimely cancellations may result in a non-refundable fee according to the confirmed cancellation schedule.',
    enabled: true,
  },
  {
    id: 'emergency',
    title: 'Report property emergencies immediately',
    message:
      'Contact property management immediately if you discover an urgent maintenance, safety, plumbing, electrical, or access issue.',
    enabled: true,
  },
  {
    id: 'complimentary',
    title: 'Enjoy the complimentary welcome items',
    message:
      'Complimentary snacks and drinks have been prepared for your arrival. Please enjoy them during your stay.',
    enabled: true,
  },
]

function buildDefaultSettings(
  propertyId: number,
): StayPortalSettings {
  return {
    propertyId,
    checkInTime: '4:00 PM',
    checkOutTime: '11:00 AM',
    timeZone:
      PROPERTY_TIME_ZONES[propertyId] ??
      'America/New_York',
    propertyAddress: '',
    directions: '',
    entryInstructions: '',
    emergencyContact: '',
    complimentaryItems: [
      'Complimentary snacks',
      'Complimentary bottled drinks',
    ],
    reminders: DEFAULT_REMINDERS.map(
      (reminder) => ({ ...reminder }),
    ),
    updatedAt: new Date().toISOString(),
  }
}

function readSettingsStore(): Record<
  string,
  StayPortalSettings
> {
  if (typeof window === 'undefined') {
    return {}
  }

  try {
    const storedValue =
      window.localStorage.getItem(
        STAY_PORTAL_STORAGE_KEY,
      )

    if (!storedValue) {
      return {}
    }

    const parsedValue = JSON.parse(storedValue)

    return parsedValue &&
      typeof parsedValue === 'object'
      ? (parsedValue as Record<
          string,
          StayPortalSettings
        >)
      : {}
  } catch {
    return {}
  }
}

function normalizeSettings(
  propertyId: number,
  storedSettings?: StayPortalSettings,
): StayPortalSettings {
  const defaults =
    buildDefaultSettings(propertyId)

  if (!storedSettings) {
    return defaults
  }

  const storedReminderMap = new Map(
    Array.isArray(storedSettings.reminders)
      ? storedSettings.reminders.map(
          (reminder) => [
            reminder.id,
            reminder,
          ],
        )
      : [],
  )

  return {
    ...defaults,
    ...storedSettings,
    propertyId,
    complimentaryItems: Array.isArray(
      storedSettings.complimentaryItems,
    )
      ? storedSettings.complimentaryItems
      : defaults.complimentaryItems,
    reminders: defaults.reminders.map(
      (defaultReminder) => ({
        ...defaultReminder,
        ...storedReminderMap.get(
          defaultReminder.id,
        ),
      }),
    ),
  }
}

export function getStayPortalSettings(
  propertyId: number,
): StayPortalSettings {
  const store = readSettingsStore()

  return normalizeSettings(
    propertyId,
    store[String(propertyId)],
  )
}

export function saveStayPortalSettings(
  settings: StayPortalSettings,
): StayPortalSettings {
  const store = readSettingsStore()

  const completeSettings = {
    ...settings,
    updatedAt: new Date().toISOString(),
  }

  window.localStorage.setItem(
    STAY_PORTAL_STORAGE_KEY,
    JSON.stringify({
      ...store,
      [String(settings.propertyId)]:
        completeSettings,
    }),
  )

  window.dispatchEvent(
    new CustomEvent(
      STAY_PORTAL_UPDATED_EVENT,
      {
        detail: {
          propertyId: settings.propertyId,
        },
      },
    ),
  )

  return completeSettings
}
