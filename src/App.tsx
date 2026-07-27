import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type WheelEvent,
} from 'react'
import './App.css'

type IconName =
  | 'search'
  | 'bell'
  | 'heart'
  | 'contact'
  | 'profile'
  | 'map'
  | 'calendar'
  | 'star'
  | 'arrow'
  | 'home'
  | 'close'

type Property = {
  id: number
  title: string
  city: string
  state: string
  type: string
  price: number
  image: string
  thumbnails: string[]
  beds: number
  baths: number
  guests: number
  rating: number
  reviewCount: number
  likes: number
  pointsPerNight: number
  label: string
  description: string
}

type Filters = {
  state: string
  city: string
  type: string
}

const emptyFilters: Filters = {
  state: '',
  city: '',
  type: '',
}

const properties: Property[] = [
  {
    id: 1,
    title: 'Azure Modern Estate',
    city: 'Miami',
    state: 'Florida',
    type: 'Beach House',
    price: 420,
    image:
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1800&q=88',
    thumbnails: [
      'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=500&q=82',
      'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=500&q=82',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=500&q=82',
    ],
    beds: 5,
    baths: 4,
    guests: 10,
    rating: 4.9,
    reviewCount: 118,
    likes: 842,
    pointsPerNight: 300,
    label: 'Waterfront Favorite',
    description:
      'A light-filled waterfront home with a private pool, expansive gathering spaces, and direct access to the coast.',
  },
  {
    id: 2,
    title: 'Cedar Ridge Retreat',
    city: 'Blue Ridge',
    state: 'Georgia',
    type: 'Cabin',
    price: 265,
    image:
      'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1800&q=88',
    thumbnails: [
      'https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?auto=format&fit=crop&w=500&q=82',
      'https://images.unsplash.com/photo-1520984032042-162d526883e0?auto=format&fit=crop&w=500&q=82',
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=500&q=82',
    ],
    beds: 3,
    baths: 2,
    guests: 7,
    rating: 4.8,
    reviewCount: 86,
    likes: 516,
    pointsPerNight: 175,
    label: 'Mountain Escape',
    description:
      'A warm cedar cabin surrounded by forest views, quiet trails, and an outdoor fire lounge.',
  },
  {
    id: 3,
    title: 'Skyline Glass Loft',
    city: 'Atlanta',
    state: 'Georgia',
    type: 'Loft',
    price: 195,
    image:
      'https://images.unsplash.com/photo-1600607688969-a5bfcd646154?auto=format&fit=crop&w=1800&q=88',
    thumbnails: [
      'https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?auto=format&fit=crop&w=500&q=82',
      'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=500&q=82',
      'https://images.unsplash.com/photo-1600566753051-f0b89df2dd90?auto=format&fit=crop&w=500&q=82',
    ],
    beds: 2,
    baths: 2,
    guests: 4,
    rating: 4.7,
    reviewCount: 64,
    likes: 391,
    pointsPerNight: 125,
    label: 'City View',
    description:
      'An elevated city loft with floor-to-ceiling glass, modern finishes, and walkable entertainment.',
  },
  {
    id: 4,
    title: 'Desert Light Villa',
    city: 'Scottsdale',
    state: 'Arizona',
    type: 'Estate',
    price: 510,
    image:
      'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=1800&q=88',
    thumbnails: [
      'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=500&q=82',
      'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=500&q=82',
      'https://images.unsplash.com/photo-1600585152915-d208bec867a1?auto=format&fit=crop&w=500&q=82',
    ],
    beds: 6,
    baths: 5,
    guests: 12,
    rating: 4.9,
    reviewCount: 92,
    likes: 704,
    pointsPerNight: 350,
    label: 'Private Resort',
    description:
      'A private desert estate with sculptural architecture, a resort pool, and sunset entertaining areas.',
  },
  {
    id: 5,
    title: 'Harborline Apartment',
    city: 'Chicago',
    state: 'Illinois',
    type: 'Apartment',
    price: 175,
    image:
      'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1800&q=88',
    thumbnails: [
      'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=500&q=82',
      'https://images.unsplash.com/photo-1600573472592-401b489a3cdc?auto=format&fit=crop&w=500&q=82',
      'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=500&q=82',
    ],
    beds: 2,
    baths: 1,
    guests: 4,
    rating: 4.6,
    reviewCount: 48,
    likes: 287,
    pointsPerNight: 100,
    label: 'Downtown Access',
    description:
      'A polished downtown apartment designed for convenient stays, skyline views, and easy city access.',
  },
  {
    id: 6,
    title: 'Emerald Coast Haven',
    city: 'Destin',
    state: 'Florida',
    type: 'Waterfront',
    price: 385,
    image:
      'https://images.unsplash.com/photo-1600607688960-e095ff83135c?auto=format&fit=crop&w=1800&q=88',
    thumbnails: [
      'https://images.unsplash.com/photo-1600607688066-890987f18a86?auto=format&fit=crop&w=500&q=82',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=500&q=82',
      'https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&w=500&q=82',
    ],
    beds: 4,
    baths: 3,
    guests: 9,
    rating: 4.8,
    reviewCount: 105,
    likes: 655,
    pointsPerNight: 250,
    label: 'Beach Access',
    description:
      'A relaxed coastal home with bright interiors, generous outdoor space, and direct beach access.',
  },
]

