'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { clsx } from 'clsx'
import { LayoutDashboard, BookOpen, Link2, Palette, ArrowLeft, GraduationCap, LogOut, Users, Megaphone, BarChart3 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { ThemeToggle } from '@/components/ThemeToggle'

const navItems = [
  { href: '/admin',                   label: 'Übersicht',        icon: LayoutDashboard, exact: true },
  { href: '/admin/kurse',             label: 'Kurse verwalten',  icon: BookOpen },
  { href: '/admin/nutzer',            label: 'Nutzer',           icon: Users },
  { href: '/admin/ankuendigungen',    label: 'Ankündigungen',    icon: Megaphone },
  { href: '/admin/analytics',         label: 'Analytics',        icon: BarChart3 },
  { href: '/admin/einladungen',       label: 'Einladungslinks',  icon: Link2 },
  { href: '/admin/branding',          label: 'Branding',         icon: Palette },
]

export function AdminNav({ branding }: { branding: { platform_name: string; logo_url: string | null } | null }) {
  const pathname = usePathname()
  const router   = useRouter()

  async function handleLogout() {
    await createClient().auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className="flex h-full w-60 flex-col bg-white dark:bg-[#161616] border-r border-black/[0.07] dark:border-white/[0.07]">

      <div className="flex h-16 items-center gap-3 border-b border-black/[0.07] dark:border-white/[0.07] px-4">
        {branding?.logo_url
          ? <img src={branding.logo_url} alt="" className="h-7 w-auto object-contain" />
          : <div className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ background: '#b8922a' }}><GraduationCap className="h-4 w-4 text-white" /></div>
        }
        <div className="min-w-0">
          <p className="truncate text-xs font-bold text-gray-900 dark:text-gray-100 tracking-tight">
            {branding?.platform_name ?? 'AI Methode'}
          </p>
          <p className="text-xs font-medium" style={{ color: '#b8922a' }}>Admin</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(item => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                active
                  ? 'bg-brand-50 dark:bg-[#2a2010] text-brand-600 dark:text-[#d4a843]'
                  : 'text-gray-700 dark:text-gray-400 hover:bg-[#f0ede8] dark:hover:bg-[#252525] hover:text-gray-900 dark:hover:text-gray-100'
              )}
            >
              <item.icon className={clsx('h-4 w-4', active ? 'text-brand-600 dark:text-[#d4a843]' : 'text-gray-400 dark:text-gray-600')} />
              {item.label}
            </Link>
          )
        })}

        <div className="pt-3 border-t border-black/[0.06] dark:border-white/[0.06] mt-3">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-600 dark:text-gray-500 hover:bg-[#f0ede8] dark:hover:bg-[#252525] hover:text-gray-800 dark:hover:text-gray-300 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Zur Plattform
          </Link>
        </div>
      </nav>

      <div className="border-t border-black/[0.06] dark:border-white/[0.06] p-3 flex items-center gap-2">
        <button
          onClick={handleLogout}
          className="flex flex-1 items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-600 dark:text-gray-500 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Abmelden
        </button>
        <ThemeToggle className="rounded-lg p-2 text-gray-400 dark:text-gray-600 hover:text-gray-600 dark:hover:text-gray-400 transition-colors" />
      </div>
    </aside>
  )
}
