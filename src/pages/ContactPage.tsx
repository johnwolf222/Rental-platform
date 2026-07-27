import PlatformPage from '../components/layout/PlatformPage'
import PlatformPlaceholder from '../components/layout/PlatformPlaceholder'

function ContactPage() {
  return (
    <PlatformPage
      eyebrow="Member assistance"
      title="Contact Management"
      description="Members will be able to ask about bookings, individual properties, accessibility, payments, rewards, and account support."
    >
      <PlatformPlaceholder
        title="Professional member support in one organized place."
        description="The contact center will support general messages and property-specific inquiries while preserving the rental connected to each conversation."
      />
    </PlatformPage>
  )
}

export default ContactPage
