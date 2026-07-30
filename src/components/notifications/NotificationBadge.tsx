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

  const [unreadCount, setUnreadCount] =
    useState(
      () =>
        user
          ? getUnreadNotificationCount(
              user.id,
            )
          : 0,
    )

  useEffect(() => {
    if (!user) {
      return
    }

    const refreshCount = () => {
      setUnreadCount(
        getUnreadNotificationCount(
          user.id,
        ),
      )
    }

    const initializeBadge = () => {
      ensureMemberNotificationSeed(
        user.id,
        getRewardBalance(user.id),
      )

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
    }

    const frame =
      window.requestAnimationFrame(
        initializeBadge,
      )

    return () => {
      window.cancelAnimationFrame(frame)

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

  const Tag = as

  return (
    <Tag
      className={className}
      aria-label={`${unreadCount} unread ${
        unreadCount === 1
          ? 'notification'
          : 'notifications'
      }`}
    >
      {unreadCount > 99
        ? '99+'
        : unreadCount}
    </Tag>
  )
}

export default NotificationBadge
