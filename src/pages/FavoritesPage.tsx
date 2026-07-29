import { Link } from 'react-router'
import PlatformPage from '../components/layout/PlatformPage'
import {
  properties,
  type Property,
} from '../data/properties'
import { usePersistentFavorites } from '../lib/favorites'
import './FavoritesAppExperience.css'

const currencyFormatter =
  new Intl.NumberFormat(
    'en-US',
    {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    },
  )

function FavoritePropertyCard({
  property,
  onRemove,
}: {
  property: Property
  onRemove: (propertyId: number) => void
}) {
  return (
    <article className="favorites-property-card">
      <div className="favorites-property-card__gallery">
        <img
          className="favorites-property-card__main-image"
          src={property.image}
          alt={property.title}
        />

        <div className="favorites-property-card__thumbnails">
          {property.thumbnails
            .slice(0, 2)
            .map((thumbnail, index) => (
              <img
                src={thumbnail}
                alt=""
                aria-hidden="true"
                key={`${property.id}-${index}`}
              />
            ))}
        </div>

        <span className="favorites-property-card__label">
          {property.label}
        </span>

        <span className="favorites-property-card__points">
          +{property.pointsPerNight} points/night
        </span>

        <button
          type="button"
          className="favorites-property-card__remove"
          onClick={() => onRemove(property.id)}
          aria-label={`Remove ${property.title} from favorites`}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="currentColor"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z" />
          </svg>
        </button>
      </div>

      <div className="favorites-property-card__body">
        <header>
          <div>
            <span>
              {property.city}, {property.state}
            </span>

            <h3>{property.title}</h3>
          </div>

          <strong>
            <span aria-hidden="true">★</span>
            {property.rating}
          </strong>
        </header>

        <p>{property.description}</p>

        <div className="favorites-property-card__details">
          <span>{property.beds} beds</span>
          <span>{property.baths} baths</span>
          <span>{property.guests} guests</span>
          <span>{property.type}</span>
        </div>

        <footer>
          <div>
            <small>Member nightly rate</small>

            <p>
              <strong>
                {currencyFormatter.format(
                  property.price,
                )}
              </strong>

              <span> / night</span>
            </p>
          </div>

          <Link
            to={`/properties/${property.id}`}
          >
            View property
            <span aria-hidden="true">→</span>
          </Link>
        </footer>

        <div className="favorites-property-card__social">
          <span>
            {property.likes.toLocaleString('en-US')}{' '}
            collective likes
          </span>

          <span>
            {property.reviewCount} verified reviews
          </span>
        </div>
      </div>
    </article>
  )
}

