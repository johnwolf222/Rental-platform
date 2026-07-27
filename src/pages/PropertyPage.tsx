import {
  useEffect,
  useMemo,
  useState,
  type SVGProps,
} from 'react'
import {
  Link,
  useNavigate,
  useParams,
} from 'react-router'
import {
  getPropertyById,
  properties,
} from '../data/properties'
import './PropertyPage.css'

type DetailIconName =
  | 'arrow'
  | 'bath'
  | 'bed'
  | 'calendar'
  | 'check'
  | 'heart'
  | 'home'
  | 'map'
  | 'star'
  | 'users'

type DetailIconProps = {
  name: DetailIconName
  size?: number
  filled?: boolean
}

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

const amenityGroups: Record<string, string[]> = {
  'Beach House': [
    'Coastal access',
    'Outdoor gathering space',
    'Private parking',
  ],
  Cabin: [
    'Forest surroundings',
    'Outdoor fire lounge',
    'Scenic gathering space',
  ],
  Estate: [
    'Private grounds',
    'Resort-style outdoor area',
    'Large group spaces',
  ],
  Apartment: [
    'Central location',
    'Elevator or easy access',
    'Dedicated workspace',
  ],
  Loft: [
    'Floor-to-ceiling windows',
    'Walkable entertainment',
    'Modern open layout',
  ],
  Waterfront: [
    'Direct water access',
    'Outdoor relaxation area',
    'Coastal gathering space',
  ],
}

const sharedAmenities = [
  'Manager-approved property',
  'High-speed Wi-Fi',
  'Full kitchen',
  'Climate control',
  'Fresh linens and towels',
]

function DetailIcon({
  name,
  size = 20,
  filled = false,
}: DetailIconProps) {
  const shared: SVGProps<SVGSVGElement> = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: filled ? 'currentColor' : 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
  }

  switch (name) {
    case 'arrow':
      return (
        <svg {...shared}>
          <path d="M5 12h14M14 7l5 5-5 5" />
        </svg>
      )

    case 'bath':
      return (
        <svg {...shared}>
          <path d="M4 13h16v3a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-3Z" />
          <path d="M7 13V6a3 3 0 0 1 6 0" />
          <path d="M6 20v2M18 20v2" />
        </svg>
      )

    case 'bed':
      return (
        <svg {...shared}>
          <path d="M3 20v-8h18v8M3 16h18" />
          <path d="M5 12V7h6a3 3 0 0 1 3 3v2" />
          <path d="M14 12V9h3a4 4 0 0 1 4 4" />
        </svg>
      )

    case 'calendar':
      return (
        <svg {...shared}>
          <rect x="3" y="5" width="18" height="16" rx="2" />
          <path d="M16 3v4M8 3v4M3 10h18" />
        </svg>
      )

    case 'check':
      return (
        <svg {...shared}>
          <path d="m5 12 4 4L19 6" />
        </svg>
      )

    case 'heart':
      return (
        <svg {...shared}>
          <path d="M20.8 4.7a5.5 5.5 0 0 0-7.8 0L12 5.8l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21.4l7.8-7.8 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z" />
        </svg>
      )

    case 'home':
      return (
        <svg {...shared}>
          <path d="m3 11 9-8 9 8" />
          <path d="M5 10v11h14V10M9 21v-7h6v7" />
        </svg>
      )

    case 'map':
      return (
        <svg {...shared}>
          <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
          <circle cx="12" cy="10" r="2.5" />
        </svg>
      )

    case 'star':
      return (
        <svg {...shared} fill="currentColor" strokeWidth={1.2}>
          <path d="m12 2.5 2.9 5.9 6.5.9-4.7 4.6 1.1 6.5-5.8-3-5.8 3 1.1-6.5-4.7-4.6 6.5-.9Z" />
        </svg>
      )

    case 'users':
      return (
        <svg {...shared}>
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8" />
        </svg>
      )

    default:
      return null
  }
}

