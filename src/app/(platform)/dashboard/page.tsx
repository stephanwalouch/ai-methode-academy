import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { CheckCircle, PlayCircle, Clock, TrendingUp, BookMarked, ChevronRight, ArrowRight, Award, Download } from 'lucide-react'
import { LogoImage } from '@/components/LogoImage'
import { AnnouncementBanner } from '@/components/AnnouncementBanner'

function fmtTime(seconds: number) {
  if (seconds === 0) return '0 Min.'
  if (seconds < 3600) return `${Math.round(seconds / 60)} Min.`
  const h = Math.floor(seconds / 3600)
  const m = Math.round((seconds % 3600) / 60)
  return m > 0 ? `${h} Std. ${m} Min.` : `${h} Std.`
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: profile }, { data: courses }, { data: progress }, { data: lastViewed }, { data: announcement }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user!.id).single(),
    supabase.from('courses').select(`
      id, title, sort_order,
      modules(id, title, sort_order,
        lessons(id, title, sort_order, is_published, duration_seconds)
      )
    `).eq('is_published', true).order('sort_order'),
    supabase.from('lesson_progress').select('lesson_id').eq('user_id', user!.id),
    supabase.from('last_viewed_lessons')
      .select('lesson_id, course_id')
      .eq('user_id', user!.id)
      .order('viewed_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase.from('announcements')
      .select('id, title, body')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ])

  type Lesson = { id: string; title: string; sort_order: number; is_published: boolean; duration_seconds: number | null }
  type Module = { id: string; title: string; sort_order: number; lessons: Lesson[] }
  type Course = { id: string; title: string; modules: Module[] }

  const completedIds = new Set(progress?.map(p => p.lesson_id) ?? [])
  const course = (courses as Course[] | null)?.[0] ?? null
  const courseId = course?.id ?? ''

  const sortedModules = (course?.modules as Module[] ?? [])
    .sort((a, b) => a.sort_order - b.sort_order)

  // Alle Lektionen flach mit Modulkontext
  const allLessonsFlat = sortedModules.flatMap((m, mIdx) =>
    m.lessons
      .filter(l => l.is_published)
      .sort((a, b) => a.sort_order - b.sort_order)
      .map(l => ({ ...l, moduleId: m.id, moduleTitle: m.title, moduleIndex: mIdx }))
  )

  const totalLessons = allLessonsFlat.length
  const totalDone    = allLessonsFlat.filter(l => completedIds.has(l.id)).length
  const overallPct   = totalLessons > 0 ? Math.round((totalDone / totalLessons) * 100) : 0
  const totalSeconds = allLessonsFlat
    .filter(l => completedIds.has(l.id))
    .reduce((s, l) => s + (l.duration_seconds ?? 0), 0)

  // Nächste nicht abgeschlossene Lektion – startet beim zuletzt gesehenen
  const lastIdx = allLessonsFlat.findIndex(l => l.id === lastViewed?.lesson_id)
  const searchFrom = lastIdx >= 0 ? lastIdx : 0
  const nextLesson =
    allLessonsFlat.find((l, i) => i >= searchFrom && !completedIds.has(l.id)) ??
    allLessonsFlat.find(l => !completedIds.has(l.id))

  // Aktuelles Modul (für Stat-Kachel)
  const currentModuleTitle = nextLesson?.moduleTitle
    ?? allLessonsFlat.find(l => !completedIds.has(l.id))?.moduleTitle
    ?? null

  const firstName = profile?.full_name?.split(' ')[0] ?? null

  return (
    <div className="space-y-5 pb-8">

      {/* Announcement Banner */}
      {announcement && <AnnouncementBanner announcement={announcement} />}

      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-[22px]"
        style={{ background: 'linear-gradient(135deg, #1a0f02 0%, #3b200a 40%, #b8922a 100%)' }}>
        <div className="pointer-events-none absolute -right-12 -top-12 h-56 w-56 rounded-full bg-white/[0.04]" />
        <div className="pointer-events-none absolute -bottom-8 right-16 h-36 w-36 rounded-full bg-amber-400/[0.08]" />

        <div className="relative px-7 py-8 sm:px-10 sm:py-10">
          <LogoImage
            src="https://www.ai-methode.de/logo-aim.png"
            alt="AI Methode"
            className="mb-5 h-8 w-auto object-contain opacity-90"
          />
          {firstName && (
            <p className="mb-1 text-sm font-medium text-amber-300/70">Hallo, {firstName} 👋</p>
          )}
          <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">AI Methode Academy</h1>
          <p className="mt-1.5 text-base text-amber-200/60">Dein Weg zur eigenen KI-Agentur</p>

          <div className="mt-6 flex items-center gap-5">
            <div className="flex-1 max-w-[260px]">
              <div className="h-2 overflow-hidden rounded-full bg-white/15">
                <div className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${overallPct}%`, background: 'linear-gradient(90deg, #f5d78a, #e8b84b)' }} />
              </div>
              <p className="mt-1.5 text-xs text-amber-200/50">{totalDone} von {totalLessons} Lektionen</p>
            </div>
            <span className="text-4xl font-black text-white">
              {overallPct}<span className="text-2xl text-amber-300/70">%</span>
            </span>
          </div>

          {nextLesson && (
            <Link
              href={`/kurse/${courseId}/lektion/${nextLesson.id}`}
              className="mt-7 inline-flex items-center gap-2.5 rounded-xl bg-white px-6 py-3 text-sm font-bold shadow-lg transition-transform hover:scale-[1.02] active:scale-100"
              style={{ color: '#b8922a' }}
            >
              <PlayCircle className="h-4 w-4" />
              {totalDone === 0 ? 'Jetzt starten' : 'Weitermachen'}
            </Link>
          )}
          {overallPct === 100 && (
            <Link href="/abschluss" className="mt-6 inline-flex items-center gap-2 rounded-xl border border-green-400/30 bg-green-500/20 px-5 py-2.5 text-sm font-semibold text-green-300 transition-opacity hover:opacity-80">
              <CheckCircle className="h-4 w-4" /> Kurs abgeschlossen! → Zertifikat
            </Link>
          )}
        </div>
      </div>

      {/* Stat-Kacheln */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
        <div className="card col-span-2 p-5">
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: '#fdf8ee' }}>
              <TrendingUp className="h-4 w-4" style={{ color: '#b8922a' }} />
            </div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Gesamtfortschritt</p>
          </div>
          <p className="text-3xl font-black" style={{ color: '#b8922a' }}>{overallPct}%</p>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-100">
            <div className="h-full rounded-full transition-all duration-700"
              style={{ width: `${overallPct}%`, background: 'linear-gradient(90deg, #b8922a, #d4a93a)' }} />
          </div>
          <p className="mt-1.5 text-xs text-gray-400">{totalDone} von {totalLessons} Lektionen abgeschlossen</p>
        </div>

        {totalSeconds > 0 && (
          <div className="card p-5">
            <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50">
              <Clock className="h-4 w-4 text-blue-500" />
            </div>
            <p className="text-xl font-bold leading-tight text-gray-900">{fmtTime(totalSeconds)}</p>
            <p className="mt-0.5 text-xs text-gray-400">Lernzeit</p>
          </div>
        )}

        <div className="card p-5">
          <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50">
            <BookMarked className="h-4 w-4 text-purple-500" />
          </div>
          <p className="line-clamp-2 text-sm font-bold leading-snug text-gray-900">
            {currentModuleTitle ?? '—'}
          </p>
          <p className="mt-0.5 text-xs text-gray-400">Aktuelles Modul</p>
        </div>
      </div>

      {/* Abschluss-Karte (wenn 100%) */}
      {overallPct === 100 && (
        <div className="relative overflow-hidden rounded-[22px] border border-amber-200 bg-gradient-to-br from-amber-50 to-white p-7 dark:border-amber-800/30 dark:from-amber-900/20 dark:to-transparent">
          {/* Deko */}
          <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-amber-100/60 dark:bg-amber-900/20" />
          <div className="pointer-events-none absolute -bottom-6 right-24 h-24 w-24 rounded-full bg-amber-200/40 dark:bg-amber-800/10" />

          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl text-3xl"
                style={{ background: 'linear-gradient(135deg, #b8922a, #d4a93a)' }}>
                🏆
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-amber-600">Herzlichen Glückwunsch!</p>
                <h2 className="mt-0.5 text-xl font-black text-gray-900">Du hast den Kurs abgeschlossen</h2>
                <p className="mt-1 text-sm text-gray-500">
                  Lade dein persönliches Zertifikat herunter oder rufe die Abschlussseite auf.
                </p>
              </div>
            </div>

            <div className="flex flex-shrink-0 flex-col gap-2 sm:items-end">
              <Link
                href="/abschluss"
                className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white shadow-md transition-transform hover:scale-[1.02]"
                style={{ background: 'linear-gradient(90deg, #b8922a, #c9a030)' }}
              >
                <Award className="h-4 w-4" />
                Abschlussseite & Zertifikat
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Weiter lernen */}
      {nextLesson && overallPct < 100 && (
        <div>
          <h2 className="mb-3 text-base font-semibold text-gray-900">Weiter lernen</h2>
          <div className="card overflow-hidden">
            {/* Farbiger Akzentstreifen oben */}
            <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #b8922a, #d4a93a, #f5d78a)' }} />

            <div className="p-6 sm:p-7">
              {/* Modul-Badge */}
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1">
                <span className="text-xs font-bold" style={{ color: '#b8922a' }}>
                  Modul {nextLesson.moduleIndex + 1}
                </span>
                <span className="text-xs text-amber-400">·</span>
                <span className="text-xs font-medium text-amber-700">{nextLesson.moduleTitle}</span>
              </div>

              {/* Lektions-Titel */}
              <p className="text-lg font-black leading-snug text-gray-900 sm:text-xl">
                {nextLesson.title}
              </p>

              {/* Motivationstext */}
              <p className="mt-1.5 text-sm text-gray-400">
                {overallPct === 0
                  ? 'Starte jetzt deinen Kurs – jeder Experte hat mal als Anfänger begonnen.'
                  : overallPct < 30
                  ? 'Du bist auf einem guten Weg! Bleib dran. 💪'
                  : overallPct < 60
                  ? 'Halbzeit in Sicht – du machst das großartig! 🔥'
                  : overallPct < 90
                  ? 'Fast geschafft – noch ein letzter Schub! 🚀'
                  : 'Nur noch wenige Lektionen – die Ziellinie ist in Sicht! 🏆'}
              </p>

              {/* CTA-Button */}
              <Link
                href={`/kurse/${courseId}/lektion/${nextLesson.id}`}
                className="mt-5 inline-flex items-center gap-2.5 rounded-xl px-6 py-3 text-sm font-bold text-white shadow-md transition-transform hover:scale-[1.02] active:scale-100"
                style={{ background: 'linear-gradient(90deg, #b8922a, #c9a030)' }}
              >
                <PlayCircle className="h-5 w-5" />
                Jetzt weitermachen
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Modul-Übersicht */}
      {sortedModules.length > 0 && (
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-900">Module</h2>
            <Link
              href={`/kurse/${courseId}`}
              className="flex items-center gap-1 text-sm font-medium transition-colors hover:underline"
              style={{ color: '#b8922a' }}
            >
              Alle Module <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
            {sortedModules.map((module, mIdx) => {
              const modLessons = module.lessons.filter(l => l.is_published)
              const modDone    = modLessons.filter(l => completedIds.has(l.id)).length
              const modTotal   = modLessons.length
              const modPct     = modTotal > 0 ? Math.round((modDone / modTotal) * 100) : 0
              const isDone     = modDone === modTotal && modTotal > 0

              return (
                <Link
                  key={module.id}
                  href={`/kurse/${courseId}/modul/${module.id}`}
                  className="card group flex items-center gap-3 p-4 transition-all hover:-translate-y-0.5 hover:shadow-md"
                >
                  {/* Nummer */}
                  <div
                    className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg ${isDone ? 'bg-green-100' : ''}`}
                    style={!isDone ? { background: '#fdf8ee' } : {}}
                  >
                    {isDone
                      ? <CheckCircle className="h-4.5 w-4.5 text-green-500" />
                      : <span className="text-xs font-black" style={{ color: '#b8922a' }}>{mIdx + 1}</span>}
                  </div>

                  {/* Titel + Balken */}
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-semibold text-gray-900 group-hover:text-[#b8922a] transition-colors">
                      {module.title}
                    </p>
                    <div className="mt-1.5 flex items-center gap-2">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-100">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${modPct}%`, background: isDone ? '#22c55e' : '#b8922a' }}
                        />
                      </div>
                      <span className="flex-shrink-0 text-[11px] font-semibold text-gray-400">{modPct}%</span>
                    </div>
                  </div>

                  <ChevronRight className="h-4 w-4 flex-shrink-0 text-gray-300" />
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
