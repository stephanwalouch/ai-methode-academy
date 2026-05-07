'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

export function NavigationProgress() {
  const pathname     = usePathname()
  const searchParams = useSearchParams()
  const [width, setWidth]     = useState(0)
  const [visible, setVisible] = useState(false)
  const tickRef    = useRef<ReturnType<typeof setInterval> | null>(null)
  const startedRef = useRef(false)

  // Detect link clicks → start bar
  useEffect(() => {
    function onLinkClick(e: MouseEvent) {
      const anchor = (e.target as HTMLElement).closest('a')
      if (!anchor) return
      const href = anchor.getAttribute('href') ?? ''
      if (!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto') || href.startsWith('tel')) return
      const dest = href.split('?')[0]
      if (dest === pathname) return
      start()
    }
    document.addEventListener('click', onLinkClick)
    return () => document.removeEventListener('click', onLinkClick)
  }, [pathname])

  // Detect navigation complete → finish bar
  useEffect(() => {
    if (startedRef.current) finish()
  }, [pathname, searchParams])

  function start() {
    if (tickRef.current) clearInterval(tickRef.current)
    startedRef.current = true
    setWidth(0)
    setVisible(true)
    let w = 0
    tickRef.current = setInterval(() => {
      // accelerate at start, decelerate toward 85 %
      w += (85 - w) * 0.12
      setWidth(Math.min(w, 85))
    }, 120)
  }

  function finish() {
    startedRef.current = false
    if (tickRef.current) { clearInterval(tickRef.current); tickRef.current = null }
    setWidth(100)
    setTimeout(() => {
      setVisible(false)
      setWidth(0)
    }, 380)
  }

  if (!visible) return null

  return (
    <div
      aria-hidden
      style={{
        position:     'fixed',
        top:          0,
        left:         0,
        height:       '3px',
        width:        `${width}%`,
        background:   'linear-gradient(90deg, #b8922a 0%, #d4a843 60%, #e8c060 100%)',
        borderRadius: '0 2px 2px 0',
        boxShadow:    '0 0 10px rgba(184,146,42,0.55)',
        zIndex:       9999,
        transition:   width === 100
          ? 'width 0.22s ease-out, opacity 0.3s ease'
          : 'width 0.12s linear',
        opacity:      visible ? 1 : 0,
        pointerEvents: 'none',
      }}
    />
  )
}