const propertyTypeOptions = [
  'Beach House',
  'Cabin',
  'Estate',
  'Apartment',
  'Loft',
  'Waterfront',
]

function Icon({
  name,
  size = 20,
  filled = false,
}: {
  name: IconName
  size?: number
  filled?: boolean
}) {
  const shared = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  }

  switch (name) {
    case 'search':
      return (
        <svg {...shared}>
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-4-4" />
        </svg>
      )
    case 'bell':
      return (
        <svg {...shared}>
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
          <path d="M10 21h4" />
        </svg>
      )
    case 'heart':
      return (
        <svg
          {...shared}
          fill={filled ? 'currentColor' : 'none'}
          strokeWidth={filled ? 1.4 : 1.8}
        >
          <path d="M20.8 4.7a5.5 5.5 0 0 0-7.8 0L12 5.8l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21.4l7.8-7.8 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z" />
        </svg>
      )
    case 'contact':
      return (
        <svg {...shared}>
          <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z" />
          <path d="M8 9h8M8 13h5" />
        </svg>
      )
    case 'profile':
      return (
        <svg {...shared}>
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21a8 8 0 0 1 16 0" />
        </svg>
      )
    case 'map':
      return (
        <svg {...shared}>
          <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
          <circle cx="12" cy="10" r="2.5" />
        </svg>
      )
    case 'calendar':
      return (
        <svg {...shared}>
          <rect x="3" y="5" width="18" height="16" rx="2" />
          <path d="M16 3v4M8 3v4M3 10h18" />
        </svg>
      )
    case 'star':
      return (
        <svg {...shared} fill="currentColor" strokeWidth="1.2">
          <path d="m12 2.5 2.9 5.9 6.5.9-4.7 4.6 1.1 6.5-5.8-3-5.8 3 1.1-6.5-4.7-4.6 6.5-.9Z" />
        </svg>
      )
    case 'arrow':
      return (
        <svg {...shared}>
          <path d="M5 12h14M14 7l5 5-5 5" />
        </svg>
      )
    case 'home':
      return (
        <svg {...shared}>
          <path d="m3 11 9-8 9 8" />
          <path d="M5 10v11h14V10M9 21v-7h6v7" />
        </svg>
      )
    case 'close':
      return (
        <svg {...shared}>
          <path d="m6 6 12 12M18 6 6 18" />
        </svg>
      )
    default:
      return null
  }
}

