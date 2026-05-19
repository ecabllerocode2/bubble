'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { fetchTopArtists, fetchCurrentUser, SpotifyArtist, SpotifyUser } from '@/lib/spotify'
import { calculateUndergroundScore, getUndergroundLabel, getUndergroundDescription, processArtists, ArtistWithScore } from '@/lib/score'

type Term = 'short_term' | 'medium_term' | 'long_term'

const TERM_LABELS: Record<Term, string> = {
  short_term: 'Último mes',
  medium_term: 'Últimos 6 meses',
  long_term: 'Siempre',
}

export default function Dashboard() {
  const router = useRouter()
  const [token, setToken] = useState<string | null>(null)
  const [user, setUser] = useState<SpotifyUser | null>(null)
  const [artists, setArtists] = useState<ArtistWithScore[]>([])
  const [score, setScore] = useState<number>(0)
  const [term, setTerm] = useState<Term>('medium_term')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Get token from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('spotify_token')
    const expiresAt = Number(localStorage.getItem('spotify_token_expires') || 0)

    if (!stored || Date.now() > expiresAt) {
      router.push('/')
      return
    }
    setToken(stored)
  }, [router])

  // Fetch data when token or term changes
  useEffect(() => {
    if (!token) return

    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        const [userData, artistData] = await Promise.all([
          fetchCurrentUser(token),
          fetchTopArtists(token, term),
        ])
        setUser(userData)
        const processed = processArtists(artistData.items)
        setArtists(processed)
        setScore(calculateUndergroundScore(artistData.items))
      } catch (err) {
        setError('Error al cargar tus datos. Intenta de nuevo.')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [token, term])

  const handleLogout = () => {
    localStorage.removeItem('spotify_token')
    localStorage.removeItem('spotify_token_expires')
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080810] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-[#9D5CFF] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#E8E8F0]">Analizando tu música...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#080810] flex items-center justify-center">
        <div className="text-center max-w-sm">
          <p className="text-[#FF5CAA] mb-4">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-[#9D5CFF] rounded-full text-white hover:bg-[#8A47F0] transition-colors"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    )
  }

  const label = getUndergroundLabel(score)
  const description = getUndergroundDescription(score)

  return (
    <div className="min-h-screen bg-[#080810] text-[#E8E8F0]">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-[#2A2A3E]">
        <span className="font-display text-xl font-bold text-[#9D5CFF]">espejo</span>
        {user && (
          <div className="flex items-center gap-3">
            {user.images?.[0] && (
              <img
                src={user.images[0].url}
                alt={user.display_name}
                className="w-8 h-8 rounded-full"
              />
            )}
            <span className="text-sm text-[#9D9DB0]">{user.display_name}</span>
            <button
              onClick={handleLogout}
              className="text-xs text-[#9D9DB0] hover:text-[#E8E8F0] transition-colors"
            >
              Salir
            </button>
          </div>
        )}
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10">
        {/* Score hero */}
        <div className="text-center mb-12">
          <div className="text-8xl font-display font-bold text-[#9D5CFF] mb-2">{score}</div>
          <div className="text-2xl font-semibold mb-1">{label}</div>
          <p className="text-[#9D9DB0]">{description}</p>
        </div>

        {/* Term selector */}
        <div className="flex justify-center gap-2 mb-10">
          {(Object.keys(TERM_LABELS) as Term[]).map((t) => (
            <button
              key={t}
              onClick={() => setTerm(t)}
              className={`px-4 py-2 rounded-full text-sm transition-colors ${
                term === t
                  ? 'bg-[#9D5CFF] text-white'
                  : 'bg-[#2A2A3E] text-[#9D9DB0] hover:text-[#E8E8F0]'
              }`}
            >
              {TERM_LABELS[t]}
            </button>
          ))}
        </div>

        {/* Top artists grid */}
        <section>
          <h2 className="text-lg font-semibold mb-4 text-[#9D9DB0] uppercase tracking-widest text-sm">
            Tus artistas
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {artists.slice(0, 20).map((artist, i) => (
              <a
                key={artist.id}
                href={artist.external_urls.spotify}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative rounded-xl overflow-hidden bg-[#2A2A3E] hover:scale-105 transition-transform"
              >
                {artist.images[0] && (
                  <img
                    src={artist.images[0].url}
                    alt={artist.name}
                    className="w-full aspect-square object-cover"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-2">
                  <p className="text-xs font-medium leading-tight truncate">{artist.name}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-[10px] text-[#9D9DB0]">#{i + 1}</span>
                    <span
                      className="text-[10px] font-bold"
                      style={{
                        color: `hsl(${260 + (artist.undergroundScore / 100) * 60}, 80%, 65%)`,
                      }}
                    >
                      {artist.undergroundScore}
                    </span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
