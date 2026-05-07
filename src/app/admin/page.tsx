import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Users, BookOpen, Link2, TrendingUp, Clock, Award } from 'lucide-react'

export const dynamic = 'force-dynamic'

function fmtDate(d: string | null) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('de-DE', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default async function AdminPage() {
  const supabase = await createClient()

  const [
    { data: profiles },
    { data: courses },
    { data: allProgress },
    { count: inviteCount },
  ] = await Promise.all([
    supabase.from('profiles').select('id, email, full_name, role, created_at, last_seen_at').order('created_at', { ascending: false }),
    supabase.from('courses').select('id, modules(id, lessons(id))'),
    supabase.from('lesson_progress').select('user_id, lesson_id'),
    supabase.from('invite_tokens').select('*', { count: 'exact', head: true }).gt('use_count', 0),
  ])

  const students = profiles?.filter(p => p.role !== 'admin') ?? []

  // Gesamtanzahl Lektionen
  const totalLessons = courses?.reduce((acc, c) => {
    return acc + (c.modules as { lessons: { id: string }[] }[]).reduce((a, m) => a + m.lessons.length, 0)
  }, 0) ?? 0

  // Durchschnittlicher Fortschritt aller User
  const progressByUser = new Map<string, number>()
  allProgress?.forEach(p => {
    progressByUser.set(p.user_id, (progressByUser.get(p.user_id) ?? 0) + 1)
  })
  const avgProgress = students.length > 0 && totalLessons > 0
    ? Math.round(
        Array.from(progressByUser.values()).reduce((s, v) => s + v, 0)
        / students.length / totalLessons * 100
      )
    : 0

  // Aktivste User (meiste abgeschlossene Lektionen)
  const topUsers = students
    .map(u => ({ ...u, done: progressByUser.get(u.id) ?? 0 }))
    .sort((a, b) => b.done - a.done)
    .slice(0, 5)

  // Zuletzt registrierte User
  const recentUsers = [...students].slice(0, 5)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin-Übersicht</h1>
        <p className="mt-1 text-sm text-gray-500">Deine Kursplattform auf einen Blick</p>
      </div>

      {/* Stat-Kacheln */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Mitglieder',       value: students.length, icon: Users,     href: '/admin/nutzer' },
          { label: 'Ø Fortschritt',    value: `${avgProgress}%`, icon: TrendingUp, href: null },
          { label: 'Kurse',            value: courses?.length ?? 0, icon: BookOpen, href: '/admin/kurse' },
          { label: 'Einladungen',      value: inviteCount ?? 0, icon: Link2,    href: '/admin/einladungen' },
        ].map(stat => (
          <div key={stat.label} className="card p-4">
            {stat.href ? (
              <Link href={stat.href} className="block group">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: '#fdf8ee' }}>
                  <stat.icon className="h-4 w-4" style={{ color: '#b8922a' }} />
                </div>
                <p className="mt-3 text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-500 group-hover:text-[#b8922a] transition-colors">{stat.label}</p>
              </Link>
            ) : (
              <>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: '#fdf8ee' }}>
                  <stat.icon className="h-4 w-4" style={{ color: '#b8922a' }} />
                </div>
                <p className="mt-3 text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.label}</p>
              </>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

        {/* Aktivste User */}
        <div className="card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
              <Award className="h-4 w-4" style={{ color: '#b8922a' }} />
              Aktivste Mitglieder
            </h2>
            <Link href="/admin/nutzer" className="text-xs hover:underline" style={{ color: '#b8922a' }}>Alle →</Link>
          </div>
          <div className="space-y-2">
            {topUsers.length === 0 && <p className="text-xs text-gray-400">Noch keine Aktivität.</p>}
            {topUsers.map((u, i) => {
              const pct = totalLessons > 0 ? Math.round((u.done / totalLessons) * 100) : 0
              return (
                <div key={u.id} className="flex items-center gap-3">
                  <span className="w-4 flex-shrink-0 text-xs font-bold text-gray-300">{i + 1}</span>
                  <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-white" style={{ background: '#b8922a' }}>
                    {(u.full_name ?? u.email)[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-xs font-medium text-gray-900">{u.full_name ?? u.email}</p>
                    <div className="mt-0.5 flex items-center gap-2">
                      <div className="h-1 flex-1 overflow-hidden rounded-full bg-gray-100">
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: '#b8922a' }} />
                      </div>
                      <span className="text-[10px] font-medium text-gray-400">{pct}%</span>
                    </div>
                  </div>
                  <span className="flex-shrink-0 text-xs text-gray-400">{u.done} ✓</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Zuletzt registriert */}
        <div className="card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
              <Clock className="h-4 w-4" style={{ color: '#b8922a' }} />
              Zuletzt registriert
            </h2>
            <Link href="/admin/nutzer" className="text-xs hover:underline" style={{ color: '#b8922a' }}>Alle →</Link>
          </div>
          <div className="space-y-2">
            {recentUsers.length === 0 && <p className="text-xs text-gray-400">Noch keine Mitglieder.</p>}
            {recentUsers.map(u => (
              <div key={u.id} className="flex items-center gap-3 py-1">
                <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-white" style={{ background: '#b8922a' }}>
                  {(u.full_name ?? u.email)[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-xs font-medium text-gray-900">{u.full_name ?? u.email}</p>
                  <p className="text-[10px] text-gray-400">{u.email}</p>
                </div>
                <span className="flex-shrink-0 text-[10px] text-gray-400">{fmtDate(u.created_at)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Schnellzugriff */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[
          { href: '/admin/kurse',        icon: BookOpen,  title: 'Kurse verwalten',     desc: 'Inhalte erstellen und bearbeiten' },
          { href: '/admin/nutzer',       icon: Users,     title: 'Nutzer verwalten',     desc: 'User-Tabelle und Fortschritte' },
          { href: '/admin/einladungen',  icon: Link2,     title: 'Einladen',             desc: 'Neue Mitglieder einladen' },
        ].map(item => (
          <Link key={item.href} href={item.href} className="card group p-5 transition-shadow hover:shadow-md">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: '#fdf8ee' }}>
              <item.icon className="h-4 w-4" style={{ color: '#b8922a' }} />
            </div>
            <p className="mt-3 font-semibold text-gray-900 group-hover:text-[#b8922a] transition-colors">{item.title}</p>
            <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
