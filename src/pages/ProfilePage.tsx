import PlatformPage from '../components/layout/PlatformPage'
import PlatformPlaceholder from '../components/layout/PlatformPlaceholder'

function ProfilePage() {
  return (
    <PlatformPage
      eyebrow="Private member account"
      title="Profile & Rewards"
      description="Profile editing, reward progress, previous stays, saved properties, recent views, payment methods, notification preferences, and security settings will live here."
    >
      <PlatformPlaceholder
        title="The complete member account center."
        description="The next profile phase will introduce the approved 1,400-point and 2,800-point rewards, the permanent rewards ledger, completed stays, and member settings."
      />
    </PlatformPage>
  )
}

export default ProfilePage
