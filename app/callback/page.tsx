'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { exchangeCodeForToken } from '@/lib/spotify'

export default function Callback() {
  const router = useRouter()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const code = params.get('code')
    const error = params.get('error')

    if (error) {
      router.push('/?error=' + encodeURIComponent(error))
      return
    }

    if (!code) {
      router.push('/?error=no_code')
      return
    }

    exchangeCodeForToken(code)
      .then(({ access_token, expires_in }) => {
        const expiresAt = Date.now() + expires_in * 1000
        localStorage.setItem('spotify_token', access_token)
        localStorage.setItem('spotify_token_expires', String(expiresAt))
        router.push('/dashboard')
      })
      .catch((err) => {
        console.error(err)
        router.push('/?error=token_exchange_failed')
      })
  }, [router])

  return (
    <div className="min-h-screen bg-[#080810] flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-2 border-[#9D5CFF] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-[#E8E8F0] text-lg">Conectando con Spotify...</p>
      </div>
    </div>
  )
}
