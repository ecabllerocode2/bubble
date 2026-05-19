'use client'
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getAuthUrl } from '@/lib/spotify'
import { Suspense } from 'react'

function LandingContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [authError, setAuthError] = useState<string | null>(null)

  useEffect(() => {
    // Check if already logged in
    const token = localStorage.getItem('spotify_token')
    const expiresAt = Number(localStorage.getItem('spotify_token_expires') || 0)
    if (token && Date.now() < expiresAt) {
      router.push('/dashboard')
    }

    const err = searchParams.get('error')
    if (err) setAuthError('Hubo un problema con Spotify. Intenta de nuevo.')
  }, [router, searchParams])

  const handleLogin = () => {
    window.location.href = getAuthUrl()
  }

  return (
    <div className="min-h-screen bg-[#080810] text-[#E8E8F0] flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4">
        <span className="font-display text-xl font-bold text-[#9D5CFF]">espejo</span>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <div className="max-w-2xl">
          {/* Decorative orbs */}
          <div className="relative mb-12 h-32 flex items-center justify-center">
            <div className="absolute w-24 h-24 rounded-full bg-[#9D5CFF]/20 blur-2xl" />
            <div className="absolute w-16 h-16 rounded-full bg-[#FF5CAA]/20 blur-xl left-1/3" />
            <div className="absolute w-20 h-20 rounded-full bg-[#9D5CFF]/30 blur-xl right-1/3" />
            <div className="relative flex gap-3 items-end">
              {[40, 28, 56, 20, 44].map((size, i) => (
                <div
                  key={i}
                  className="rounded-full opacity-80"
                  style={{
                    width: size,
                    height: size,
                    background: `hsl(${260 + i * 15}, 80%, 65%)`,
                    boxShadow: `0 0 ${size}px hsl(${260 + i * 15}, 80%, 65%, 0.4)`,
                  }}
                />
              ))}
            </div>
          </div>

          <h1 className="font-display text-5xl sm:text-6xl font-bold leading-tight mb-4">
            Descubre qué tan{' '}
            <span className="text-[#9D5CFF]">dentro o fuera</span>{' '}
            de la burbuja estás
          </h1>

          <p className="text-xl text-[#9D9DB0] mb-2 max-w-lg mx-auto">
            Tu score underground calculado a partir de tu historial real en Spotify.
          </p>
          <p className="text-sm text-[#4A4A6A] mb-10">
            No lo que Spotify quiere que escuches — lo que realmente eres.
          </p>

          {authError && (
            <p className="text-[#FF5CAA] text-sm mb-4">{authError}</p>
          )}

          <button
            onClick={handleLogin}
            className="group inline-flex items-center gap-3 px-8 py-4 bg-[#9D5CFF] hover:bg-[#8A47F0] rounded-full text-white font-semibold text-lg transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(157,92,255,0.4)]"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
            </svg>
            Conecta Spotify — es gratis
          </button>

          <p className="text-xs text-[#4A4A6A] mt-4">
            Solo lectura. No guardamos tu contraseña ni modificamos nada.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-6 text-[#4A4A6A] text-xs">
        espejo — tu identidad musical
      </footer>
    </div>
  )
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#080810]" />}>
      <LandingContent />
    </Suspense>
  )
}

