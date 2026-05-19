'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Callback() {
  const router = useRouter()

  useEffect(() => {
    const hash = window.location.hash.substring(1)
    const params = new URLSearchParams(hash)
    const token = params.get('access_token')
    const error = params.get('error')

    if (error) {
      router.push('/?error=' + encodeURIComponent(error))
      return
    }

    if (token) {
      // Store token with expiry (Spotify tokens last 1 hour)
      const expiresAt = Date.now() + 3600 * 1000
      localStorage.setItem('spotify_token', token)
      localStorage.setItem('spotify_token_expires', String(expiresAt))
      router.push('/dashboard')
    } else {
      router.push('/?error=no_token')
    }
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
