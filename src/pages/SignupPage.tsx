import PlatformPage from '../components/layout/PlatformPage'
import PlatformPlaceholder from '../components/layout/PlatformPlaceholder'

function SignupPage() {
  return (
    <PlatformPage
      eyebrow="Begin your membership"
      title="Create an Account"
      description="New members will register, verify their information, accept the current terms, and enter the private rental experience."
      backLabel="Already a member?"
      backTo="/login"
    >
      <PlatformPlaceholder
        status="Registration route ready"
        title="A clear and trustworthy signup experience."
        description="This page will later record the accepted legal-agreement version, notification preferences, contact information, and secure authentication credentials."
        primaryLabel="Member login"
        primaryTo="/login"
        secondaryLabel="Return home"
        secondaryTo="/"
      />
    </PlatformPage>
  )
}

export default SignupPage
