export const propertyTypeOptions = [
  'Beach House',
  'Cabin',
  'Estate',
  'Apartment',
  'Loft',
  'Waterfront',
] as const

export type PropertyType = (typeof propertyTypeOptions)[number]

export type Property = {
  id: number
  title: string
  city: string
  state: string
  type: PropertyType
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

export const properties: Property[] = [
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
      'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=900&q=86',
      'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=900&q=86',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=86',
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
      'https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?auto=format&fit=crop&w=900&q=86',
      'https://images.unsplash.com/photo-1520984032042-162d526883e0?auto=format&fit=crop&w=900&q=86',
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=86',
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
      'https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?auto=format&fit=crop&w=900&q=86',
      'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=900&q=86',
      'https://images.unsplash.com/photo-1600566753051-f0b89df2dd90?auto=format&fit=crop&w=900&q=86',
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
      'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=900&q=86',
      'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=900&q=86',
      'https://images.unsplash.com/photo-1600585152915-d208bec867a1?auto=format&fit=crop&w=900&q=86',
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
      'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=900&q=86',
      'https://images.unsplash.com/photo-1600573472592-401b489a3cdc?auto=format&fit=crop&w=900&q=86',
      'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=900&q=86',
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
      'https://images.unsplash.com/photo-1600607688066-890987f18a86?auto=format&fit=crop&w=900&q=86',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=86',
      'https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&w=900&q=86',
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

export function getPropertyById(
  propertyId: string | number | undefined,
): Property | undefined {
  if (propertyId === undefined) {
    return undefined
  }

  const numericId =
    typeof propertyId === 'number' ? propertyId : Number(propertyId)

  if (!Number.isInteger(numericId)) {
    return undefined
  }

  return properties.find((property) => property.id === numericId)
}
