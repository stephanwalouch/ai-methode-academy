'use client'

import { createContext, useCallback, useContext, useEffect, useState } from 'react'

interface ThemeCtx {
  isDark: boolean
  toggle: () => void
  sync:   (dark: boolean) => void
}

export const ThemeContext = createContext<ThemeCtx>({
  isDark: false,
  toggle: () => {},
  sync:   () => {},
})

export function useTheme() {
  return useContext(ThemeContext)
}

function applyDark(dark: boolean) {
  if (dark) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
  try { localStorage.setItem('theme', dark ? 'dark' : 'light') } catch {}
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Start with false (light). The FOUC script and/or DarkModeSync set the real value.
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    // Read from DOM – don't re-apply anything.
    // The FOUC <head> script already applied the correct class from localStorage.
    // DarkModeSync (child, runs before this) already applied the DB preference.
    const dark = document.documentElement.classList.contains('dark')
    setIsDark(dark)
  }, [])

  const toggle = useCallback(() => {
    setIsDark(prev => {
      applyDark(!prev)
      return !prev
    })
  }, [])

  // Called by DarkModeSync – always wins over FOUC script state
  const sync = useCallback((dark: boolean) => {
    setIsDark(dark)
    applyDark(dark)
  }, [])

  return (
    <ThemeContext.Provider value={{ isDark, toggle, sync }}>
      {children}
    </ThemeContext.Provider>
  )
}
