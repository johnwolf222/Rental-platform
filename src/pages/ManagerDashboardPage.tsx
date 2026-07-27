import PlatformPage from '../components/layout/PlatformPage'
import PlatformPlaceholder from '../components/layout/PlatformPlaceholder'

function ManagerDashboardPage() {
  return (
    <PlatformPage
      eyebrow="Management controls"
      title="Manager Dashboard"
      description="Properties, locations, availability, bookings, members, deals, reviews, rewards, notifications, and legal agreements will be managed here."
    >
      <PlatformPlaceholder
        status="Manager architecture ready"
        title="The operational control center now has a dedicated route."
        description="Access protection and manager permissions will be added with authentication before real rental records or member information appear here."
      />
    </PlatformPage>
  )
}

export default ManagerDashboardPage
