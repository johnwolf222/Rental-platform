import PlatformPage from '../components/layout/PlatformPage'
import PlatformPlaceholder from '../components/layout/PlatformPlaceholder'

function LoginPage() {
  return (
    <PlatformPage
      eyebrow="Members only"
      title="Member Login"
      description="Returning members will securely enter the private rental platform, restore their favorites, view notifications, and manage bookings."
      backLabel="Create an account"
      backTo="/signup"
    >
      <PlatformPlaceholder
        status="Authentication route ready"
        title="Secure account access will be connected here."
        description="The visual login experience will be completed before Supabase authentication is connected, allowing us to preserve the approved cinematic entrance style."
        primaryLabel="Create account"
        primaryTo="/signup"
        secondaryLabel="Return home"
        secondaryTo="/"
      />
    </PlatformPage>
  )
}

export default LoginPage
