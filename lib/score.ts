import { SpotifyArtist } from './spotify'

export interface ArtistWithScore extends SpotifyArtist {
  undergroundScore: number // 0-100, inverse of popularity
  listenWeight: number     // 1-50 based on listening rank
}

export const processArtists = (artists: SpotifyArtist[]): ArtistWithScore[] => {
  return artists.map((artist, i) => ({
    ...artist,
    undergroundScore: 100 - artist.popularity,
    listenWeight: 50 - i,
  }))
}

export const calculateUndergroundScore = (artists: SpotifyArtist[]): number => {
  if (!artists.length) return 0
  // Weighted average: artists you listen to most weigh more
  const totalWeight = artists.reduce((sum, _, i) => sum + (50 - i), 0)
  const weightedSum = artists.reduce((sum, artist, i) => {
    const weight = 50 - i
    const underground = 100 - artist.popularity
    return sum + underground * weight
  }, 0)
  return Math.round(weightedSum / totalWeight)
}

export const getUndergroundLabel = (score: number): string => {
  if (score >= 80) return 'Explorador absoluto'
  if (score >= 65) return 'Fuera del radar'
  if (score >= 50) return 'Entre dos mundos'
  if (score >= 35) return 'Corriente principal'
  return 'Mainstream puro'
}

export const getUndergroundDescription = (score: number): string => {
  if (score >= 80) return 'Escuchas cosas que nadie más conoce. Serio.'
  if (score >= 65) return 'Estás bien lejos del radar mainstream.'
  if (score >= 50) return 'Mezclas lo popular con lo underground.'
  if (score >= 35) return 'Mayormente corriente principal, con toques alternativos.'
  return 'Estás dentro de la burbuja mainstream. No pasa nada.'
}
