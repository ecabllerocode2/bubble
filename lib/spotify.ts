const SCOPES = [
  'user-top-read',
  'user-read-private',
].join(' ')

// ── PKCE helpers ──────────────────────────────────────────────────────────────

function generateVerifier(length = 64): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~'
  const arr = new Uint8Array(length)
  crypto.getRandomValues(arr)
  return Array.from(arr, (b) => chars[b % chars.length]).join('')
}

async function generateChallenge(verifier: string): Promise<string> {
  const data = new TextEncoder().encode(verifier)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

// ── Auth URL (PKCE) ───────────────────────────────────────────────────────────

export const getAuthUrl = async (): Promise<string> => {
  const verifier = generateVerifier()
  const challenge = await generateChallenge(verifier)
  // Store verifier for the callback
  sessionStorage.setItem('pkce_verifier', verifier)

  const params = new URLSearchParams({
    client_id: process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID!,
    response_type: 'code',
    redirect_uri: process.env.NEXT_PUBLIC_REDIRECT_URI!,
    scope: SCOPES,
    code_challenge_method: 'S256',
    code_challenge: challenge,
  })
  return `https://accounts.spotify.com/authorize?${params}`
}

// ── Token exchange (PKCE) ─────────────────────────────────────────────────────

export const exchangeCodeForToken = async (code: string): Promise<{
  access_token: string
  expires_in: number
}> => {
  const verifier = sessionStorage.getItem('pkce_verifier')
  if (!verifier) throw new Error('Missing PKCE verifier')

  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: process.env.NEXT_PUBLIC_REDIRECT_URI!,
    client_id: process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID!,
    code_verifier: verifier,
  })

  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Token exchange failed: ${err}`)
  }

  sessionStorage.removeItem('pkce_verifier')
  return res.json()
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
