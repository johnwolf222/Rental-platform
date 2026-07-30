import {
  useEffect,
  useState,
} from 'react'
import { useAuth } from '../../context/AuthContext'
import {
  ensureMemberNotificationSeed,
  getUnreadNotificationCount,
  NOTIFICATIONS_UPDATED_EVENT,
} from '../../lib/notifications'
import {
  getRewardBalance,
  REWARDS_UPDATED_EVENT,
} from '../../lib/rewards'

type NotificationBadgeProps = {
  as?: 'span' | 'i'
  className?: string
}

function NotificationBadge({
  as = 'span',
  className,
}: NotificationBadgeProps) {
  const { user } = useAuth()

  const [
    unreadCount,
    setUnreadCount,
  ] = useState(0)

  useEffect(() => {
    if (!user) {
      setUnreadCount(0)
      return
    }

    const refreshCount = () => {
      const rewardBalance =
        getRewardBalance(user.id)

      ensureMemberNotificationSeed(
        user.id,
        rewardBalance,
      )

      setUnreadCount(
        getUnreadNotificationCount(
          user.id,
        ),
      )
    }

    refreshCount()

    window.addEventListener(
      NOTIFICATIONS_UPDATED_EVENT,
      refreshCount,
    )

    window.addEventListener(
      REWARDS_UPDATED_EVENT,
      refreshCount,
    )

    window.addEventListener(
      'storage',
      refreshCount,
    )

    return () => {
      window.removeEventListener(
        NOTIFICATIONS_UPDATED_EVENT,
        refreshCount,
      )

      window.removeEventListener(
        REWARDS_UPDATED_EVENT,
        refreshCount,
      )

      window.removeEventListener(
        'storage',
        refreshCount,
      )
    }
  }, [user])

  if (!user || unreadCount <= 0) {
    return null
  }

  const visibleCount =
    unreadCount > 99
      ? '99+'
      : String(unreadCount)

  if (as === 'i') {
    return (
      <i
        className={className}
        aria-label={`${unreadCount} unread ${
          unreadCount === 1
            ? 'notification'
            : 'notifications'
        }`}
      >
        {visibleCount}
      </i>
    )
  }

  return (
    <span
      className={className}
      aria-label={`${unreadCount} unread ${
        unreadCount === 1
          ? 'notification'
          : 'notifications'
      }`}
    >
      {visibleCount}
    </span>
  )
}

export default NotificationBadge
