import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, CheckCircle, PlayCircle, Clock, ChevronRight } from 'lucide-react'

function fmtDur(s: number | null) {
  if (!s) return null
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

export default async function ModulePage({ params }: { params: Promise<{ courseId: string; moduleId: string }> }) {
  const { courseId, moduleId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: module }, { data: course }, { data: progress }] = await Promise.all([
    supabase.from('modules').select(`
      id, title, description, sort_order,
      lessons(id, title, sort_order, is_published, bunny_video_id, duration_seconds)
    `).eq('id', moduleId).single(),
    supabase.from('courses').select('id, title, modules(id, sort_order)')
      .eq('id', courseId).eq('is_published', true).single(),
    supabase.from('lesson_progress').select('lesson_id').eq('user_id', user!.id),
  ])

  if (!module || !course) notFound()

  type Lesson = {
    id: string; title: string; sort_order: number
    is_published: boolean; bunny_video_id: string | null; duration_seconds: number | null
  }

  const completedIds = new Set(progress?.map(p => p.lesson_id) ?? [])
  const lessons = (module.lessons as Lesson[])
    .filter(l => l.is_published)
    .sort((a, b) => a.sort_order - b.sort_order)

  const done   = lessons.filter(l => completedIds.has(l.id)).length
  const total  = lessons.length
  const pct    = total > 0 ? Math.round((done / total) * 100) : 0
  const isDone = done === total && total > 0

  const allModules = ((course.modules as { id: string; sort_order: number }[]) ?? [])
    .sort((a, b) => a.sort_order - b.sort_order)
  const moduleIdx = allModules.findIndex(m => m.id === moduleId)
  const nextModule = moduleIdx < allModules.length - 1 ? allModules[moduleIdx + 1] : null
  const prevModule = moduleIdx > 0 ? allModules[moduleIdx - 1] : null

  const nextUnfinished = lessons.find(l => !completedIds.has(l.id))
  const startLesson    = nextUnfinished ?? lessons[0]

  return (
    <div className="space-y-5 pb-10">

      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-gray-400">
        <Link
          href={`/kurse/${courseId}`}
          className="flex items-center gap-1 font-medium transition-colors hover:text-[#b8922a]"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> AI Methode Academy
        </Link>
        <ChevronRight className="h-3 w-3 flex-shrink-0" />
        <span className="truncate font-medium text-gray-600">{module.title}</span>
      </div>

      {/* Modul-Header */}
      <div className="card p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <div
            className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl ${isDone ? 'bg-green-100' : ''}`}
            style={!isDone ? { background: '#fdf8ee' } : {}}
          >
            {isDone
              ? <CheckCircle className="h-6 w-6 text-green-500" />
              : <span className="text-lg font-black" style={{ color: '#b8922a' }}>{moduleIdx + 1}</span>}
          </div>

          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-black text-gray-900 sm:text-2xl leading-tight">{module.title}</h1>
            {module.description && (
              <p className="mt-2 text-sm leading-relaxed text-gray-500">{module.description}</p>
            )}

            <div className="mt-4">
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-xs text-gray-400">{done} von {total} Lektionen abgeschlossen</span>
                <span className="text-xs font-bold" style={{ color: isDone ? '#22c55e' : '#b8922a' }}>{pct}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${pct}%`, background: isDone ? '#22c55e' : 'linear-gradient(90deg, #b8922a, #d4a93a)' }}
                />
              </div>
            </div>
          </div>
        </div>

        {startLesson && (
          <Link
            href={`/kurse/${courseId}/lektion/${startLesson.id}`}
            className="mt-5 inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white shadow transition-transform hover:scale-[1.01]"
            style={{ background: '#b8922a' }}
          >
            <PlayCircle className="h-4 w-4" />
            {done === 0 ? 'Modul starten' : isDone ? 'Wiederholen' : 'Weitermachen'}
          </Link>
        )}
      </div>

      {/* Lektionsliste */}
      <div className="card overflow-hidden">
        <div className="border-b border-gray-100 px-5 py-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
            {total} Lektionen
          </p>
        </div>

        <div className="divide-y divide-gray-50">
          {lessons.map((lesson, lIdx) => {
            const completed = completedIds.has(lesson.id)
            return (
              <Link
                key={lesson.id}
                href={`/kurse/${courseId}/lektion/${lesson.id}`}
                className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-gray-50/80"
              >
                {/* Status */}
                <div className="flex-shrink-0">
                  {completed
                    ? <CheckCircle className="h-5 w-5 text-green-500" />
                    : (
                      <div className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-gray-200">
                        <span className="text-[10px] font-bold text-gray-400">{lIdx + 1}</span>
                      </div>
                    )}
                </div>

                {/* Titel */}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium leading-snug ${
                    completed ? 'text-gray-400 line-through decoration-gray-300' : 'text-gray-900'
                  }`}>
                    {lesson.title}
                  </p>
                </div>

                {/* Meta */}
                <div className="flex flex-shrink-0 items-center gap-2">
                  {lesson.bunny_video_id && (
                    <span className="hidden rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-400 sm:block">
                      ▶ Video
                    </span>
                  )}
                  {lesson.duration_seconds && (
                    <span className="flex items-center gap-1 text-xs text-gray-400">
                      <Clock className="h-3 w-3" />{fmtDur(lesson.duration_seconds)} min
                    </span>
                  )}
                  <ChevronRight className="h-3.5 w-3.5 text-gray-300" />
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Modul-Navigation */}
      <div className="flex items-center justify-between gap-3 pt-1">
        {prevModule ? (
          <Link href={`/kurse/${courseId}/modul/${prevModule.id}`} className="btn-secondary">
            <ArrowLeft className="h-4 w-4" /> Vorheriges Modul
          </Link>
        ) : (
          <Link href={`/kurse/${courseId}`} className="btn-secondary">
            <ArrowLeft className="h-4 w-4" /> Kursübersicht
          </Link>
        )}
        {nextModule && (
          <Link href={`/kurse/${courseId}/modul/${nextModule.id}`} className="btn-primary">
            Nächstes Modul <ChevronRight className="h-4 w-4" />
          </Link>
        )}
      </div>
    </div>
  )
}
