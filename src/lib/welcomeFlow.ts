const WELCOME_PENDING_KEY =
  'rental-platform-welcome-pending-v1'

const WELCOME_DESTINATION_KEY =
  'rental-platform-welcome-destination-v1'

export function beginWelcomeFlow(
  destination: string,
) {
  const safeDestination =
    destination.startsWith('/')
      ? destination
      : '/profile'

  window.sessionStorage.setItem(
    WELCOME_PENDING_KEY,
    'true',
  )

  window.sessionStorage.setItem(
    WELCOME_DESTINATION_KEY,
    safeDestination,
  )
}

export function hasPendingWelcome() {
  return (
    window.sessionStorage.getItem(
      WELCOME_PENDING_KEY,
    ) === 'true'
  )
}

export function getWelcomeDestination() {
  const storedDestination =
    window.sessionStorage.getItem(
      WELCOME_DESTINATION_KEY,
    )

  if (
    !storedDestination ||
    !storedDestination.startsWith('/')
  ) {
    return '/profile'
  }

  return storedDestination
}

export function completeWelcomeFlow() {
  window.sessionStorage.removeItem(
    WELCOME_PENDING_KEY,
  )

  window.sessionStorage.removeItem(
    WELCOME_DESTINATION_KEY,
  )
}
