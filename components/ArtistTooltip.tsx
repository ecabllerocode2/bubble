'use client'
import { ArtistWithScore } from '@/lib/score'

interface Props {
  artist: ArtistWithScore
  onClose: () => void
}

export default function ArtistTooltip({ artist, onClose }: Props) {
  const hue = 260 + (artist.undergroundScore / 100) * 60
  const popularityLabel =
    artist.popularity >= 80 ? 'Muy popular' :
    artist.popularity >= 60 ? 'Conocido' :
    artist.popularity >= 40 ? 'Medio' :
    artist.popularity >= 20 ? 'Nicho' : 'Muy underground'

  return (
    <div className="flex items-start gap-4 bg-[#12121e] border border-[#2A2A3E] rounded-2xl p-4">
      {artist.images[0] && (
        <img
          src={artist.images[0].url}
          alt={artist.name}
          className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
        />
      )}

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <a
              href={artist.external_urls.spotify}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-[#E8E8F0] hover:text-[#9D5CFF] transition-colors leading-tight block truncate"
            >
              {artist.name}
            </a>
            {artist.genres.length > 0 && (
              <p className="text-xs text-[#9D9DB0] mt-0.5 truncate">
                {artist.genres.slice(0, 2).join(' · ')}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-[#4A4A6A] hover:text-[#E8E8F0] transition-colors flex-shrink-0 text-lg leading-none"
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>

        <div className="flex items-center gap-4 mt-3">
          {/* Underground score */}
          <div className="flex flex-col items-center">
            <span
              className="text-2xl font-display font-bold leading-none"
              style={{ color: `hsl(${hue}, 80%, 65%)` }}
            >
              {artist.undergroundScore}
            </span>
            <span className="text-[10px] text-[#4A4A6A] mt-0.5">underground</span>
          </div>

          <div className="w-px h-8 bg-[#2A2A3E]" />

          {/* Popularity */}
          <div className="flex flex-col items-center">
            <span className="text-2xl font-display font-bold leading-none text-[#9D9DB0]">
              {artist.popularity}
            </span>
            <span className="text-[10px] text-[#4A4A6A] mt-0.5">popularidad</span>
          </div>

          <div className="w-px h-8 bg-[#2A2A3E]" />

          {/* Listen rank */}
          <div className="flex flex-col items-center">
            <span className="text-2xl font-display font-bold leading-none text-[#9D9DB0]">
              #{51 - artist.listenWeight}
            </span>
            <span className="text-[10px] text-[#4A4A6A] mt-0.5">en tu top</span>
          </div>
        </div>

        {/* Popularity bar */}
        <div className="mt-3">
          <div className="flex justify-between text-[10px] text-[#4A4A6A] mb-1">
            <span>underground</span>
            <span>{popularityLabel}</span>
            <span>mainstream</span>
          </div>
          <div className="h-1.5 bg-[#2A2A3E] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${artist.popularity}%`,
                background: `hsl(${hue}, 80%, 60%)`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
