'use client'
import { useState, useEffect } from 'react'
import { searchArtistsByGenre, SpotifyArtist } from '@/lib/spotify'

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

        // Extract top genres weighted by listen rank
        const genreCount: Record<string, number> = {}
        topArtists.slice(0, 20).forEach((artist, i) => {
          const weight = 20 - i
          artist.genres.forEach((g) => {
            genreCount[g] = (genreCount[g] ?? 0) + weight
          })
        })

        // Pick top 3 genres
        const topGenres = Object.entries(genreCount)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([g]) => g)

        if (!topGenres.length) {
          setLoading(false)
          return
        }

        const candidates: SpotifyArtist[] = []

        for (const genre of topGenres) {
          const data = await searchArtistsByGenre(token, genre, 25)
          if (cancelled) return
          ;(data.artists?.items ?? []).filter(
            (a) => !topIds.has(a.id) && a.popularity < 65 && a.popularity > 5
          ).forEach((a) => candidates.push(a))
        }

        // Deduplicate, sort by most underground first
        const unique = Array.from(
          new Map(candidates.map((a) => [a.id, a])).values()
        )
        unique.sort((a, b) => a.popularity - b.popularity)
        setDiscoveries(unique.slice(0, 12))
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
