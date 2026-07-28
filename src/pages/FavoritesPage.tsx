import PlatformPage from '../components/layout/PlatformPage'
import PlatformPlaceholder from '../components/layout/PlatformPlaceholder'

function FavoritesPage() {
  return (
    <PlatformPage
      memberNavigation
      eyebrow="Saved by you"
      title="Favorite Properties"
      description="Every property a member likes will be available here for quick comparison, availability checks, reward values, and future booking."
    >
      <PlatformPlaceholder
        title="Your private collection of saved stays."
        description="The current homepage favorite controls will later connect to authenticated member records and automatically populate this page."
      />
    </PlatformPage>
  )
}

export default FavoritesPage
