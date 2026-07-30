import {
  useEffect,
  useMemo,
  useState,
} from 'react'
import { Link } from 'react-router'
import PlatformPage from '../components/layout/PlatformPage'
import { useAuth } from '../context/AuthContext'
import {
  ensureMemberNotificationSeed,
  getNotificationsForMember,
  markAllNotificationsRead,
  markNotificationRead,
  NOTIFICATIONS_UPDATED_EVENT,
  type MemberNotification,
  type NotificationType,
} from '../lib/notifications'
import {
  getRewardBalance,
  REWARDS_UPDATED_EVENT,
} from '../lib/rewards'
import './NotificationsExperience.css'

type NotificationFilter =
  | 'all'
  | 'booking'
  | 'stay'
  | 'reward'
  | 'deal'
  | 'message'

const filters: Array<{
  id: NotificationFilter
  label: string
}> = [
  {
    id: 'all',
    label: 'All',
  },
  {
    id: 'booking',
    label: 'Bookings',
  },
  {
    id: 'stay',
    label: 'Stays',
  },
  {
    id: 'reward',
    label: 'Rewards',
  },
  {
    id: 'deal',
    label: 'Deals',
  },
  {
    id: 'message',
    label: 'Messages',
  },
]

const absoluteTimeFormatter =
  new Intl.DateTimeFormat(
    'en-US',
    {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    },
  )

function relativeTime(
  dateValue: string,
) {
  const elapsed =
    Date.now() -
    new Date(dateValue).getTime()

  const minutes = Math.max(
    Math.floor(elapsed / 60_000),
    0,
  )

  if (minutes < 1) {
    return 'Just now'
  }

  if (minutes < 60) {
    return `${minutes}m ago`
  }

  const hours = Math.floor(
    minutes / 60,
  )

  if (hours < 24) {
    return `${hours}h ago`
  }

  const days = Math.floor(
    hours / 24,
  )

  if (days < 7) {
    return `${days}d ago`
  }

  return absoluteTimeFormatter.format(
    new Date(dateValue),
  )
}

function notificationLabel(
  type: NotificationType,
) {
  switch (type) {
    case 'booking':
      return 'Booking'
    case 'stay':
      return 'Stay'
    case 'reward':
      return 'Rewards'
    case 'deal':
      return 'Deal'
    case 'property':
      return 'Property'
    case 'message':
      return 'Message'
    default:
      return 'Account'
  }
}

function notificationSymbol(
  type: NotificationType,
) {
  switch (type) {
    case 'booking':
      return '✓'
    case 'stay':
      return '⌂'
    case 'reward':
      return '✦'
    case 'deal':
      return '%'
    case 'property':
      return '+'
    case 'message':
      return '↗'
    default:
      return '•'
  }
}

function matchesFilter(
  notification: MemberNotification,
  filter: NotificationFilter,
) {
  if (filter === 'all') {
    return true
  }

  if (filter === 'deal') {
    return (
      notification.type === 'deal' ||
      notification.type === 'property'
    )
  }

  return notification.type === filter
}

