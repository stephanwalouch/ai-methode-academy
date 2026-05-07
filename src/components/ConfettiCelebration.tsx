'use client'

import { useEffect } from 'react'
import confetti from 'canvas-confetti'

export function ConfettiCelebration() {
  useEffect(() => {
    const colors = ['#b8922a', '#d4a843', '#f5d78a', '#e8c060', '#ffffff', '#fdf8ee']

    // Großer erster Burst
    confetti({
      particleCount: 180,
      spread: 120,
      origin:  { y: 0.55 },
      colors,
      scalar: 1.1,
    })

    // Anschließend 4 Sekunden Seitenkanonen
    const end = Date.now() + 4000

    const frame = () => {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 60,
        origin: { x: 0, y: 0.7 },
        colors,
      })
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 60,
        origin: { x: 1, y: 0.7 },
        colors,
      })
      if (Date.now() < end) requestAnimationFrame(frame)
    }

    // Kleinen Delay damit der erste Burst schon sichtbar ist
    const t = setTimeout(() => requestAnimationFrame(frame), 400)
    return () => clearTimeout(t)
  }, [])

  return null
}
