'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import { ArtistWithScore } from '@/lib/score'

interface BubbleData {
  artist: ArtistWithScore
  x: number
  y: number
  radius: number
  hue: number
}

interface Props {
  artists: ArtistWithScore[]
  onArtistClick: (artist: ArtistWithScore) => void
  selectedId?: string
}

// Deterministic pseudo-random from string — stable across renders
function seededRandom(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i)
    hash |= 0
  }
  return (Math.abs(hash) % 1000) / 1000
}

export default function BubbleViz({ artists, onArtistClick, selectedId }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const bubblesRef = useRef<BubbleData[]>([])
  const animFrameRef = useRef<number>(0)
  const [hovered, setHovered] = useState<string | null>(null)

  const buildBubbles = useCallback((w: number, h: number): BubbleData[] => {
    return artists.map((artist) => {
      // X: underground score → left is mainstream, right is underground
      const xNorm = artist.undergroundScore / 100
      const x = w * 0.08 + xNorm * w * 0.84

      // Y: stable via seeded random, with vertical bands by listen weight
      const band = Math.floor((artist.listenWeight / 50) * 4) // 0-3 bands
      const bandH = h * 0.65
      const bandY = h * 0.17 + band * (bandH / 4)
      const jitter = seededRandom(artist.id + 'y') * (bandH / 4)
      const y = bandY + jitter

      // Radius: bigger = more listened
      const radius = 5 + (artist.listenWeight / 50) * 22

      // Hue: purple (260) to pink (320) based on underground score
      const hue = 260 + (artist.undergroundScore / 100) * 60

      return { artist, x, y, radius, hue }
    })
  }, [artists])

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const { width: w, height: h } = canvas

    // Background
    ctx.fillStyle = '#080810'
    ctx.fillRect(0, 0, w, h)

    // Centre divider line (mainstream | underground)
    ctx.save()
    ctx.strokeStyle = '#2A2A3E'
    ctx.lineWidth = 1
    ctx.setLineDash([5, 6])
    ctx.beginPath()
    ctx.moveTo(w / 2, h * 0.05)
    ctx.lineTo(w / 2, h * 0.95)
    ctx.stroke()
    ctx.restore()

    // Axis labels
    ctx.font = '11px Inter, sans-serif'
    ctx.fillStyle = '#4A4A6A'
    ctx.textAlign = 'left'
    ctx.fillText('mainstream', 10, h - 8)
    ctx.textAlign = 'right'
    ctx.fillText('underground', w - 10, h - 8)

    // Bubbles — draw non-selected first, then selected on top
    const sorted = [...bubblesRef.current].sort((a, b) => {
      if (a.artist.id === selectedId) return 1
      if (b.artist.id === selectedId) return -1
      return a.radius - b.radius
    })

    for (const b of sorted) {
      const isSelected = b.artist.id === selectedId
      const isHovered = b.artist.id === hovered
      const alpha = selectedId && !isSelected ? 0.35 : 0.85
      const scale = isSelected ? 1.25 : isHovered ? 1.1 : 1
      const r = b.radius * scale

      ctx.save()

      // Glow
      if (isSelected || isHovered) {
        ctx.shadowBlur = isSelected ? 28 : 18
        ctx.shadowColor = `hsl(${b.hue}, 85%, 65%)`
      }

      // Circle
      ctx.beginPath()
      ctx.arc(b.x, b.y, r, 0, Math.PI * 2)
      ctx.fillStyle = `hsla(${b.hue}, 80%, 62%, ${alpha})`
      ctx.fill()

      // Border on selected
      if (isSelected) {
        ctx.strokeStyle = `hsl(${b.hue}, 90%, 80%)`
        ctx.lineWidth = 2
        ctx.stroke()
      }

      ctx.restore()

      // Label for top artists or selected
      if (b.artist.listenWeight >= 44 || isSelected) {
        ctx.save()
        ctx.font = isSelected ? 'bold 11px Inter, sans-serif' : '10px Inter, sans-serif'
        ctx.fillStyle = isSelected ? '#E8E8F0' : '#9D9DB0'
        ctx.textAlign = 'center'
        const labelY = b.y - r - 5
        ctx.fillText(
          b.artist.name.length > 14 ? b.artist.name.slice(0, 12) + '…' : b.artist.name,
          b.x,
          labelY
        )
        ctx.restore()
      }
    }
  }, [hovered, selectedId])

  // Build bubble positions whenever artists change
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !artists.length) return
    bubblesRef.current = buildBubbles(canvas.width, canvas.height)
    draw()
  }, [artists, buildBubbles, draw])

  // Redraw when hover/selection changes
  useEffect(() => {
    draw()
  }, [draw])

  // Handle resize
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const observer = new ResizeObserver(() => {
      const parent = canvas.parentElement
      if (!parent) return
      canvas.width = parent.clientWidth
      canvas.height = Math.min(480, Math.max(320, parent.clientWidth * 0.55))
      bubblesRef.current = buildBubbles(canvas.width, canvas.height)
      draw()
    })
    observer.observe(canvas.parentElement!)
    // Initial sizing
    const parent = canvas.parentElement
    if (parent) {
      canvas.width = parent.clientWidth
      canvas.height = Math.min(480, Math.max(320, parent.clientWidth * 0.55))
    }
    return () => observer.disconnect()
  }, [buildBubbles, draw])

  const getBubbleAt = (clientX: number, clientY: number): BubbleData | null => {
    const canvas = canvasRef.current
    if (!canvas) return null
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    const x = (clientX - rect.left) * scaleX
    const y = (clientY - rect.top) * scaleY

    // Check in reverse order (topmost drawn last)
    for (const b of [...bubblesRef.current].reverse()) {
      const dist = Math.sqrt((x - b.x) ** 2 + (y - b.y) ** 2)
      if (dist <= b.radius * 1.3) return b
    }
    return null
  }

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const b = getBubbleAt(e.clientX, e.clientY)
    if (b) onArtistClick(b.artist)
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const b = getBubbleAt(e.clientX, e.clientY)
    const id = b?.artist.id ?? null
    if (id !== hovered) {
      setHovered(id)
      if (canvasRef.current) {
        canvasRef.current.style.cursor = id ? 'pointer' : 'default'
      }
    }
  }

  const handleMouseLeave = () => setHovered(null)

  return (
    <div className="w-full">
      <canvas
        ref={canvasRef}
        className="w-full rounded-2xl"
        onClick={handleClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      />
    </div>
  )
}
