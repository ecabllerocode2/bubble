'use client'
import { SpotifyArtist } from '@/lib/spotify'

interface Props {
  discoveries: SpotifyArtist[]
  loading: boolean
}

export default function Discoveries({ discoveries, loading }: Props) {
  if (loading) {
    return (
      <section>
        <h2 className="text-sm font-semibold text-[#9D9DB0] uppercase tracking-widest mb-4">
          Descubrimientos para ti
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-xl bg-[#2A2A3E] animate-pulse aspect-square" />
          ))}
        </div>
      </section>
    )
  }

  if (!discoveries.length) return null

  return (
    <section>
      <div className="flex items-baseline gap-3 mb-4">
        <h2 className="text-sm font-semibold text-[#9D9DB0] uppercase tracking-widest">
          Descubrimientos para ti
        </h2>
        <span className="text-xs text-[#4A4A6A]">
          basados en lo que ya escuchas, fuera del radar
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {discoveries.map((artist) => {
          const hue = 260 + ((100 - artist.popularity) / 100) * 60
          return (
            <a
              key={artist.id}
              href={artist.external_urls.spotify}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative rounded-xl overflow-hidden bg-[#2A2A3E] hover:scale-105 transition-transform"
            >
              {artist.images[0] ? (
                <img
                  src={artist.images[0].url}
                  alt={artist.name}
                  className="w-full aspect-square object-cover"
                />
              ) : (
                <div className="w-full aspect-square bg-[#1a1a2e]" />
              )}
              <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-2">
                <p className="text-xs font-medium leading-tight truncate text-[#E8E8F0]">
                  {artist.name}
                </p>
                <div className="flex items-center justify-between mt-1">
                  {artist.genres[0] && (
                    <span className="text-[9px] text-[#9D9DB0] truncate max-w-[80%]">
                      {artist.genres[0]}
                    </span>
                  )}
                  <span
                    className="text-[10px] font-bold ml-auto"
                    style={{ color: `hsl(${hue}, 80%, 65%)` }}
                  >
                    {100 - artist.popularity}
                  </span>
                </div>
              </div>

              {/* "Abrir en Spotify" hint */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-xs text-white font-medium">Abrir en Spotify</span>
              </div>
            </a>
          )
        })}
      </div>
    </section>
  )
}