function NotificationsPage() {
  const { user } = useAuth()

  const [
    notifications,
    setNotifications,
  ] = useState<MemberNotification[]>([])

  const [
    activeFilter,
    setActiveFilter,
  ] = useState<NotificationFilter>('all')

  useEffect(() => {
    if (!user) {
      return
    }

    const refreshNotifications = () => {
      setNotifications(
        getNotificationsForMember(
          user.id,
        ),
      )
    }

    const initializeNotifications = () => {
      ensureMemberNotificationSeed(
        user.id,
        getRewardBalance(user.id),
      )

      refreshNotifications()

      window.addEventListener(
        NOTIFICATIONS_UPDATED_EVENT,
        refreshNotifications,
      )

      window.addEventListener(
        REWARDS_UPDATED_EVENT,
        refreshNotifications,
      )

      window.addEventListener(
        'storage',
        refreshNotifications,
      )
    }

    const frame =
      window.requestAnimationFrame(
        initializeNotifications,
      )

    return () => {
      window.cancelAnimationFrame(frame)

      window.removeEventListener(
        NOTIFICATIONS_UPDATED_EVENT,
        refreshNotifications,
      )

      window.removeEventListener(
        REWARDS_UPDATED_EVENT,
        refreshNotifications,
      )

      window.removeEventListener(
        'storage',
        refreshNotifications,
      )
    }
  }, [user])

  const filteredNotifications =
    useMemo(
      () =>
        notifications.filter(
          (notification) =>
            matchesFilter(
              notification,
              activeFilter,
            ),
        ),
      [
        activeFilter,
        notifications,
      ],
    )

  if (!user) {
    return null
  }

  const unreadCount =
    notifications.filter(
      (notification) =>
        !notification.readBy.includes(
          user.id,
        ),
    ).length

  const handleMarkAllRead = () => {
    markAllNotificationsRead(
      user.id,
    )
  }

  const handleOpenNotification = (
    notificationId: string,
  ) => {
    markNotificationRead(
      notificationId,
      user.id,
    )
  }

  return (
    <PlatformPage
      memberNavigation
      compact
      eyebrow="Member activity"
      title="Notifications"
      description="Booking, stay, reward, property, deal, and manager updates in one clear timeline."
    >
      <section
        className="notifications-center"
        aria-label="Member notification center"
      >
        <header className="notifications-toolbar">
          <div>
            <span>Activity center</span>

            <h2>Latest updates</h2>

            <p>
              Open an update to go directly to the
              related stay, property, reward, or
              conversation.
            </p>
          </div>

          <div className="notifications-toolbar__actions">
            <span className="notifications-unread-count">
              <strong>{unreadCount}</strong>
              <small>Unread</small>
            </span>

            <button
              type="button"
              disabled={unreadCount === 0}
              onClick={handleMarkAllRead}
            >
              Mark all read
            </button>
          </div>
        </header>

        <nav
          className="notifications-filters"
          aria-label="Notification filters"
        >
          {filters.map((filter) => (
            <button
              type="button"
              className={
                activeFilter === filter.id
                  ? 'is-active'
                  : undefined
              }
              onClick={() =>
                setActiveFilter(filter.id)
              }
              key={filter.id}
            >
              {filter.label}
            </button>
          ))}
        </nav>

        <section className="notifications-feed">
          {filteredNotifications.length > 0 ? (
            <div className="notifications-list">
              {filteredNotifications.map(
                (notification) => {
                  const isUnread =
                    !notification.readBy.includes(
                      user.id,
                    )

                  return (
                    <Link
                      to={notification.link}
                      className={`notification-entry ${
                        isUnread
                          ? 'is-unread'
                          : 'is-read'
                      }`}
                      onClick={() =>
                        handleOpenNotification(
                          notification.id,
                        )
                      }
                      key={notification.id}
                    >
                      <span
                        className={`notification-entry__icon notification-entry__icon--${notification.type}`}
                        aria-hidden="true"
                      >
                        {notificationSymbol(
                          notification.type,
                        )}
                      </span>

                      <div className="notification-entry__content">
                        <div>
                          <span>
                            {notificationLabel(
                              notification.type,
                            )}
                          </span>

                          <time
                            dateTime={
                              notification.createdAt
                            }
                            title={absoluteTimeFormatter.format(
                              new Date(
                                notification.createdAt,
                              ),
                            )}
                          >
                            {relativeTime(
                              notification.createdAt,
                            )}
                          </time>
                        </div>

                        <h3>
                          {notification.title}
                        </h3>

                        <p>
                          {notification.message}
                        </p>
                      </div>

                      <span className="notification-entry__action">
                        {isUnread && (
                          <i aria-label="Unread" />
                        )}

                        <strong aria-hidden="true">
                          →
                        </strong>
                      </span>
                    </Link>
                  )
                },
              )}
            </div>
          ) : (
            <div className="notifications-empty">
              <span>All caught up</span>

              <h3>No updates here.</h3>

              <p>
                New activity will appear automatically.
              </p>
            </div>
          )}
        </section>
      </section>
    </PlatformPage>
  )
}

export default NotificationsPage
