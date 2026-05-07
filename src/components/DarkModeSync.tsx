'use client'

import { useEffect } from 'react'
import { useTheme } from '@/components/ThemeProvider'

export function DarkModeSync({ dark }: { dark: boolean }) {
  const { sync } = useTheme()
  // Run once on mount to sync the server-fetched preference
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { sync(dark) }, [])
  return null
}
