'use client'

import { Sun, Moon } from 'lucide-react'
import { useTheme } from '@/components/ThemeProvider'
import { createClient } from '@/lib/supabase/client'

export function ThemeToggle({ className }: { className?: string }) {
  const { isDark, toggle } = useTheme()

  async function handleToggle() {
    toggle()
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase.from('profiles').update({ dark_mode: !isDark }).eq('id', user.id)
      }
    } catch {}
  }

  return (
    <button
      onClick={handleToggle}
      title={isDark ? 'Hell-Modus' : 'Dunkel-Modus'}
      className={className}
    >
      {isDark
        ? <Sun  className="h-4 w-4" />
        : <Moon className="h-4 w-4" />}
    </button>
  )
}
