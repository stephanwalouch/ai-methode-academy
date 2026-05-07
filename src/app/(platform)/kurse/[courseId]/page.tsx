import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { CheckCircle, PlayCircle, Clock, Layers } from 'lucide-react'

export default async function CoursePage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: course }, { data: progress }, { data: lastViewed }] = await Promise.all([
    supabase.from('courses').select(`
      id, title, description,
      modules(
        id, title, description, sort_order,
        lessons(id, sort_order, is_published, duration_seconds)
      )
    `).eq('id', courseId).eq('is_published', true).single(),
    supabase.from('lesson_progress').select('lesson_id').eq('user_id', user!.id),
    supabase.from('last_viewed_lessons').select('lesson_id')
      .eq('user_id', user!.id).eq('course_id', courseId).maybeSingle(),
  ])

  if (!course) notFound()

  type Lesson = { id: string; sort_order: number; is_published: boolean; duration_seconds: number | null }
  type Module = { id: string; title: string; description: string | null; sort_order: number; lessons: Lesson[] }

  const completedIds = new Set(progress?.map(p => p.lesson_id) ?? [])
  const modules = (course.modules as Module[]).sort((a, b) => a.sort_order - b.sort_order)

  const allLessons = modules.flatMap(m =>
    m.lessons.filter(l => l.is_published).sort((a, b) => a.sort_order - b.sort_order)
  )
  const done  = allLessons.filter(l => completedIds.has(l.id)).length
  const total = allLessons.length
  const pct   = total > 0 ? Math.round((done / total) * 100) : 0

  const currentLessonId = lastViewed?.lesson_id
  const nextUnfinished  = allLessons.find(l => !completedIds.has(l.id))
  const continueLesson  = allLessons.find(l => l.id === currentLessonId) ?? nextUnfinished ?? allLessons[0]

  return (
    <div className="space-y-6 pb-10">

      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-[22px]"
        style={{ background: 'linear-gradient(135deg, #1a0f02 0%, #3b200a 45%, #b8922a 100%)' }}>
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/[0.03]" />
        <div className="pointer-events-none absolute -bottom-10 right-24 h-40 w-40 rounded-full bg-amber-400/[0.07]" />
        <div className="relative px-7 py-8 sm:px-10 sm:py-10">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1">
            <PlayCircle className="h-3.5 w-3.5 text-amber-300" />
            <span className="text-xs font-semibold text-amber-200">AI Methode Academy</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">{course.title}</h1>
          {course.description && (
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-amber-100/60">{course.description}</p>
          )}
          <div className="mt-6 flex items-center gap-5">
            <div className="flex-1 max-w-[240px]">
              <div className="h-2 overflow-hidden rounded-full bg-white/15">
                <div className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #f5d78a, #e8b84b)' }} />
              </div>
              <p className="mt-1.5 text-xs text-amber-200/50">{done} von {total} Lektionen</p>
            </div>
            <span className="text-3xl font-black text-white">
              {pct}<span className="text-xl text-amber-300/60">%</span>
            </span>
          </div>
          {pct < 100 && continueLesson && (
            <Link
              href={`/kurse/${course.id}/lektion/${continueLesson.id}`}
              className="mt-7 inline-flex items-center gap-2.5 rounded-xl bg-white px-6 py-3 text-sm font-bold shadow-lg transition-transform hover:scale-[1.02] active:scale-100"
              style={{ color: '#b8922a' }}
            >
              <PlayCircle className="h-4 w-4" />
              {done === 0 ? 'Kurs starten' : 'Weitermachen'}
            </Link>
          )}
          {pct === 100 && (
            <div className="mt-6 inline-flex items-center gap-2 rounded-xl bg-green-500/20 border border-green-400/30 px-5 py-2.5 text-sm font-semibold text-green-300">
              <CheckCircle className="h-4 w-4" /> Kurs abgeschlossen!
            </div>
          )}
        </div>
      </div>

      {/* Modul-Grid */}
      <div>
        <div className="mb-4 flex items-center gap-2 px-1">
          <Layers className="h-4 w-4 text-gray-400" />
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500">Kursinhalt</h2>
          <span className="text-xs text-gray-400">· {modules.length} Module · {total} Lektionen</span>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {modules.map((module, mIdx) => {
            const modLessons = module.lessons.filter(l => l.is_published)
            const modDone    = modLessons.filter(l => completedIds.has(l.id)).length
            const modTotal   = modLessons.length
            const modPct     = modTotal > 0 ? Math.round((modDone / modTotal) * 100) : 0
            const isDone     = modDone === modTotal && modTotal > 0
            const totalSecs  = modLessons.reduce((s, l) => s + (l.duration_seconds ?? 0), 0)
            const totalMins  = Math.round(totalSecs / 60)

            return (
              <Link
                key={module.id}
                href={`/kurse/${course.id}/modul/${module.id}`}
                className="card group flex flex-col gap-4 p-5 transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                {/* Top: Nummer + Status */}
                <div className="flex items-start justify-between">
                  <div
                    className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${isDone ? 'bg-green-100' : ''}`}
                    style={!isDone ? { background: '#fdf8ee' } : {}}
                  >
                    {isDone
                      ? <CheckCircle className="h-5 w-5 text-green-500" />
                      : <span className="text-sm font-black" style={{ color: '#b8922a' }}>{mIdx + 1}</span>}
                  </div>
                  <span className={`text-xs font-semibold ${isDone ? 'text-green-600' : ''}`}
                    style={!isDone && modPct > 0 ? { color: '#b8922a' } : {}}>
                    {isDone ? '✓ Fertig' : modPct > 0 ? `${modPct}%` : ''}
                  </span>
                </div>

                {/* Titel + Beschreibung */}
                <div className="flex-1">
                  <p className="font-bold leading-snug text-gray-900 transition-colors group-hover:text-[#b8922a]">
                    {module.title}
                  </p>
                  {module.description && (
                    <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-gray-400">
                      {module.description}
                    </p>
                  )}
                </div>

                {/* Meta */}
                <div className="flex items-center gap-3 text-xs text-gray-400">
                  <span>{modTotal} Lektionen</span>
                  {totalMins > 0 && (
                    <>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />{totalMins} Min.
                      </span>
                    </>
                  )}
                </div>

                {/* Fortschrittsbalken */}
                <div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${modPct}%`, background: isDone ? '#22c55e' : '#b8922a' }}
                    />
                  </div>
                  <p className="mt-1 text-[11px] text-gray-400">{modDone} von {modTotal} abgeschlossen</p>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
