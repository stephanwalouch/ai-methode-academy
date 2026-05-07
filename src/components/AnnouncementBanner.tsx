'use client'

import { useState, useEffect } from 'react'
import { Megaphone, X } from 'lucide-react'

interface Announcement {
  id: string
  title: string
  body: string
}

export function AnnouncementBanner({ announcement }: { announcement: Announcement }) {
  const [visible, setVisible] = useState(false)

  // Check localStorage on mount – if user already dismissed this ID, stay hidden
  useEffect(() => {
    const dismissed = localStorage.getItem(`announcement-dismissed-${announcement.id}`)
    if (!dismissed) setVisible(true)
  }, [announcement.id])

  function dismiss() {
    localStorage.setItem(`announcement-dismissed-${announcement.id}`, '1')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="relative overflow-hidden rounded-[18px] border border-amber-300/60 dark:border-amber-700/40"
      style={{ background: 'linear-gradient(135deg, #fdf8ee 0%, #fef3d0 60%, #fde9a0 100%)' }}>

      {/* Subtle decorative circle */}
      <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-amber-200/30" />

      <div className="relative flex items-start gap-3 px-5 py-4">

        {/* Icon */}
        <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg"
          style={{ background: '#b8922a' }}>
          <Megaphone className="h-4 w-4 text-white" />
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold leading-snug" style={{ color: '#7a5c14' }}>
            {announcement.title}
          </p>
          <p className="mt-0.5 text-sm leading-relaxed" style={{ color: '#9a7320' }}>
            {announcement.body}
          </p>
        </div>

        {/* Dismiss button */}
        <button
          onClick={dismiss}
          aria-label="Ankündigung schließen"
          className="mt-0.5 flex-shrink-0 rounded-lg p-1 transition-colors hover:bg-amber-200/60"
          style={{ color: '#b8922a' }}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