function FavoritesPage() {
  const {
    favorites,
    removeFavorite,
  } = usePersistentFavorites()

  const savedProperties = properties.filter(
    (property) => favorites.has(property.id),
  )

  const recommendedProperties = properties
    .filter(
      (property) => !favorites.has(property.id),
    )
    .slice(0, 3)

  const heroProperty =
    savedProperties[0] ??
    recommendedProperties[0] ??
    properties[0]

  if (!heroProperty) {
    return null
  }

  const averageNightlyRate =
    savedProperties.length > 0
      ? Math.round(
          savedProperties.reduce(
            (total, property) =>
              total + property.price,
            0,
          ) / savedProperties.length,
        )
      : 0

  const highestRewardValue =
    savedProperties.length > 0
      ? Math.max(
          ...savedProperties.map(
            (property) =>
              property.pointsPerNight,
          ),
        )
      : 0

  const highestRating =
    savedProperties.length > 0
      ? Math.max(
          ...savedProperties.map(
            (property) => property.rating,
          ),
        )
      : 0

  return (
    <PlatformPage
      memberNavigation
      heroImage={heroProperty.image}
      eyebrow="Saved by you"
      title="Favorite Properties"
      description="A private collection of the rentals that caught your attention, ready for comparison and future booking."
    >
      <section
        className="favorites-app"
        aria-label="Saved rental properties"
      >
        <article className="favorites-collection-banner">
          <img
            src={
              heroProperty.thumbnails[0] ??
              heroProperty.image
            }
            alt=""
            aria-hidden="true"
          />

          <span className="favorites-collection-banner__shade" />

          <div className="favorites-collection-banner__copy">
            <span>Your private collection</span>

            <h2>
              {savedProperties.length}{' '}
              {savedProperties.length === 1
                ? 'stay'
                : 'stays'}{' '}
              worth remembering.
            </h2>

            <p>
              Compare nightly rates, reward values,
              capacity, ratings, and verified guest
              activity without starting your search
              again.
            </p>

            <Link to="/">
              Discover more properties
              <span aria-hidden="true">→</span>
            </Link>
          </div>

          <aside className="favorites-collection-banner__stats">
            <span>
              <small>Saved properties</small>
              <strong>{savedProperties.length}</strong>
            </span>

            <span>
              <small>Average nightly rate</small>
              <strong>
                {savedProperties.length > 0
                  ? currencyFormatter.format(
                      averageNightlyRate,
                    )
                  : '—'}
              </strong>
            </span>

            <span>
              <small>Highest reward value</small>
              <strong>
                {savedProperties.length > 0
                  ? `+${highestRewardValue}`
                  : '—'}
              </strong>
            </span>

            <span>
              <small>Highest guest rating</small>
              <strong>
                {savedProperties.length > 0
                  ? `★ ${highestRating}`
                  : '—'}
              </strong>
            </span>
          </aside>
        </article>

        {savedProperties.length > 0 ? (
          <section className="favorites-saved-section">
            <header className="favorites-section-heading">
              <div>
                <span>Saved rental collection</span>

                <h2>
                  Places you chose to keep.
                </h2>
              </div>

              <p>
                Remove a stay at any time or open its
                full property experience to review
                images, amenities, pricing, and reward
                potential.
              </p>
            </header>

            <div className="favorites-property-grid">
              {savedProperties.map((property) => (
                <FavoritePropertyCard
                  property={property}
                  onRemove={removeFavorite}
                  key={property.id}
                />
              ))}
            </div>
          </section>
        ) : (
          <section className="favorites-empty-state">
            <img
              src={heroProperty.image}
              alt=""
              aria-hidden="true"
            />

            <span className="favorites-empty-state__shade" />

            <div>
              <span>Your collection is empty</span>

              <h2>
                Save the places you do not want to
                lose.
              </h2>

              <p>
                Select the heart on any property card
                or property-detail page. That rental
                will appear here automatically.
              </p>

              <Link to="/">
                Browse member rentals
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </section>
        )}

        {recommendedProperties.length > 0 && (
          <section className="favorites-recommendations">
            <header className="favorites-section-heading">
              <div>
                <span>More to consider</span>

                <h2>
                  Your collection could use these.
                </h2>
              </div>

              <Link to="/">
                View every rental
                <span aria-hidden="true">→</span>
              </Link>
            </header>

            <div className="favorites-recommendation-grid">
              {recommendedProperties.map(
                (property) => (
                  <Link
                    to={`/properties/${property.id}`}
                    className="favorites-recommendation-card"
                    key={property.id}
                  >
                    <img
                      src={property.image}
                      alt={property.title}
                    />

                    <span className="favorites-recommendation-card__shade" />

                    <div>
                      <small>
                        {property.city},{' '}
                        {property.state}
                      </small>

                      <strong>
                        {property.title}
                      </strong>

                      <span>
                        {currencyFormatter.format(
                          property.price,
                        )}{' '}
                        / night
                      </span>
                    </div>

                    <i aria-hidden="true">→</i>
                  </Link>
                ),
              )}
            </div>
          </section>
        )}
      </section>
    </PlatformPage>
  )
}

export default FavoritesPage
