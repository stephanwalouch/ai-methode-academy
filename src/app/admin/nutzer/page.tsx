import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/server'
import { Users, Mail, TrendingUp, CheckCircle2, Activity, FileText } from 'lucide-react'
import Link from 'next/link'
import { BroadcastForm } from './BroadcastForm'
import { UserActions } from './UserActions'

function fmtDate(d: string | null) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('de-DE', { day: '2-digit', month: 'short', year: 'numeric' })
}

function fmtDateTime(d: string | null) {
  if (!d) return '—'
  return new Date(d).toLocaleString('de-DE', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}

export default async function NutzerPage() {
  const supabase      = await createClient()
  const adminSupabase = await createAdminClient()

  const [{ data: profiles }, { data: courses }, { data: allProgress }, { data: authUsers }] = await Promise.all([
    supabase.from('profiles').select('*').order('created_at', { ascending: false }),
    supabase.from('courses').select('id, modules(id, lessons(id))'),
    supabase.from('lesson_progress').select('user_id, lesson_id'),
    adminSupabase.auth.admin.listUsers(),
  ])

  // Gesamtlektionen
  const totalLessons = courses?.reduce((acc, c) =>
    acc + (c.modules as { lessons: { id: string }[] }[]).reduce((a, m) => a + m.lessons.length, 0), 0) ?? 0

  // Fortschritt pro User
  const progressByUser = new Map<string, number>()
  allProgress?.forEach(p => progressByUser.set(p.user_id, (progressByUser.get(p.user_id) ?? 0) + 1))

  // last_sign_in aus Auth-Users
  const authMap = new Map(authUsers?.users?.map(u => [u.id, u.last_sign_in_at ?? null]) ?? [])

  const students = (profiles ?? []).filter(p => p.role !== 'admin')

  // Analytics
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const activeThisWeek = students.filter(u => u.last_seen_at && u.last_seen_at > sevenDaysAgo).length
  const avgProgress = students.length > 0 && totalLessons > 0
    ? Math.round(
        students.reduce((s, u) => s + (progressByUser.get(u.id) ?? 0), 0)
        / students.length / totalLessons * 100
      )
    : 0
  const completed100 = students.filter(u => {
    const done = progressByUser.get(u.id) ?? 0
    return totalLessons > 0 && done >= totalLessons
  }).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nutzer-Verwaltung</h1>
          <p className="mt-1 text-sm text-gray-500">{students.length} Mitglieder</p>
        </div>
        <div className="flex items-center gap-2">
          <BroadcastForm userCount={students.length} />
          <Link href="/admin/einladungen" className="btn-primary">
            <Mail className="h-4 w-4" />
            Einladen
          </Link>
        </div>
      </div>

      {/* Analytics-Kacheln */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Mitglieder', value: students.length, icon: Users, sub: 'gesamt' },
          { label: 'Aktiv', value: activeThisWeek, icon: Activity, sub: 'letzte 7 Tage' },
          { label: 'Ø Fortschritt', value: `${avgProgress}%`, icon: TrendingUp, sub: 'aller Mitglieder' },
          { label: 'Abgeschlossen', value: completed100, icon: CheckCircle2, sub: '100 % des Kurses' },
        ].map(stat => (
          <div key={stat.label} className="card p-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl" style={{ background: '#fdf8ee' }}>
              <stat.icon className="h-4 w-4" style={{ color: '#b8922a' }} />
            </div>
            <p className="mt-3 text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-xs font-medium text-gray-700">{stat.label}</p>
            <p className="text-[11px] text-gray-400">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Tabelle */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-left">
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-400">Mitglied</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-400">Fortschritt</th>
                <th className="hidden px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-400 sm:table-cell">Videos</th>
                <th className="hidden px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-400 md:table-cell">Registriert</th>
                <th className="hidden px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-400 lg:table-cell">Zuletzt aktiv</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-400">Status</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-400">Aktionen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {students.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-sm text-gray-400">
                    <Users className="mx-auto mb-2 h-8 w-8 text-gray-200" />
                    Noch keine Mitglieder registriert.
                  </td>
                </tr>
              )}
              {students.map(user => {
                const done       = progressByUser.get(user.id) ?? 0
                const pct        = totalLessons > 0 ? Math.round((done / totalLessons) * 100) : 0
                const lastSeen   = user.last_seen_at ?? authMap.get(user.id) ?? null
                const isActive   = lastSeen && (Date.now() - new Date(lastSeen).getTime()) < 7 * 24 * 60 * 60 * 1000
                const isBanned   = user.is_banned === true

                return (
                  <tr key={user.id} className={`transition-colors ${isBanned ? 'bg-red-50/40 hover:bg-red-50/60' : 'hover:bg-gray-50'}`}>
                    {/* Name + E-Mail */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-white`}
                          style={{ background: isBanned ? '#ef4444' : '#b8922a' }}>
                          {(user.full_name ?? user.email)[0]?.toUpperCase() ?? '?'}
                        </div>
                        <div className="min-w-0">
                          <p className={`truncate font-medium ${isBanned ? 'text-red-700 line-through' : 'text-gray-900'}`}>{user.full_name || '—'}</p>
                          <p className="truncate text-xs text-gray-400">{user.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Fortschritt */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 overflow-hidden rounded-full bg-gray-100">
                          <div className="h-full rounded-full" style={{ width: `${pct}%`, background: '#b8922a' }} />
                        </div>
                        <span className="text-xs font-semibold" style={{ color: pct > 0 ? '#b8922a' : '#9ca3af' }}>{pct}%</span>
                      </div>
                    </td>

                    {/* Videos */}
                    <td className="hidden px-4 py-3 sm:table-cell">
                      <span className="text-xs text-gray-600">{done} / {totalLessons}</span>
                    </td>

                    {/* Registriert */}
                    <td className="hidden px-4 py-3 md:table-cell">
                      <span className="text-xs text-gray-500">{fmtDate(user.created_at)}</span>
                    </td>

                    {/* Zuletzt aktiv */}
                    <td className="hidden px-4 py-3 lg:table-cell">
                      <span className="text-xs text-gray-500">{fmtDateTime(lastSeen)}</span>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      {isBanned ? (
                        <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold bg-red-100 text-red-700">
                          <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                          Gesperrt
                        </span>
                      ) : (
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold
                          ${isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
                          {isActive ? 'Aktiv' : 'Inaktiv'}
                        </span>
                      )}
                    </td>

                    {/* Aktionen */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Link href={`/admin/nutzer/${user.id}`}
                          className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-blue-50 hover:text-blue-500"
                          title="Notizen ansehen">
                          <FileText className="h-4 w-4" />
                        </Link>
                        <UserActions
                          userId={user.id}
                          userName={user.full_name || user.email || 'Nutzer'}
                          isBanned={isBanned}
                        />
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