function calculateNights(
  checkIn: string,
  checkOut: string,
): number {
  if (!checkIn || !checkOut) {
    return 0
  }

  const start = new Date(`${checkIn}T12:00:00`)
  const end = new Date(`${checkOut}T12:00:00`)
  const difference = end.getTime() - start.getTime()

  if (!Number.isFinite(difference) || difference <= 0) {
    return 0
  }

  return Math.ceil(difference / 86_400_000)
}

function PropertyPage() {
  const { propertyId } = useParams()
  const navigate = useNavigate()
  const property = getPropertyById(propertyId)

  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [saved, setSaved] = useState(false)
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [guestCount, setGuestCount] = useState(1)

  useEffect(() => {
    setSelectedImageIndex(0)
    setSaved(false)
    setCheckIn('')
    setCheckOut('')
    setGuestCount(1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [propertyId])

  const gallery = useMemo(() => {
    if (!property) {
      return []
    }

    return [property.image, ...property.thumbnails]
  }, [property])

  const relatedProperties = useMemo(() => {
    if (!property) {
      return []
    }

    return properties
      .filter((candidate) => candidate.id !== property.id)
      .sort((first, second) => {
        const firstMatchesState = first.state === property.state ? 1 : 0
        const secondMatchesState = second.state === property.state ? 1 : 0

        return secondMatchesState - firstMatchesState
      })
      .slice(0, 3)
  }, [property])

  const nights = calculateNights(checkIn, checkOut)
  const subtotal = property ? property.price * nights : 0
  const expectedPoints = property
    ? property.pointsPerNight * nights
    : 0

  if (!property) {
    return (
      <main className="property-page property-page--empty">
        <section className="property-empty">
          <span>Property unavailable</span>
          <h1>That stay could not be found.</h1>
          <p>
            The property may have been removed, temporarily hidden, or the
            address may be incorrect.
          </p>
          <Link to="/">
            Return to rental search
            <DetailIcon name="arrow" size={17} />
          </Link>
        </section>
      </main>
    )
  }

  const amenities = [
    ...sharedAmenities,
    ...(amenityGroups[property.type] ?? []),
  ]

  const selectedImage =
    gallery[selectedImageIndex] ?? property.image

  return (
    <div className="property-page">
      <header className="property-nav">
        <div className="property-nav__inner">
          <Link
            to="/"
            className="property-brand"
            aria-label="Return to Rental Platform"
          >
            <span className="property-brand__mark">
              <DetailIcon name="home" />
            </span>

            <span className="property-brand__copy">
              RENTAL
              <strong>PLATFORM</strong>
            </span>
          </Link>

          <nav
            className="property-nav__links"
            aria-label="Property navigation"
          >
            <Link to="/">Rental Search</Link>
            <Link to="/favorites">Favorites</Link>
            <Link to="/contact">Contact</Link>
            <Link to="/profile">Profile</Link>
          </nav>
        </div>
      </header>

      <main className="property-main">
        <section className="property-topline">
          <Link to="/" className="property-back-link">
            <span aria-hidden="true">←</span>
            Back to all properties
          </Link>

          <button
            type="button"
            className={`property-save ${saved ? 'is-saved' : ''}`}
            onClick={() => setSaved((current) => !current)}
            aria-pressed={saved}
          >
            <DetailIcon
              name="heart"
              size={18}
              filled={saved}
            />
            {saved ? 'Saved to favorites' : 'Save property'}
          </button>
        </section>

        <section className="property-heading">
          <div>
            <span className="property-heading__label">
              {property.label}
            </span>

            <h1>{property.title}</h1>

            <div className="property-heading__meta">
              <span>
                <DetailIcon name="map" size={17} />
                {property.city}, {property.state}
              </span>

              <span>
                <DetailIcon name="star" size={16} />
                <strong>{property.rating}</strong>
                {property.reviewCount} verified guest reviews
              </span>
            </div>
          </div>

          <div className="property-heading__reward">
            <small>Reward value</small>
            <strong>+{property.pointsPerNight}</strong>
            <span>points per completed night</span>
          </div>
        </section>

        <section
          className="property-gallery"
          aria-label={`${property.title} image gallery`}
        >
          <figure className="property-gallery__featured">
            <img
              src={selectedImage}
              alt={`${property.title} view ${selectedImageIndex + 1}`}
            />

            <figcaption>
              <span>{property.type}</span>
              <strong>
                {selectedImageIndex + 1} of {gallery.length}
              </strong>
            </figcaption>
          </figure>

          <div className="property-gallery__rail">
            {gallery.map((image, index) => (
              <button
                type="button"
                key={image}
                className={
                  selectedImageIndex === index ? 'is-active' : ''
                }
                onClick={() => setSelectedImageIndex(index)}
                aria-label={`View property image ${index + 1}`}
                aria-pressed={selectedImageIndex === index}
              >
                <img
                  src={image}
                  alt=""
                  aria-hidden="true"
                />
              </button>
            ))}
          </div>
        </section>

        <section className="property-layout">
          <article className="property-content">
            <section className="property-overview">
              <span>
                <DetailIcon name="bed" />
                <strong>{property.beds}</strong>
                beds
              </span>

              <span>
                <DetailIcon name="bath" />
                <strong>{property.baths}</strong>
                baths
              </span>

              <span>
                <DetailIcon name="users" />
                <strong>{property.guests}</strong>
                guests
              </span>

              <span>
                <DetailIcon name="home" />
                <strong>{property.type}</strong>
                property type
              </span>
            </section>

            <section className="property-section property-about">
              <span className="property-eyebrow">
                The property
              </span>

              <h2>A private stay designed to feel memorable.</h2>

              <p>{property.description}</p>

              <p>
                This manager-approved property is presented with its nightly
                price, guest capacity, reward value, and verified-stay rating
                in one consistent record. Final availability and
                property-specific terms will be confirmed before booking.
              </p>
            </section>

            <section className="property-section">
              <div className="property-section__heading">
                <div>
                  <span className="property-eyebrow">
                    Included with the stay
                  </span>
                  <h2>Property amenities</h2>
                </div>

                <span>{amenities.length} listed features</span>
              </div>

              <div className="property-amenities">
                {amenities.map((amenity) => (
                  <span key={amenity}>
                    <i>
                      <DetailIcon name="check" size={15} />
                    </i>
                    {amenity}
                  </span>
                ))}
              </div>
            </section>

            <section className="property-section property-reviews">
              <div className="property-review-score">
                <span>
                  <DetailIcon name="star" size={19} />
                  Verified stays
                </span>

                <strong>{property.rating}</strong>

                <p>
                  Based on {property.reviewCount} completed member stays.
                </p>
              </div>

              <div className="property-review-bars">
                <span>
                  <b>
                    Cleanliness
                    <strong>Excellent</strong>
                  </b>
                  <i><em style={{ width: '96%' }} /></i>
                </span>

                <span>
                  <b>
                    Listing accuracy
                    <strong>Excellent</strong>
                  </b>
                  <i><em style={{ width: '94%' }} /></i>
                </span>

                <span>
                  <b>
                    Management
                    <strong>Excellent</strong>
                  </b>
                  <i><em style={{ width: '98%' }} /></i>
                </span>
              </div>
            </section>

            <section className="property-section">
              <span className="property-eyebrow">
                Booking safeguards
              </span>

              <h2>Clear expectations before confirmation.</h2>

              <div className="property-safeguards">
                <span>
                  <strong>Manager approval</strong>
                  Availability is confirmed before the reservation is final.
                </span>

                <span>
                  <strong>Verified members</strong>
                  Account and guest information are reviewed securely.
                </span>

                <span>
                  <strong>Recorded terms</strong>
                  The accepted agreement version is preserved with the stay.
                </span>

                <span>
                  <strong>Reward snapshot</strong>
                  The points-per-night rate is saved when booking is confirmed.
                </span>
              </div>
            </section>
          </article>

          <aside className="property-booking">
            <div className="property-booking__price">
              <div>
                <strong>{currencyFormatter.format(property.price)}</strong>
                <span>per night</span>
              </div>

              <span>
                <DetailIcon name="star" size={15} />
                {property.rating}
              </span>
            </div>

            <div className="property-booking__fields">
              <label>
                <span>Check-in</span>
                <div>
                  <DetailIcon name="calendar" size={17} />
                  <input
                    type="date"
                    value={checkIn}
                    onChange={(event) => {
                      setCheckIn(event.target.value)

                      if (
                        checkOut &&
                        event.target.value >= checkOut
                      ) {
                        setCheckOut('')
                      }
                    }}
                  />
                </div>
              </label>

              <label>
                <span>Check-out</span>
                <div>
                  <DetailIcon name="calendar" size={17} />
                  <input
                    type="date"
                    min={checkIn || undefined}
                    value={checkOut}
                    onChange={(event) =>
                      setCheckOut(event.target.value)
                    }
                  />
                </div>
              </label>

              <label className="property-booking__guests">
                <span>Guests</span>
                <div>
                  <DetailIcon name="users" size={17} />
                  <select
                    value={guestCount}
                    onChange={(event) =>
                      setGuestCount(Number(event.target.value))
                    }
                  >
                    {Array.from(
                      { length: property.guests },
                      (_, index) => index + 1,
                    ).map((guestOption) => (
                      <option
                        value={guestOption}
                        key={guestOption}
                      >
                        {guestOption}{' '}
                        {guestOption === 1 ? 'guest' : 'guests'}
                      </option>
                    ))}
                  </select>
                </div>
              </label>
            </div>

            <div className="property-booking__summary">
              <span>
                <span>
                  {nights > 0
                    ? `${currencyFormatter.format(property.price)} × ${nights} ${
                        nights === 1 ? 'night' : 'nights'
                      }`
                    : 'Nightly subtotal'}
                </span>
                <strong>
                  {nights > 0
                    ? currencyFormatter.format(subtotal)
                    : 'Select dates'}
                </strong>
              </span>

              <span>
                <span>Expected rewards</span>
                <strong>
                  {nights > 0
                    ? `+${expectedPoints.toLocaleString('en-US')} points`
                    : `+${property.pointsPerNight} per night`}
                </strong>
              </span>
            </div>

            <button
              type="button"
              className="property-booking__primary"
              disabled={nights === 0}
              onClick={() => navigate('/login')}
            >
              Continue to secure booking
              <DetailIcon name="arrow" size={17} />
            </button>

            <button
              type="button"
              className="property-booking__secondary"
              onClick={() => navigate('/contact')}
            >
              Ask management a question
            </button>

            <p>
              No payment is taken on this preview. Final fees, availability,
              and property terms will appear before confirmation.
            </p>
          </aside>
        </section>

        <section className="property-related">
          <div className="property-related__heading">
            <div>
              <span className="property-eyebrow">
                Continue exploring
              </span>
              <h2>More manager-approved stays</h2>
            </div>

            <Link to="/">
              View all properties
              <DetailIcon name="arrow" size={17} />
            </Link>
          </div>

          <div className="property-related__grid">
            {relatedProperties.map((relatedProperty) => (
              <Link
                to={`/properties/${relatedProperty.id}`}
                className="property-related__card"
                key={relatedProperty.id}
              >
                <div>
                  <img
                    src={relatedProperty.image}
                    alt={relatedProperty.title}
                  />

                  <span>
                    +{relatedProperty.pointsPerNight} pts/night
                  </span>
                </div>

                <section>
                  <small>
                    {relatedProperty.city}, {relatedProperty.state}
                  </small>

                  <h3>{relatedProperty.title}</h3>

                  <p>
                    {relatedProperty.beds} beds ·{' '}
                    {relatedProperty.baths} baths ·{' '}
                    {relatedProperty.guests} guests
                  </p>

                  <footer>
                    <strong>
                      {currencyFormatter.format(relatedProperty.price)}
                      <span> / night</span>
                    </strong>

                    <span>
                      <DetailIcon name="star" size={14} />
                      {relatedProperty.rating}
                    </span>
                  </footer>
                </section>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}

export default PropertyPage
