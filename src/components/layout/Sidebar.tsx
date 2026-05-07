'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { clsx } from 'clsx'
import {
  LayoutDashboard, PlayCircle, Settings,
  ShieldCheck, LogOut, ChevronRight, GraduationCap, TrendingUp
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { ThemeToggle } from '@/components/ThemeToggle'
import type { Profile, Branding } from '@/lib/types'

const navItems = [
  { href: '/dashboard',     label: 'Dashboard',          icon: LayoutDashboard },
  { href: '/kurse',         label: 'AI Methode Academy', icon: PlayCircle },
  { href: '/fortschritt',   label: 'Fortschritt',        icon: TrendingUp },
  { href: '/einstellungen', label: 'Einstellungen',      icon: Settings },
]

const adminItems = [
  { href: '/admin', label: 'Admin-Bereich', icon: ShieldCheck },
]

interface SidebarProps {
  profile: Profile | null
  branding: Branding | null
}

export function Sidebar({ profile, branding }: SidebarProps) {
  const pathname = usePathname()
  const router   = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className="flex h-full w-64 flex-col bg-white dark:bg-[#161616] border-r border-black/[0.07] dark:border-white/[0.07]">

      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-black/[0.07] dark:border-white/[0.07] px-5">
        {branding?.logo_url ? (
          <img src={branding.logo_url} alt="Logo" className="h-8 w-auto object-contain" />
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: '#b8922a' }}>
            <GraduationCap className="h-5 w-5 text-white" />
          </div>
        )}
        <span className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate tracking-tight">
          {branding?.platform_name ?? 'AI Methode'}
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {navItems.map(item => {
          const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                active
                  ? 'bg-brand-50 dark:bg-[#2a2010] text-brand-600 dark:text-[#d4a843]'
                  : 'text-gray-700 dark:text-gray-400 hover:bg-[#f0ede8] dark:hover:bg-[#252525] hover:text-gray-900 dark:hover:text-gray-100'
              )}
            >
              <item.icon className={clsx('h-4 w-4 flex-shrink-0',
                active
                  ? 'text-brand-500 dark:text-[#d4a843]'
                  : 'text-gray-400 dark:text-gray-600 group-hover:text-gray-600 dark:group-hover:text-gray-400'
              )} />
              {item.label}
              {active && <ChevronRight className="ml-auto h-3 w-3 text-brand-400 dark:text-[#d4a843]" />}
            </Link>
          )
        })}

        {profile?.role === 'admin' && (
          <>
            <div className="my-3 border-t border-black/[0.06] dark:border-white/[0.06]" />
            <p className="px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-600">
              Administration
            </p>
            {adminItems.map(item => {
              const active = pathname.startsWith(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={clsx(
                    'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    active
                      ? 'bg-brand-50 dark:bg-[#2a2010] text-brand-600 dark:text-[#d4a843]'
                      : 'text-gray-700 dark:text-gray-400 hover:bg-[#f0ede8] dark:hover:bg-[#252525] hover:text-gray-900 dark:hover:text-gray-100'
                  )}
                >
                  <item.icon className={clsx('h-4 w-4', active ? 'text-brand-500 dark:text-[#d4a843]' : 'text-gray-400 dark:text-gray-600')} />
                  {item.label}
                </Link>
              )
            })}
          </>
        )}
      </nav>

      {/* Nutzer-Footer */}
      <div className="border-t border-black/[0.06] dark:border-white/[0.06] p-3">
        <div className="flex items-center gap-3 rounded-lg p-2">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold text-white" style={{ background: '#b8922a' }}>
            {profile?.full_name?.[0]?.toUpperCase() ?? profile?.email?.[0]?.toUpperCase() ?? '?'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-gray-900 dark:text-gray-100">
              {profile?.full_name || 'Kein Name'}
            </p>
            <p className="truncate text-xs text-gray-400 dark:text-gray-600">{profile?.email}</p>
          </div>
          <ThemeToggle className="text-gray-400 dark:text-gray-600 hover:text-gray-600 dark:hover:text-gray-400 transition-colors" />
          <button
            onClick={handleLogout}
            className="text-gray-400 dark:text-gray-600 hover:text-red-500 transition-colors"
            title="Abmelden"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  )
}
