import { createClient } from '@/lib/supabase/server'
import { redirect }     from 'next/navigation'
import Link             from 'next/link'
import { ConfettiCelebration } from '@/components/ConfettiCelebration'
import { LogoImage }    from '@/components/LogoImage'
import { CertificateDownloadButton } from '@/components/CertificateDownloadButton'

export default async function AbschlussPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: profile }, { data: courses }, { data: progress }] = await Promise.all([
    supabase.from('profiles').select('full_name').eq('id', user.id).single(),
    supabase.from('courses').select('id, modules(id, lessons(id, is_published))').eq('is_published', true),
    supabase.from('lesson_progress').select('lesson_id').eq('user_id', user.id),
  ])

  // Alle veröffentlichten Lektionen zählen
  const allLessonIds = (courses ?? []).flatMap(c =>
    (c.modules as { lessons: { id: string; is_published: boolean }[] }[]).flatMap(m =>
      m.lessons.filter(l => l.is_published).map(l => l.id)
    )
  )
  const completedIds  = new Set(progress?.map(p => p.lesson_id) ?? [])
  const totalLessons  = allLessonIds.length
  const totalDone     = allLessonIds.filter(id => completedIds.has(id)).length

  // Nur zugänglich, wenn wirklich alles abgeschlossen
  if (totalLessons === 0 || totalDone < totalLessons) redirect('/dashboard')

  const firstName = profile?.full_name?.split(' ')[0] ?? null

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-6 py-16 text-center">
      <ConfettiCelebration />

      {/* Logo */}
      <LogoImage
        src="https://www.ai-methode.de/logo-aim.png"
        alt="AI Methode Academy"
        className="mb-8 h-12 w-auto object-contain"
      />

      {/* Großes Emoji */}
      <div className="mb-6 text-7xl select-none" aria-hidden="true">🏆</div>

      {/* Headline */}
      <h1 className="text-3xl font-black tracking-tight text-gray-900 sm:text-4xl">
        Herzlichen Glückwunsch{firstName ? `, ${firstName}` : ''}!&nbsp;🎉
      </h1>

      {/* Untertitel */}
      <p className="mt-4 max-w-lg text-lg font-semibold leading-snug" style={{ color: '#b8922a' }}>
        Du hast die AI Methode Academy erfolgreich abgeschlossen!
      </p>

      {/* Motivationstext */}
      <p className="mt-4 max-w-md text-base leading-relaxed text-gray-500">
        Du hast alles, was du brauchst, um deine eigene KI-Agentur aufzubauen.
        Jetzt liegt es an dir!
      </p>

      {/* Trennlinie mit Sternen */}
      <div className="my-8 flex items-center gap-3 text-amber-400 select-none" aria-hidden="true">
        <span>✦</span>
        <span>✦</span>
        <span>✦</span>
      </div>

      {/* Stats Badge */}
      <div className="mb-8 inline-flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-6 py-3 dark:border-amber-800/40 dark:bg-amber-900/20">
        <span className="text-2xl font-black" style={{ color: '#b8922a' }}>{totalDone}</span>
        <span className="text-sm font-medium text-gray-500">Lektionen abgeschlossen</span>
      </div>

      {/* Zertifikat + CTA */}
      <div className="flex flex-col items-center gap-3 sm:flex-row">
        <CertificateDownloadButton />
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-7 py-3 text-sm font-semibold text-gray-600 shadow-sm transition-all hover:bg-gray-50 hover:scale-[1.02]"
        >
          Zurück zum Dashboard
        </Link>
      </div>
    </div>
  )
}
