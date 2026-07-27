import { useParams } from 'react-router'
import PlatformPage from '../components/layout/PlatformPage'
import PlatformPlaceholder from '../components/layout/PlatformPlaceholder'

function PropertyPage() {
  const { propertyId } = useParams()

  return (
    <PlatformPage
      eyebrow="Property details"
      title="Property Experience"
      description="The complete image gallery, availability calendar, amenities, rental terms, verified reviews, reward value, and booking controls will live on this route."
    >
      <PlatformPlaceholder
        status={`Property route: ${propertyId ?? 'unavailable'}`}
        title="A dedicated page for every rental."
        description="The demonstration property cards will soon navigate here using stable property identifiers instead of opening temporary content on the homepage."
      />
    </PlatformPage>
  )
}

export default PropertyPage
