import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { CheckCircle, Clock, PlayCircle, TrendingUp, BookMarked, Trophy } from 'lucide-react'

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('de-DE', { day: '2-digit', month: 'short', year: 'numeric' })
}

function fmtTime(seconds: number) {
  if (seconds === 0) return '—'
  if (seconds < 3600) return `${Math.round(seconds / 60)} Min.`
  const h = Math.floor(seconds / 3600)
  const m = Math.round((seconds % 3600) / 60)
  return m > 0 ? `${h} Std. ${m} Min.` : `${h} Std.`
}

export default async function FortschrittPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: courses }, { data: progress }, { data: lastViewed }] = await Promise.all([
    supabase.from('courses').select(`
      id, title, thumbnail_url, sort_order,
      modules(id, title, sort_order, lessons(id, is_published, sort_order, duration_seconds))
    `).eq('is_published', true).order('sort_order'),
    supabase.from('lesson_progress').select('lesson_id, completed_at').eq('user_id', user!.id).order('completed_at', { ascending: false }),
    supabase.from('last_viewed_lessons').select(`
      viewed_at, course_id, lesson_id,
      lesson:lessons(title),
      course:courses(title)
    `).eq('user_id', user!.id).order('viewed_at', { ascending: false }).limit(1).maybeSingle(),
  ])

  type Lesson = { id: string; is_published: boolean; sort_order: number; duration_seconds: number | null }
  type Module = { id: string; title: string; sort_order: number; lessons: Lesson[] }
  type Course = { id: string; title: string; thumbnail_url: string | null; modules: Module[] }

  const completedIds = new Set(progress?.map(p => p.lesson_id) ?? [])

  const allModules = (courses as Course[] ?? []).flatMap(c =>
    (c.modules as Module[]).sort((a, b) => a.sort_order - b.sort_order)
  )
  const allLessons = allModules.flatMap(m => m.lessons.filter(l => l.is_published))

  const totalLessons = allLessons.length
  const totalDone    = allLessons.filter(l => completedIds.has(l.id)).length
  const overallPct   = totalLessons > 0 ? Math.round((totalDone / totalLessons) * 100) : 0

  const totalSeconds = allLessons
    .filter(l => completedIds.has(l.id))
    .reduce((sum, l) => sum + (l.duration_seconds ?? 0), 0)

  const lastV = lastViewed as {
    viewed_at: string; course_id: string; lesson_id: string;
    lesson: { title: string }; course: { title: string }
  } | null

  const currentModule = allModules.find(m => m.lessons.some(l => l.id === lastV?.lesson_id))
    ?? allModules.find(m => m.lessons.some(l => l.is_published && !completedIds.has(l.id)))

  // Pro-Kurs-Statistiken
  const courseStats = (courses as Course[] ?? []).map(course => {
    const modules = (course.modules as Module[]).sort((a, b) => a.sort_order - b.sort_order)
    const lessons = modules.flatMap(m => m.lessons.filter(l => l.is_published))
    const done    = lessons.filter(l => completedIds.has(l.id)).length
    const total   = lessons.length
    const pct     = total > 0 ? Math.round((done / total) * 100) : 0
    const moduleStats = modules.map(mod => {
      const mLessons = mod.lessons.filter(l => l.is_published)
      const mDone    = mLessons.filter(l => completedIds.has(l.id)).length
      return { id: mod.id, title: mod.title, done: mDone, total: mLessons.length }
    })
    return { ...course, done, total, pct, moduleStats }
  })

  return (
    <div className="space-y-5 pb-10">

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mein Fortschritt</h1>
        <p className="mt-1 text-sm text-gray-500">Dein gesamter Lernfortschritt auf einen Blick.</p>
      </div>

      {/* Stat-Kacheln */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">

        {/* Gesamtfortschritt – groß, 2-spaltig */}
        <div className="card col-span-2 p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: '#fdf8ee' }}>
              <TrendingUp className="h-4 w-4" style={{ color: '#b8922a' }} />
            </div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Gesamtfortschritt</p>
          </div>
          <p className="text-4xl font-black" style={{ color: '#b8922a' }}>
            {overallPct}<span className="text-2xl" style={{ color: '#d4a93a' }}>%</span>
          </p>
          <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-gray-100">
            <div className="h-full rounded-full transition-all duration-700"
              style={{ width: `${overallPct}%`, background: 'linear-gradient(90deg, #b8922a, #d4a93a)' }} />
          </div>
          <p className="mt-1.5 text-xs text-gray-400">
            {totalDone} von {totalLessons} Lektionen abgeschlossen
          </p>
        </div>

        {/* Lernzeit – nur anzeigen wenn Videos abgeschlossen wurden */}
        {totalSeconds > 0 ? (
          <div className="card p-5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 mb-3">
              <Clock className="h-4 w-4 text-blue-500" />
            </div>
            <p className="text-xl font-bold text-gray-900 leading-tight">{fmtTime(totalSeconds)}</p>
            <p className="mt-0.5 text-xs text-gray-400">Lernzeit</p>
          </div>
        ) : (
          <div className="card p-5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-50 mb-3">
              <Clock className="h-4 w-4 text-gray-300" />
            </div>
            <p className="text-sm font-medium text-gray-400 leading-snug">Verfügbar nach<br />Video-Upload</p>
            <p className="mt-0.5 text-xs text-gray-300">Lernzeit</p>
          </div>
        )}

        {/* Aktuelles Modul / Kurs abgeschlossen */}
        {overallPct === 100 ? (
          <Link href="/abschluss" className="card p-5 block transition-shadow hover:shadow-md" style={{ background: 'linear-gradient(135deg, #fdf8ee, #fffbf2)' }}>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg mb-3" style={{ background: '#fdf8ee', border: '1.5px solid #e8c97a' }}>
              <Trophy className="h-4 w-4" style={{ color: '#b8922a' }} />
            </div>
            <p className="text-sm font-bold leading-snug" style={{ color: '#b8922a' }}>
              Kurs abgeschlossen!
            </p>
            <p className="mt-0.5 text-xs" style={{ color: '#c9a030' }}>Zertifikat herunterladen →</p>
          </Link>
        ) : (
          <div className="card p-5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50 mb-3">
              <BookMarked className="h-4 w-4 text-purple-500" />
            </div>
            <p className="text-sm font-bold text-gray-900 leading-snug line-clamp-2">
              {currentModule?.title ?? '—'}
            </p>
            <p className="mt-0.5 text-xs text-gray-400">Aktuelles Modul</p>
          </div>
        )}
      </div>

      {/* Zuletzt angeschaut */}
      {lastV && (
        <div className="card p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">Zuletzt angeschaut</p>
          <Link
            href={`/kurse/${lastV.course_id}/lektion/${lastV.lesson_id}`}
            className="flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-gray-50"
          >
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full" style={{ background: '#fdf8ee' }}>
              <PlayCircle className="h-5 w-5" style={{ color: '#b8922a' }} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-gray-900">{lastV.lesson.title}</p>
              <p className="truncate text-xs text-gray-400">{lastV.course.title} · {fmtDate(lastV.viewed_at)}</p>
            </div>
            <span className="btn-primary flex-shrink-0 py-1.5 text-xs">Weitermachen</span>
          </Link>
        </div>
      )}

      {/* Pro-Kurs-Fortschritt */}
      <div className="space-y-3">
        <h2 className="text-base font-semibold text-gray-900">Fortschritt pro Modul</h2>
        {courseStats.map(course => (
          <div key={course.id} className="card overflow-hidden">
            <div className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <Link href={`/kurse/${course.id}`} className="font-semibold text-gray-900 hover:underline">
                    {course.title}
                  </Link>
                  <div className="mt-2 flex items-center gap-3">
                    <div className="flex-1 h-2 overflow-hidden rounded-full bg-gray-100">
                      <div className="h-full rounded-full transition-all"
                        style={{ width: `${course.pct}%`, background: 'linear-gradient(90deg, #b8922a, #d4a93a)' }} />
                    </div>
                    <span className="flex-shrink-0 text-sm font-bold" style={{ color: '#b8922a' }}>{course.pct}%</span>
                  </div>
                  <p className="mt-1 text-xs text-gray-400">{course.done} von {course.total} Lektionen</p>
                </div>
                {course.pct === 100 && <CheckCircle className="h-5 w-5 flex-shrink-0 text-green-500 mt-0.5" />}
              </div>

              {course.moduleStats.length > 1 && (
                <div className="mt-4 space-y-2 border-t border-gray-100 pt-4">
                  {course.moduleStats.map(mod => {
                    const modPct = mod.total > 0 ? Math.round((mod.done / mod.total) * 100) : 0
                    return (
                      <div key={mod.id} className="space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs text-gray-500">{mod.title}</p>
                          <span className="flex-shrink-0 text-xs text-gray-400">{modPct}%</span>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-gray-100">
                          <div className="h-full rounded-full" style={{ width: `${modPct}%`, background: '#b8922a88' }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
