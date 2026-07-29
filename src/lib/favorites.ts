import {
  useEffect,
  useState,
} from 'react'

const FAVORITES_STORAGE_KEY =
  'rental-platform.favorite-property-ids.v1'

const DEFAULT_FAVORITE_IDS = [2]

function normalizeFavoriteIds(
  value: unknown,
): number[] {
  if (!Array.isArray(value)) {
    return []
  }

  return Array.from(
    new Set(
      value.filter(
        (propertyId): propertyId is number =>
          typeof propertyId === 'number' &&
          Number.isInteger(propertyId) &&
          propertyId > 0,
      ),
    ),
  ).sort((first, second) => first - second)
}

function readFavoriteIds(): number[] {
  if (typeof window === 'undefined') {
    return DEFAULT_FAVORITE_IDS
  }

  const storedValue =
    window.localStorage.getItem(
      FAVORITES_STORAGE_KEY,
    )

  if (storedValue === null) {
    return DEFAULT_FAVORITE_IDS
  }

  try {
    return normalizeFavoriteIds(
      JSON.parse(storedValue),
    )
  } catch {
    return DEFAULT_FAVORITE_IDS
  }
}

export function usePersistentFavorites() {
  const [favorites, setFavorites] =
    useState<Set<number>>(
      () => new Set(readFavoriteIds()),
    )

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    window.localStorage.setItem(
      FAVORITES_STORAGE_KEY,
      JSON.stringify(
        Array.from(favorites).sort(
          (first, second) => first - second,
        ),
      ),
    )
  }, [favorites])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const synchronizeFavorites = (
      event: StorageEvent,
    ) => {
      if (
        event.key !== FAVORITES_STORAGE_KEY
      ) {
        return
      }

      setFavorites(
        new Set(readFavoriteIds()),
      )
    }

    window.addEventListener(
      'storage',
      synchronizeFavorites,
    )

    return () => {
      window.removeEventListener(
        'storage',
        synchronizeFavorites,
      )
    }
  }, [])

  const toggleFavorite = (
    propertyId: number,
  ) => {
    setFavorites((currentFavorites) => {
      const nextFavorites =
        new Set(currentFavorites)

      if (nextFavorites.has(propertyId)) {
        nextFavorites.delete(propertyId)
      } else {
        nextFavorites.add(propertyId)
      }

      return nextFavorites
    })
  }

  const removeFavorite = (
    propertyId: number,
  ) => {
    setFavorites((currentFavorites) => {
      const nextFavorites =
        new Set(currentFavorites)

      nextFavorites.delete(propertyId)

      return nextFavorites
    })
  }

  return {
    favorites,
    favoriteCount: favorites.size,
    isFavorite: (propertyId: number) =>
      favorites.has(propertyId),
    toggleFavorite,
    removeFavorite,
  }
}
