'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { Sidebar } from './Sidebar'
import type { Profile, Branding } from '@/lib/types'

interface Props {
  profile: Profile | null
  branding: Branding | null
}

export function MobileSidebar({ profile, branding }: Props) {
  const [open, setOpen]       = useState(false)
  const [visible, setVisible] = useState(false) // controls DOM presence for unmount animation
  const pathname              = usePathname()
  const prevPathname          = useRef(pathname)

  // Close on route change
  useEffect(() => {
    if (pathname !== prevPathname.current) {
      prevPathname.current = pathname
      close()
    }
  }, [pathname])

  // Body scroll lock
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  // Keyboard: close on Escape
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') close() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open])

  function openSidebar() {
    setVisible(true)
    // tiny delay so the element is in DOM before the CSS transition fires
    requestAnimationFrame(() => requestAnimationFrame(() => setOpen(true)))
  }

  function close() {
    setOpen(false)
    // keep in DOM until slide-out finishes (300 ms)
    setTimeout(() => setVisible(false), 300)
  }

  return (
    <>
      {/* Hamburger button – only visible on mobile */}
      <button
        className="lg:hidden fixed top-3 left-3 z-50 rounded-xl p-2 shadow-sm transition-colors
          bg-white dark:bg-[#1c1c1c]
          ring-1 ring-black/[0.08] dark:ring-white/[0.10]
          text-gray-600 dark:text-gray-400
          hover:bg-gray-50 dark:hover:bg-[#252525]"
        onClick={openSidebar}
        aria-label="Menü öffnen"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Overlay + Sidebar drawer */}
      {visible && (
        <div className="fixed inset-0 z-40 lg:hidden">

          {/* Backdrop */}
          <div
            className="absolute inset-0 transition-opacity duration-300"
            style={{
              background: 'rgba(0,0,0,0.5)',
              opacity: open ? 1 : 0,
            }}
            onClick={close}
            aria-hidden="true"
          />

          {/* Sidebar drawer */}
          <div
            className="absolute inset-y-0 left-0 w-64 transition-transform duration-300 ease-in-out shadow-2xl"
            style={{ transform: open ? 'translateX(0)' : 'translateX(-100%)' }}
          >
            {/* Close button inside drawer */}
            <button
              className="absolute top-3 right-3 z-10 rounded-lg p-1.5
                text-gray-400 dark:text-gray-500
                hover:bg-gray-100 dark:hover:bg-[#2a2a2a]
                hover:text-gray-600 dark:hover:text-gray-300
                transition-colors"
              onClick={close}
              aria-label="Menü schließen"
            >
              <X className="h-4 w-4" />
            </button>

            <Sidebar profile={profile} branding={branding} />
          </div>
        </div>
      )}
    </>
  )
}
