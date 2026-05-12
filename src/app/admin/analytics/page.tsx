import { createClient } from '@/lib/supabase/server'
import { BarChart3, TrendingDown, Users, CheckCircle2 } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AnalyticsPage() {
  const supabase = await createClient()

  const [{ data: courses }, { data: allProgress }, { data: profiles }] = await Promise.all([
    supabase.from('courses').select(`
      id, title,
      modules(
        id, title, sort_order,
        lessons(id, title, sort_order, is_published)
      )
    `).eq('is_published', true).order('sort_order'),
    supabase.from('lesson_progress').select('user_id, lesson_id'),
    supabase.from('profiles').select('id, role'),
  ])

  type Lesson = { id: string; title: string; sort_order: number; is_published: boolean }
  type Module = { id: string; title: string; sort_order: number; lessons: Lesson[] }
  type Course = { id: string; title: string; modules: Module[] }

  const students = (profiles ?? []).filter(p => p.role !== 'admin')
  const totalStudents = students.length
  const studentIds = new Set(students.map(s => s.id))

  // Completion count per lesson — admins excluded
  const completionByLesson = new Map<string, number>()
  allProgress?.forEach(p => {
    if (!studentIds.has(p.user_id)) return
    completionByLesson.set(p.lesson_id, (completionByLesson.get(p.lesson_id) ?? 0) + 1)
  })

  // Build flat lesson list across all courses
  const lessonRows: {
    moduleTitle: string
    moduleIdx: number
    lessonTitle: string
    lessonIdx: number
    lessonId: string
    completed: number
    pct: number
  }[] = []

  ;(courses as Course[] ?? []).forEach(course => {
    const sortedModules = [...(course.modules as Module[])].sort((a, b) => a.sort_order - b.sort_order)
    sortedModules.forEach((mod, mIdx) => {
      const sortedLessons = mod.lessons.filter(l => l.is_published).sort((a, b) => a.sort_order - b.sort_order)
      sortedLessons.forEach((lesson, lIdx) => {
        const completed = completionByLesson.get(lesson.id) ?? 0
        const pct = totalStudents > 0 ? Math.round((completed / totalStudents) * 100) : 0
        lessonRows.push({
          moduleTitle: mod.title,
          moduleIdx: mIdx + 1,
          lessonTitle: lesson.title,
          lessonIdx: lIdx + 1,
          lessonId: lesson.id,
          completed,
          pct,
        })
      })
    })
  })

  // Dropout: where did the most users stop?
  const biggestDropoffs = lessonRows
    .slice(1)
    .map((row, i) => ({ ...row, dropoff: lessonRows[i].pct - row.pct }))
    .filter(r => r.dropoff > 0)
    .sort((a, b) => b.dropoff - a.dropoff)
    .slice(0, 3)

  const avgCompletion = lessonRows.length > 0
    ? Math.round(lessonRows.reduce((s, r) => s + r.pct, 0) / lessonRows.length)
    : 0

  const fullyDone = totalStudents > 0
    ? (profiles ?? []).filter(p => p.role !== 'admin').filter(p => {
        const done = allProgress?.filter(pr => pr.user_id === p.id).length ?? 0
        return done >= lessonRows.length && lessonRows.length > 0
      }).length
    : 0

  return (
    <div className="space-y-8">

      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: '#fdf8ee' }}>
            <BarChart3 className="h-5 w-5" style={{ color: '#b8922a' }} />
          </div>
          <h1 className="text-2xl font-black text-gray-900">Lektions-Analytics</h1>
        </div>
        <p className="text-sm text-gray-500 ml-12">Sieh wo Nutzer aufhören und optimiere deinen Kurs.</p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Mitglieder', value: totalStudents, icon: Users },
          { label: 'Ø Abschlussrate', value: `${avgCompletion}%`, icon: BarChart3 },
          { label: 'Kurs abgeschlossen', value: fullyDone, icon: CheckCircle2 },
          { label: 'Lektionen gesamt', value: lessonRows.length, icon: TrendingDown },
        ].map(s => (
          <div key={s.label} className="card p-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl mb-3" style={{ background: '#fdf8ee' }}>
              <s.icon className="h-4 w-4" style={{ color: '#b8922a' }} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Biggest dropoffs */}
      {biggestDropoffs.length > 0 && (
        <div className="card p-5">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-bold text-gray-900">
            <TrendingDown className="h-4 w-4 text-red-500" />
            Größte Abbruchpunkte
          </h2>
          <div className="space-y-3">
            {biggestDropoffs.map(row => (
              <div key={row.lessonId} className="flex items-center gap-4 rounded-xl bg-red-50 px-4 py-3">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-400">{row.moduleTitle}</p>
                  <p className="text-sm font-semibold text-gray-900 truncate">{row.lessonTitle}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold text-red-600">−{row.dropoff}%</p>
                  <p className="text-xs text-gray-400">{row.pct}% abgeschlossen</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Full lesson table */}
      <div className="card overflow-hidden">
        <div className="border-b border-gray-100 px-5 py-3">
          <h2 className="text-sm font-bold text-gray-900">Alle Lektionen</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-left">
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-400">#</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-400">Lektion</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-400">Abgeschlossen</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-400 w-48">Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {lessonRows.map((row, i) => {
                const prev = lessonRows[i - 1]
                const dropoff = prev ? prev.pct - row.pct : 0
                return (
                  <tr key={row.lessonId} className={`transition-colors ${dropoff >= 20 ? 'bg-red-50/50' : 'hover:bg-gray-50'}`}>
                    <td className="px-4 py-3 text-xs text-gray-400 font-mono">{i + 1}</td>
                    <td className="px-4 py-3">
                      <p className="text-xs text-gray-400">{row.moduleTitle}</p>
                      <p className="text-sm font-medium text-gray-900">{row.lessonTitle}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-semibold text-gray-700">{row.completed}</span>
                      <span className="text-xs text-gray-400"> / {totalStudents}</span>
                      {dropoff >= 10 && (
                        <span className="ml-2 text-xs font-semibold text-red-500">↓ {dropoff}%</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 overflow-hidden rounded-full bg-gray-100">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${row.pct}%`,
                              background: row.pct >= 70 ? '#22c55e' : row.pct >= 40 ? '#b8922a' : '#ef4444',
                            }}
                          />
                        </div>
                        <span className="flex-shrink-0 text-xs font-semibold" style={{
                          color: row.pct >= 70 ? '#16a34a' : row.pct >= 40 ? '#b8922a' : '#ef4444',
                        }}>
                          {row.pct}%
                        </span>
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
