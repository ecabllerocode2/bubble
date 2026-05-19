'use client'
import { useState, useCallback } from 'react'
import { fetchTopArtists, fetchCurrentUser, SpotifyArtist, SpotifyUser } from '@/lib/spotify'
import { processArtists, calculateUndergroundScore, ArtistWithScore } from '@/lib/score'

type Term = 'short_term' | 'medium_term' | 'long_term'

interface SpotifyState {
  user: SpotifyUser | null
  artists: ArtistWithScore[]
  score: number
  loading: boolean
  error: string | null
}

export function useSpotify() {
  const [state, setState] = useState<SpotifyState>({
    user: null,
    artists: [],
    score: 0,
    loading: false,
    error: null,
  })

  const getToken = useCallback((): string | null => {
    const token = localStorage.getItem('spotify_token')
    const expiresAt = Number(localStorage.getItem('spotify_token_expires') || 0)
    if (!token || Date.now() > expiresAt) {
      localStorage.removeItem('spotify_token')
      localStorage.removeItem('spotify_token_expires')
      return null
    }
    return token
  }, [])

  const loadData = useCallback(async (term: Term = 'medium_term') => {
    const token = getToken()
    if (!token) return false

    setState(s => ({ ...s, loading: true, error: null }))

    try {
      const [userData, artistData] = await Promise.all([
        fetchCurrentUser(token),
        fetchTopArtists(token, term),
      ])

      const processed = processArtists(artistData.items as SpotifyArtist[])
      const score = calculateUndergroundScore(artistData.items as SpotifyArtist[])

      setState({ user: userData, artists: processed, score, loading: false, error: null })
      return true
    } catch (err) {
      console.error(err)
      setState(s => ({
        ...s,
        loading: false,
        error: 'Error al cargar tus datos de Spotify.',
      }))
      return false
    }
  }, [getToken])

  const logout = useCallback(() => {
    localStorage.removeItem('spotify_token')
    localStorage.removeItem('spotify_token_expires')
  }, [])

  return { ...state, loadData, logout, getToken }
}