function App() {
  const [activeHeroIndex, setActiveHeroIndex] = useState(2)
  const [favorites, setFavorites] = useState<Set<number>>(
    () => new Set([2]),
  )
  const [filters, setFilters] = useState<Filters>(emptyFilters)
  const [appliedFilters, setAppliedFilters] =
    useState<Filters>(emptyFilters)
  const [reviewPropertyId, setReviewPropertyId] = useState<number | null>(
    null,
  )

  const wheelLocked = useRef(false)
  const heroHoverTimer = useRef<number | null>(null)

  useEffect(() => {
    document.title = 'Rental Platform — Member Stays & Rewards'
  }, [])

  const availableStates = useMemo(
    () =>
      Array.from(new Set(properties.map((property) => property.state))).sort(),
    [],
  )

  const availableCities = useMemo(() => {
    if (!filters.state) {
      return []
    }

    return Array.from(
      new Set(
        properties
          .filter((property) => property.state === filters.state)
          .map((property) => property.city),
      ),
    ).sort()
  }, [filters.state])

  const stateOptions = useMemo(() => {
    return availableStates
      .map((state) => {
        const stateProperties = properties.filter(
          (property) => property.state === state,
        )

        return {
          name: state,
          propertyCount: stateProperties.length,
          cities: Array.from(
            new Set(stateProperties.map((property) => property.city)),
          ).sort(),
        }
      })
      .sort(
        (firstState, secondState) =>
          secondState.propertyCount - firstState.propertyCount ||
          firstState.name.localeCompare(secondState.name),
      )
  }, [availableStates])

  const filteredProperties = useMemo(() => {
    return properties.filter((property) => {
      const stateMatches =
        !appliedFilters.state || property.state === appliedFilters.state
      const cityMatches =
        !appliedFilters.city || property.city === appliedFilters.city
      const typeMatches =
        !appliedFilters.type || property.type === appliedFilters.type

      return stateMatches && cityMatches && typeMatches
    })
  }, [appliedFilters])

  const activeHero = properties[activeHeroIndex]
  const reviewProperty =
    properties.find((property) => property.id === reviewPropertyId) ?? null

  const moveHero = useCallback((direction: number) => {
    setActiveHeroIndex((currentIndex) => {
      const nextIndex =
        (currentIndex + direction + properties.length) % properties.length

      return nextIndex
    })
  }, [])

  const scheduleHeroPreview = (index: number) => {
    if (index === activeHeroIndex) {
      return
    }

    if (heroHoverTimer.current !== null) {
      window.clearTimeout(heroHoverTimer.current)
    }

    heroHoverTimer.current = window.setTimeout(() => {
      setActiveHeroIndex(index)
      heroHoverTimer.current = null
    }, 180)
  }

  const cancelHeroPreview = () => {
    if (heroHoverTimer.current !== null) {
      window.clearTimeout(heroHoverTimer.current)
      heroHoverTimer.current = null
    }
  }

  const handleHeroWheel = (event: WheelEvent<HTMLDivElement>) => {
    if (wheelLocked.current || Math.abs(event.deltaY) < 12) {
      return
    }

    wheelLocked.current = true
    moveHero(event.deltaY > 0 ? 1 : -1)

    window.setTimeout(() => {
      wheelLocked.current = false
    }, 650)
  }

  const toggleFavorite = (propertyId: number) => {
    setFavorites((currentFavorites) => {
      const nextFavorites = new Set(currentFavorites)

      if (nextFavorites.has(propertyId)) {
        nextFavorites.delete(propertyId)
      } else {
        nextFavorites.add(propertyId)
      }

      return nextFavorites
    })
  }

  const applySearch = () => {
    setAppliedFilters(filters)

    window.setTimeout(() => {
      document
        .getElementById('featured-listings')
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 50)
  }

  const applyState = (state: string) => {
    const nextFilters = {
      ...filters,
      state,
      city: '',
    }

    setFilters(nextFilters)
    setAppliedFilters(nextFilters)

    window.setTimeout(() => {
      document
        .getElementById('featured-listings')
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 50)
  }

  const resetSearch = () => {
    setFilters(emptyFilters)
    setAppliedFilters(emptyFilters)
  }

  const scrollToSection = (sectionId: string) => {
    document
      .getElementById(sectionId)
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="app-shell">
      <header className="top-nav">
        <div className="top-nav__inner">
          <button
            type="button"
            className="brand"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            aria-label="Return to the top"
          >
            <span className="brand__mark">
              <Icon name="home" size={18} />
            </span>
            <span className="brand__text">
              RENTAL
              <strong>PLATFORM</strong>
            </span>
          </button>

          <nav className="desktop-nav" aria-label="Primary navigation">
            <button
              type="button"
              className="desktop-nav__link is-active"
              onClick={() => scrollToSection('quick-search')}
            >
              Rental Search
            </button>
            <button
              type="button"
              className="desktop-nav__link"
              onClick={() => scrollToSection('member-deal')}
            >
              Notifications
              <span className="notification-dot">2</span>
            </button>
            <button
              type="button"
              className="desktop-nav__link"
              onClick={() => scrollToSection('featured-listings')}
            >
              Favorites
            </button>
            <button
              type="button"
              className="desktop-nav__link"
              onClick={() => scrollToSection('contact')}
            >
              Contact
            </button>
          </nav>

          <div className="nav-actions">
            <button
              type="button"
              className="notification-button"
              aria-label="Open notifications"
              onClick={() => scrollToSection('member-deal')}
            >
              <Icon name="bell" />
              <span>2</span>
            </button>

            <button
              type="button"
              className="profile-chip"
              aria-label="Open member profile"
            >
              <span className="profile-chip__image">JW</span>
              <span className="profile-chip__copy">
                <strong>Member</strong>
                <small>1,120 points</small>
              </span>
            </button>
          </div>
        </div>
      </header>

      <main className="site-main">
        <section
          className="member-deal section-shell"
          id="member-deal"
          aria-label="Member deal"
        >
          <div className="member-deal__icon">✦</div>
          <div className="member-deal__copy">
            <span>Member Deal</span>
            <strong>Earn double points on select coastal stays this week.</strong>
          </div>
          <button
            type="button"
            onClick={() => scrollToSection('featured-listings')}
          >
            Explore deal
            <Icon name="arrow" size={17} />
          </button>
        </section>

        <section className="hero-section section-shell">
          <div className="hero-heading">
            <div>
              <span className="eyebrow">Private stays. Better rewards.</span>
              <h1>Find a place worth remembering.</h1>
            </div>

            <p>
              Explore manager-approved properties, earn points every night,
              and unlock more valuable stays as your membership grows.
            </p>
          </div>

          <div
            className="hero-gallery"
            onWheel={handleHeroWheel}
            aria-label="Featured property gallery"
          >
            {properties.map((property, index) => {
              const isActive = index === activeHeroIndex

              return (
                <button
                  type="button"
                  className={`hero-panel ${isActive ? 'is-active' : ''}`}
                  key={property.id}
                  onClick={() => setActiveHeroIndex(index)}
                  onMouseEnter={() => scheduleHeroPreview(index)}
                  onMouseLeave={cancelHeroPreview}
                  onFocus={() => setActiveHeroIndex(index)}
                  aria-pressed={isActive}
                  aria-label={`Feature ${property.title}`}
                >
                  <img src={property.image} alt={property.title} />

                  <span className="hero-panel__shade" />

                  <span className="hero-panel__partial-label">
                    {property.city}
                  </span>

                  <span className="hero-panel__content">
                    <span className="hero-panel__location">
                      <Icon name="map" size={17} />
                      {property.city}, {property.state}
                    </span>

                    <span className="hero-panel__title">{property.title}</span>

                    <span className="hero-panel__description">
                      {property.description}
                    </span>

                    <span className="hero-panel__actions">
                      <span className="hero-panel__price">
                        <strong>${property.price}</strong>
                        <small>per night</small>
                      </span>

                      <span className="hero-panel__view">
                        View property
                        <Icon name="arrow" size={17} />
                      </span>
                    </span>
                  </span>

                  <span className="points-badge hero-points">
                    +{property.pointsPerNight} pts/night
                  </span>
                </button>
              )
            })}
          </div>

          <div className="hero-gallery__footer">
            <div
              className="hero-gallery__progress"
              aria-label={`Featured property ${activeHeroIndex + 1} of ${properties.length}`}
            >
              <div>
                <i
                  style={{
                    width: `${
                      ((activeHeroIndex + 1) / properties.length) * 100
                    }%`,
                  }}
                />
              </div>
            </div>

            <p>
              Click a property panel or scroll over the gallery to explore.
            </p>
          </div>

          <div className="active-property-summary">
            <div>
              <span>Currently featured</span>
              <strong>{activeHero.title}</strong>
            </div>

            <div>
              <span>Guest rating</span>
              <strong>
                <Icon name="star" size={16} />
                {activeHero.rating}
              </strong>
            </div>

            <div>
              <span>Reward value</span>
              <strong>{activeHero.pointsPerNight} points/night</strong>
            </div>
          </div>
        </section>

        <section className="rewards-preview section-shell">
          <div className="rewards-preview__intro">
            <span className="eyebrow">Your rewards</span>
            <h2>280 points from your first free-night reward.</h2>
          </div>

          <div className="rewards-preview__meter">
            <div className="rewards-preview__meter-copy">
              <span>1,120 points</span>
              <strong>1,400 points</strong>
            </div>

            <div className="reward-meter">
              <span style={{ width: '80%' }} />
            </div>

            <p>
              Book 2 Nights, Get the 3rd Night <strong>FREE</strong>
            </p>
          </div>

          <button type="button" className="outline-button">
            View rewards
            <Icon name="arrow" size={17} />
          </button>
        </section>

        <section
          className="quick-search section-shell"
          id="quick-search"
        >
          <div className="section-heading centered-heading">
            <span className="eyebrow">Manager-approved locations</span>
            <h2>Quick Search</h2>
            <p>
              Select from the states, cities, and property types currently
              available for member booking.
            </p>
          </div>

          <div className="search-panel">
            <label>
              <span>State</span>
              <select
                value={filters.state}
                onChange={(event) =>
                  setFilters((currentFilters) => ({
                    ...currentFilters,
                    state: event.target.value,
                    city: '',
                  }))
                }
              >
                <option value="">All available states</option>
                {availableStates.map((state) => (
                  <option value={state} key={state}>
                    {state}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span>City</span>
              <select
                value={filters.city}
                disabled={!filters.state}
                onChange={(event) =>
                  setFilters((currentFilters) => ({
                    ...currentFilters,
                    city: event.target.value,
                  }))
                }
              >
                <option value="">
                  {filters.state ? 'All available cities' : 'Select a state'}
                </option>
                {availableCities.map((city) => (
                  <option value={city} key={city}>
                    {city}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span>Property type</span>
              <select
                value={filters.type}
                onChange={(event) =>
                  setFilters((currentFilters) => ({
                    ...currentFilters,
                    type: event.target.value,
                  }))
                }
              >
                <option value="">All property types</option>
                {propertyTypeOptions.map((propertyType) => (
                  <option value={propertyType} key={propertyType}>
                    {propertyType}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span>Check-in</span>
              <span className="date-field">
                <Icon name="calendar" size={18} />
                <input type="date" aria-label="Check-in date" />
              </span>
            </label>

            <button
              type="button"
              className="search-button"
              onClick={applySearch}
            >
              <Icon name="search" size={19} />
              Search rentals
            </button>
          </div>

          <div className="state-browser-heading">
            <div>
              <span>Browse by state</span>
              <p>
                Only states with active manager-approved rentals appear here.
              </p>
            </div>

            {appliedFilters.state && (
              <button type="button" onClick={resetSearch}>
                View all states
              </button>
            )}
          </div>

          <div className="state-grid" aria-label="Available rental states">
            {stateOptions.map((stateOption, index) => (
              <button
                type="button"
                key={stateOption.name}
                className={`state-card state-card--${index + 1} ${
                  appliedFilters.state === stateOption.name
                    ? 'is-selected'
                    : ''
                }`}
                onClick={() => applyState(stateOption.name)}
              >
                <span className="state-card__symbol">
                  <Icon name="map" size={19} />
                </span>

                <span className="state-card__copy">
                  <small>Available state</small>
                  <strong>{stateOption.name}</strong>
                  <span>
                    {stateOption.propertyCount}{' '}
                    {stateOption.propertyCount === 1
                      ? 'property'
                      : 'properties'}
                    {' · '}
                    {stateOption.cities.join(', ')}
                  </span>
                </span>

                <span className="state-card__arrow">
                  <Icon name="arrow" size={17} />
                </span>
              </button>
            ))}
          </div>
        </section>

        <section
          className="featured-section section-shell"
          id="featured-listings"
        >
          <div className="section-heading section-heading--split">
            <div>
              <span className="eyebrow">Available for members</span>
              <h2>
                {appliedFilters.type
                  ? `${appliedFilters.type} Rentals`
                  : 'Featured Listings'}
              </h2>
            </div>

            <div className="results-summary">
              <span>
                {filteredProperties.length}{' '}
                {filteredProperties.length === 1 ? 'property' : 'properties'}
              </span>

              {(appliedFilters.state ||
                appliedFilters.city ||
                appliedFilters.type) && (
                <button type="button" onClick={resetSearch}>
                  Clear filters
                </button>
              )}
            </div>
          </div>

          {filteredProperties.length > 0 ? (
            <div className="property-grid">
              {filteredProperties.map((property) => {
                const isFavorite = favorites.has(property.id)

                return (
                  <article className="property-card" key={property.id}>
                    <div className="property-card__image">
                      <img src={property.image} alt={property.title} />

                      <span className="property-card__label">
                        {property.label}
                      </span>

                      <button
                        type="button"
                        className={`favorite-button ${
                          isFavorite ? 'is-favorite' : ''
                        }`}
                        onClick={() => toggleFavorite(property.id)}
                        aria-label={
                          isFavorite
                            ? `Remove ${property.title} from favorites`
                            : `Add ${property.title} to favorites`
                        }
                      >
                        <Icon
                          name="heart"
                          size={20}
                          filled={isFavorite}
                        />
                      </button>

                      <span className="points-badge">
                        +{property.pointsPerNight} pts/night
                      </span>
                    </div>

                    <div className="property-card__thumbnails">
                      {property.thumbnails.map((thumbnail, index) => (
                        <button
                          type="button"
                          key={thumbnail}
                          aria-label={`View image ${index + 1} for ${
                            property.title
                          }`}
                        >
                          <img
                            src={thumbnail}
                            alt=""
                            aria-hidden="true"
                          />
                        </button>
                      ))}

                      <button
                        type="button"
                        className="thumbnail-more"
                        aria-label={`View all images for ${property.title}`}
                      >
                        +8
                      </button>
                    </div>

                    <div className="property-card__body">
                      <div className="property-card__heading">
                        <div>
                          <span>
                            {property.city}, {property.state}
                          </span>
                          <h3>{property.title}</h3>
                        </div>

                        <div className="property-card__rating">
                          <Icon name="star" size={15} />
                          <strong>{property.rating}</strong>
                        </div>
                      </div>

                      <div className="property-card__details">
                        <span>{property.beds} beds</span>
                        <i />
                        <span>{property.baths} baths</span>
                        <i />
                        <span>{property.guests} guests</span>
                      </div>

                      <div className="property-card__pricing">
                        <p>
                          <strong>${property.price}</strong>
                          <span> / night</span>
                        </p>

                        <button type="button">
                          View details
                          <Icon name="arrow" size={16} />
                        </button>
                      </div>
                    </div>

                    <div className="property-card__social">
                      <button
                        type="button"
                        onClick={() => toggleFavorite(property.id)}
                      >
                        <Icon
                          name="heart"
                          size={17}
                          filled={isFavorite}
                        />
                        <span>
                          {property.likes + (isFavorite ? 1 : 0)} likes
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setReviewPropertyId(property.id)
                        }
                      >
                        <Icon name="contact" size={17} />
                        <span>
                          {property.reviewCount} verified guest reviews
                        </span>
                      </button>
                    </div>
                  </article>
                )
              })}
            </div>
          ) : (
            <div className="empty-results">
              <Icon name="search" size={32} />
              <h3>No rentals match those selections yet.</h3>
              <p>
                Clear the current filters to view every manager-approved
                property.
              </p>
              <button type="button" onClick={resetSearch}>
                View all properties
              </button>
            </div>
          )}
        </section>

        <section className="contact-section section-shell" id="contact">
          <div>
            <span className="eyebrow">Member assistance</span>
            <h2>Questions about a stay?</h2>
            <p>
              Contact property management for booking help, accessibility
              questions, or information about a specific rental.
            </p>
          </div>

          <button type="button">
            Contact management
            <Icon name="arrow" size={18} />
          </button>
        </section>
      </main>

      <nav className="mobile-nav" aria-label="Mobile navigation">
        <button
          type="button"
          className="is-active"
          onClick={() => scrollToSection('quick-search')}
        >
          <Icon name="search" />
          <span>Search</span>
        </button>

        <button
          type="button"
          onClick={() => scrollToSection('member-deal')}
        >
          <span className="mobile-nav__icon">
            <Icon name="bell" />
            <i>2</i>
          </span>
          <span>Alerts</span>
        </button>

        <button
          type="button"
          onClick={() => scrollToSection('featured-listings')}
        >
          <Icon name="heart" />
          <span>Favorites</span>
        </button>

        <button
          type="button"
          onClick={() => scrollToSection('contact')}
        >
          <Icon name="contact" />
          <span>Contact</span>
        </button>

        <button type="button">
          <Icon name="profile" />
          <span>Profile</span>
        </button>
      </nav>

      {reviewProperty && (
        <div
          className="review-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="review-modal-title"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setReviewPropertyId(null)
            }
          }}
        >
          <div className="review-modal__card">
            <button
              type="button"
              className="review-modal__close"
              onClick={() => setReviewPropertyId(null)}
              aria-label="Close guest reviews"
            >
              <Icon name="close" />
            </button>

            <div className="review-modal__property">
              <img
                src={reviewProperty.image}
                alt={reviewProperty.title}
              />

              <div>
                <span>Verified guest reviews</span>
                <h2 id="review-modal-title">{reviewProperty.title}</h2>
                <p>
                  <Icon name="star" size={16} />
                  {reviewProperty.rating} from{' '}
                  {reviewProperty.reviewCount} completed stays
                </p>
              </div>
            </div>

            <div className="review-modal__summary">
              <div>
                <strong>{reviewProperty.rating}</strong>
                <span>Overall rating</span>
              </div>

              <div className="review-bars">
                <span>
                  Cleanliness
                  <i><b style={{ width: '96%' }} /></i>
                </span>
                <span>
                  Accuracy
                  <i><b style={{ width: '94%' }} /></i>
                </span>
                <span>
                  Management
                  <i><b style={{ width: '98%' }} /></i>
                </span>
              </div>
            </div>

            <article className="guest-review">
              <div className="guest-review__avatar">AM</div>
              <div>
                <header>
                  <div>
                    <strong>Alex M.</strong>
                    <span>Verified stay · June 2026</span>
                  </div>
                  <span className="guest-review__stars">★★★★★</span>
                </header>

                <p>
                  The property was exactly as described, beautifully
                  maintained, and easy to access. Management communicated
                  clearly before arrival and throughout the stay.
                </p>

                <div className="manager-response">
                  <strong>Response from Property Management</strong>
                  <p>
                    Thank you for staying with us. We are glad the home and
                    arrival experience met your expectations.
                  </p>
                </div>
              </div>
            </article>

            <article className="guest-review">
              <div className="guest-review__avatar">TS</div>
              <div>
                <header>
                  <div>
                    <strong>Taylor S.</strong>
                    <span>Verified stay · May 2026</span>
                  </div>
                  <span className="guest-review__stars">★★★★★</span>
                </header>

                <p>
                  A comfortable, polished stay with thoughtful details and
                  plenty of room. I would confidently book this property
                  again.
                </p>
              </div>
            </article>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
