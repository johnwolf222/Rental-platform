export type NotificationType =
  | 'booking'
  | 'stay'
  | 'deal'
  | 'property'
  | 'reward'
  | 'message'
  | 'system'

export type MemberNotification = {
  id: string
  memberId: string | 'all'
  type: NotificationType
  title: string
  message: string
  link: string
  createdAt: string
  readBy: string[]
  dedupeKey?: string
}

export type CreateNotificationInput = {
  memberId: string | 'all'
  type: NotificationType
  title: string
  message: string
  link: string
  dedupeKey?: string
}

export const NOTIFICATIONS_UPDATED_EVENT =
  'rental-platform-notifications-updated'

const NOTIFICATION_STORAGE_KEY =
  'rental-platform-notifications-v1'

function readNotifications():
  MemberNotification[] {
  if (typeof window === 'undefined') {
    return []
  }

  try {
    const storedValue =
      window.localStorage.getItem(
        NOTIFICATION_STORAGE_KEY,
      )

    if (!storedValue) {
      return []
    }

    const parsedValue = JSON.parse(storedValue)

    return Array.isArray(parsedValue)
      ? (parsedValue as MemberNotification[])
      : []
  } catch {
    return []
  }
}

function writeNotifications(
  notifications: MemberNotification[],
) {
  window.localStorage.setItem(
    NOTIFICATION_STORAGE_KEY,
    JSON.stringify(notifications),
  )

  window.dispatchEvent(
    new CustomEvent(
      NOTIFICATIONS_UPDATED_EVENT,
    ),
  )
}

function createNotificationId() {
  return `notification-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 10)}`
}

export function createNotification(
  input: CreateNotificationInput,
): MemberNotification {
  const notifications =
    readNotifications()

  if (input.dedupeKey) {
    const existingNotification =
      notifications.find(
        (notification) =>
          notification.dedupeKey ===
            input.dedupeKey &&
          notification.memberId ===
            input.memberId,
      )

    if (existingNotification) {
      return existingNotification
    }
  }

  const notification:
    MemberNotification = {
      id: createNotificationId(),
      memberId: input.memberId,
      type: input.type,
      title: input.title.trim(),
      message: input.message.trim(),
      link: input.link,
      createdAt: new Date().toISOString(),
      readBy: [],
      dedupeKey: input.dedupeKey,
    }

  writeNotifications([
    notification,
    ...notifications,
  ])

  return notification
}

export function ensureMemberNotificationSeed(
  memberId: string,
  rewardBalance: number,
) {
  createNotification({
    memberId,
    type: 'system',
    title: 'Membership active',
    message:
      'Your private rental workspace, saved properties, reservations, and member tools are ready.',
    link: '/profile',
    dedupeKey:
      `membership-active:${memberId}`,
  })

  createNotification({
    memberId,
    type: 'reward',
    title: 'Reward balance available',
    message:
      `${rewardBalance.toLocaleString(
        'en-US',
      )} points are available in your member reward account.`,
    link: '/profile',
    dedupeKey:
      `initial-reward-balance:${memberId}`,
  })
}

export function getNotificationsForMember(
  memberId: string,
) {
  return readNotifications()
    .filter(
      (notification) =>
        notification.memberId === memberId ||
        notification.memberId === 'all',
    )
    .sort(
      (first, second) =>
        new Date(second.createdAt).getTime() -
        new Date(first.createdAt).getTime(),
    )
}

export function getUnreadNotificationCount(
  memberId: string,
) {
  return getNotificationsForMember(
    memberId,
  ).filter(
    (notification) =>
      !notification.readBy.includes(memberId),
  ).length
}

export function markNotificationRead(
  notificationId: string,
  memberId: string,
) {
  const notifications =
    readNotifications()

  const nextNotifications =
    notifications.map(
      (notification) => {
        if (
          notification.id !== notificationId ||
          notification.readBy.includes(memberId)
        ) {
          return notification
        }

        return {
          ...notification,
          readBy: [
            ...notification.readBy,
            memberId,
          ],
        }
      },
    )

  writeNotifications(
    nextNotifications,
  )
}

export function markAllNotificationsRead(
  memberId: string,
) {
  const notifications =
    readNotifications()

  const nextNotifications =
    notifications.map(
      (notification) => {
        const belongsToMember =
          notification.memberId === memberId ||
          notification.memberId === 'all'

        if (
          !belongsToMember ||
          notification.readBy.includes(memberId)
        ) {
          return notification
        }

        return {
          ...notification,
          readBy: [
            ...notification.readBy,
            memberId,
          ],
        }
      },
    )

  writeNotifications(
    nextNotifications,
  )
}
