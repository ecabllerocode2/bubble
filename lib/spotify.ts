const SCOPES = [
  'user-top-read',
  'user-read-private',
].join(' ')

export const getAuthUrl = (): string => {
  const params = new URLSearchParams({
    client_id: process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID!,
    response_type: 'token',
    redirect_uri: process.env.NEXT_PUBLIC_REDIRECT_URI!,
    scope: SCOPES,
  })
  return `https://accounts.spotify.com/authorize?${params}`
}

export const fetchTopArtists = async (
  token: string,
  term: 'short_term' | 'medium_term' | 'long_term'
): Promise<{ items: SpotifyArtist[] }> => {
  const res = await fetch(
    `https://api.spotify.com/v1/me/top/artists?limit=50&time_range=${term}`,
    { headers: { Authorization: `Bearer ${token}` } }
  )
  if (!res.ok) throw new Error(`Spotify API error: ${res.status}`)
  return res.json()
}

export const fetchRelatedArtists = async (
  token: string,
  artistId: string
): Promise<{ artists: SpotifyArtist[] }> => {
  const res = await fetch(
    `https://api.spotify.com/v1/artists/${artistId}/related-artists`,
    { headers: { Authorization: `Bearer ${token}` } }
  )
  if (!res.ok) throw new Error(`Spotify API error: ${res.status}`)
  return res.json()
}

export const fetchCurrentUser = async (
  token: string
): Promise<SpotifyUser> => {
  const res = await fetch('https://api.spotify.com/v1/me', {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error(`Spotify API error: ${res.status}`)
  return res.json()
}

export interface SpotifyArtist {
  id: string
  name: string
  popularity: number
  images: { url: string; width: number; height: number }[]
  genres: string[]
  external_urls: { spotify: string }
}

export interface SpotifyUser {
  id: string
  display_name: string
  images: { url: string }[]
}
