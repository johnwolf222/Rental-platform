import PlatformPage from '../components/layout/PlatformPage'
import PlatformPlaceholder from '../components/layout/PlatformPlaceholder'

function NotFoundPage() {
  return (
    <PlatformPage
      eyebrow="Page unavailable"
      title="That Door Does Not Open"
      description="The requested platform page could not be found or may have been moved."
    >
      <PlatformPlaceholder
        status="404"
        title="Let us guide you back to the available rentals."
        description="Return to the rental search to continue browsing active manager-approved properties."
      />
    </PlatformPage>
  )
}

export default NotFoundPage
