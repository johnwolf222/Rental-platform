import PlatformPage from '../components/layout/PlatformPage'
import PlatformPlaceholder from '../components/layout/PlatformPlaceholder'

function NotificationsPage() {
  return (
    <PlatformPage
      memberNavigation
      eyebrow="Member updates"
      title="Notifications"
      description="Booking updates, newly posted deals, reward milestones, review requests, and manager messages will be organized here."
    >
      <PlatformPlaceholder
        title="A focused notification center is coming next."
        description="This route is now ready for unread counts, notification categories, email preferences, deal alerts, booking changes, and mark-as-read controls."
      />
    </PlatformPage>
  )
}

export default NotificationsPage
