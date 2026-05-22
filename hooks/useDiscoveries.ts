'use client'
import { useState, useEffect } from 'react'
import { fetchRelatedArtists, SpotifyArtist } from '@/lib/spotify'

export function useDiscoveries(token: string | null, topArtists: SpotifyArtist[]) {
  const [discoveries, setDiscoveries] = useState<SpotifyArtist[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!token || topArtists.length === 0) return

    let cancelled = false

    const findDiscoveries = async () => {
      setLoading(true)
      try {
        const topIds = new Set(topArtists.map((a) => a.id))
        const candidates: SpotifyArtist[] = []

        // Use top 5 artists to find related ones
        for (const artist of topArtists.slice(0, 5)) {
          const data = await fetchRelatedArtists(token, artist.id)
          data.artists
            .filter((a) => !topIds.has(a.id) && a.popularity < 65)
            .forEach((a) => candidates.push(a))
        }

        if (cancelled) return

        // Deduplicate by id, sort by most underground first
        const unique = Array.from(
          new Map(candidates.map((a) => [a.id, a])).values()
        )
        const sorted = unique.sort((a, b) => a.popularity - b.popularity)
        setDiscoveries(sorted.slice(0, 12))
      } catch (err) {
        console.error('Error fetching discoveries:', err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    findDiscoveries()
    return () => { cancelled = true }
  }, [token, topArtists])

  return { discoveries, loading }
}
