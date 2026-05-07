import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { VideoAutoComplete } from '@/components/VideoAutoComplete'
import { ProgressButton } from '@/components/ProgressButton'
import { LessonNotes } from '@/components/LessonNotes'
import { LessonTracker } from '@/components/LessonTracker'
import { ChevronLeft, ChevronRight, CheckCircle, PlayCircle, Download, FileText, FileSpreadsheet, Presentation, File, Layers } from 'lucide-react'
import { LessonSidebar } from './LessonSidebar'

function fmtDur(s: number | null) {
  if (!s) return null
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

function fmtSize(bytes: number | null) {
  if (!bytes) return null
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

type DownloadFileType = 'pdf' | 'word' | 'excel' | 'powerpoint' | null

function FileTypeIcon({ type }: { type: DownloadFileType }) {
  if (type === 'pdf')        return <FileText        className="h-5 w-5 text-red-500"    />
  if (type === 'word')       return <FileText        className="h-5 w-5 text-blue-500"   />
  if (type === 'excel')      return <FileSpreadsheet className="h-5 w-5 text-green-600"  />
  if (type === 'powerpoint') return <Presentation   className="h-5 w-5 text-orange-500" />
  return <File className="h-5 w-5 text-gray-400" />
}

function fileTypeLabel(type: DownloadFileType) {
  if (type === 'pdf')        return 'PDF'
  if (type === 'word')       return 'Word'
  if (type === 'excel')      return 'Excel'
  if (type === 'powerpoint') return 'PowerPoint'
  return 'Datei'
}

function fileTypeBg(type: DownloadFileType) {
  if (type === 'pdf')        return 'bg-red-50'
  if (type === 'word')       return 'bg-blue-50'
  if (type === 'excel')      return 'bg-green-50'
  if (type === 'powerpoint') return 'bg-orange-50'
  return 'bg-gray-50'
}

export default async function LessonPage({ params }: { params: Promise<{ courseId: string; lessonId: string }> }) {
  const { courseId, lessonId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: lesson }, { data: course }, { data: progress }, { data: noteRow }, { data: downloads }] = await Promise.all([
    supabase.from('lessons').select(`
      id, title, description, bunny_video_id, bunny_library_id, duration_seconds,
      module_id, modules(id, title, sort_order, course_id)
    `).eq('id', lessonId).single(),

    supabase.from('courses').select(`
      id, title,
      modules(id, title, sort_order,
        lessons(id, title, sort_order, is_published, bunny_video_id, duration_seconds)
      )
    `).eq('id', courseId).eq('is_published', true).single(),

    supabase.from('lesson_progress').select('lesson_id').eq('user_id', user!.id),
    supabase.from('lesson_notes').select('content').eq('user_id', user!.id).eq('lesson_id', lessonId).maybeSingle(),
    supabase.from('lesson_downloads').select('id, title, url, file_size, file_type, storage_path, sort_order').eq('lesson_id', lessonId).order('sort_order'),
  ])

  if (!lesson || !course) notFound()

  type Lesson  = { id: string; title: string; sort_order: number; is_published: boolean; bunny_video_id: string | null; duration_seconds: number | null }
  type Module  = { id: string; title: string; sort_order: number; lessons: Lesson[] }
  type Download = { id: string; title: string; url: string; file_size: number | null; file_type: string | null; storage_path: string | null; sort_order: number }

  // For private-bucket files, generate fresh 1-hour signed URLs server-side
  const resolvedDownloads: Download[] = await Promise.all(
    (downloads ?? []).map(async (dl: Download) => {
      if (!dl.storage_path) return dl
      const { data } = await supabase.storage
        .from('lesson-files')
        .createSignedUrl(dl.storage_path, 3600)
      return { ...dl, url: data?.signedUrl ?? dl.url }
    })
  )

  const completedIds = new Set(progress?.map(p => p.lesson_id) ?? [])
  const isCompleted  = completedIds.has(lessonId)

  const modules       = (course.modules as Module[]).sort((a, b) => a.sort_order - b.sort_order)
  const allLessons    = modules.flatMap(m => m.lessons.filter(l => l.is_published).sort((a, b) => a.sort_order - b.sort_order))
  const allLessonIds  = allLessons.map(l => l.id)
  const idx           = allLessons.findIndex(l => l.id === lessonId)
  const prevLesson = idx > 0 ? allLessons[idx - 1] : null
  const nextLesson = idx < allLessons.length - 1 ? allLessons[idx + 1] : null

  const libraryId   = lesson.bunny_library_id ?? process.env.NEXT_PUBLIC_BUNNY_LIBRARY_ID ?? ''
  const moduleInfo  = lesson.modules as unknown as { id: string; title: string; sort_order: number }
  const moduleTitle = moduleInfo?.title ?? ''

  // Determine if this is the last lesson in its module → show "Weiter zu Modul X"
  const currentModule   = modules.find(m => m.id === moduleInfo?.id)
  const currentModLessons = currentModule?.lessons.filter(l => l.is_published).sort((a, b) => a.sort_order - b.sort_order) ?? []
  const isLastInModule  = currentModLessons.at(-1)?.id === lessonId
  const moduleIdx       = modules.findIndex(m => m.id === moduleInfo?.id)
  const nextModule      = moduleIdx >= 0 && moduleIdx < modules.length - 1 ? modules[moduleIdx + 1] : null

  return (
    <div className="pb-10">
      <LessonTracker lessonId={lessonId} courseId={courseId} />

      {/* Breadcrumb */}
      <div className="mb-5 flex items-center gap-1.5 text-xs text-gray-400">
        <Link href={`/kurse/${courseId}`} className="font-medium transition-colors hover:text-[#b8922a]">
          AI Methode Academy
        </Link>
        <ChevronRight className="h-3 w-3 flex-shrink-0" />
        {moduleTitle && (
          <>
            <Link
              href={`/kurse/${courseId}/modul/${moduleInfo.id}`}
              className="truncate max-w-[120px] transition-colors hover:text-[#b8922a]"
            >
              {moduleTitle}
            </Link>
            <ChevronRight className="h-3 w-3 flex-shrink-0" />
          </>
        )}
        <span className="max-w-[160px] truncate font-medium text-gray-600">{lesson.title}</span>
      </div>

      {/* Zwei-Spalten-Layout */}
      <div className="flex gap-6">

        {/* Linke Spalte */}
        <div className="flex-1 min-w-0 space-y-4">

          {/* Video */}
          {lesson.bunny_video_id && libraryId ? (
            <VideoAutoComplete
              videoId={lesson.bunny_video_id}
              libraryId={libraryId}
              title={lesson.title}
              lessonId={lessonId}
              userId={user!.id}
              initialCompleted={isCompleted}
              moduleTitle={moduleTitle}
              moduleNumber={moduleIdx + 1}
              moduleLessonIds={currentModLessons.map(l => l.id)}
              initialCompletedIds={Array.from(completedIds)}
              courseLessonIds={allLessonIds}
            />
          ) : (
            <div className="flex aspect-video items-center justify-center rounded-[18px]"
              style={{ background: 'linear-gradient(135deg, #fdf8ee 0%, #f5e9c8 60%, #eedca0 100%)' }}>
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-md"
                  style={{ boxShadow: '0 4px 24px 0 #b8922a22' }}>
                  <PlayCircle className="h-9 w-9" style={{ color: '#b8922a' }} />
                </div>
                <p className="text-sm font-semibold" style={{ color: '#b8922a' }}>Video wird bald verfügbar</p>
                <p className="mt-1 text-xs text-amber-700/50">Dieses Modul wird gerade produziert</p>
              </div>
            </div>
          )}

          {/* Titel-Card */}
          <div className="card p-5 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex-1 min-w-0">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  {moduleTitle && (
                    <Link
                      href={`/kurse/${courseId}/modul/${moduleInfo.id}`}
                      className="flex items-center gap-1 rounded-full border border-gray-200 bg-gray-50 px-2.5 py-0.5 text-[11px] font-medium text-gray-500 transition-colors hover:border-amber-200 hover:bg-amber-50 hover:text-[#b8922a]"
                    >
                      <Layers className="h-3 w-3" /> {moduleTitle}
                    </Link>
                  )}
                  {lesson.duration_seconds && (
                    <span className="rounded-full border border-gray-200 bg-gray-50 px-2.5 py-0.5 text-[11px] font-medium text-gray-500">
                      {fmtDur(lesson.duration_seconds)} min
                    </span>
                  )}
                  {isCompleted && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-[11px] font-semibold text-green-700">
                      <CheckCircle className="h-3 w-3" /> Abgeschlossen
                    </span>
                  )}
                </div>
                <h1 className="text-xl font-bold leading-snug text-gray-900 sm:text-2xl">{lesson.title}</h1>
                {lesson.description && (
                  <p className="mt-3 text-sm leading-relaxed text-gray-600">{lesson.description}</p>
                )}
              </div>
              <div className="flex-shrink-0 sm:ml-4">
                <ProgressButton
                  lessonId={lessonId}
                  userId={user!.id}
                  initialCompleted={isCompleted}
                  moduleTitle={moduleTitle}
                  moduleNumber={moduleIdx + 1}
                  moduleLessonIds={currentModLessons.map(l => l.id)}
                  initialCompletedIds={Array.from(completedIds)}
                  courseLessonIds={allLessonIds}
                />
              </div>
            </div>
          </div>

          {/* Downloads */}
          {resolvedDownloads.length > 0 && (
            <div className="card p-5">
              <h2 className="mb-4 flex items-center gap-2 text-sm font-bold text-gray-900">
                <Download className="h-4 w-4" style={{ color: '#b8922a' }} />
                Ressourcen &amp; Downloads
                <span className="ml-1 rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-semibold text-gray-500">
                  {resolvedDownloads.length}
                </span>
              </h2>
              <div className="grid gap-2 sm:grid-cols-2">
                {resolvedDownloads.map((dl) => {
                  const fType = dl.file_type as DownloadFileType
                  return (
                    <a
                      key={dl.id}
                      href={dl.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      download
                      className="group flex items-center gap-3 rounded-xl border border-gray-100 bg-white px-4 py-3 text-sm transition-all hover:border-amber-200 hover:bg-amber-50/60 hover:shadow-sm"
                    >
                      {/* File type icon */}
                      <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg ${fileTypeBg(fType)}`}>
                        <FileTypeIcon type={fType} />
                      </div>

                      {/* Name + meta */}
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-sm font-semibold text-gray-800 group-hover:text-[#b8922a] transition-colors">
                          {dl.title}
                        </p>
                        <p className="text-[11px] text-gray-400">
                          {fileTypeLabel(fType)}
                          {fmtSize(dl.file_size) ? ` · ${fmtSize(dl.file_size)}` : ''}
                        </p>
                      </div>

                      {/* Download arrow */}
                      <Download className="h-4 w-4 flex-shrink-0 text-gray-300 transition-colors group-hover:text-[#b8922a]" />
                    </a>
                  )
                })}
              </div>
            </div>
          )}

          {/* Notizen */}
          <LessonNotes lessonId={lessonId} initialContent={noteRow?.content ?? ''} />

          {/* Navigation */}
          <div className="flex items-center justify-between gap-3 border-t border-gray-100 pt-4">
            {prevLesson ? (
              <Link href={`/kurse/${courseId}/lektion/${prevLesson.id}`} className="btn-secondary flex-1 justify-center sm:flex-none">
                <ChevronLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Vorherige Lektion</span>
                <span className="sm:hidden">Zurück</span>
              </Link>
            ) : (
              <Link href={`/kurse/${courseId}/modul/${moduleInfo?.id ?? ''}`} className="btn-secondary flex-1 justify-center sm:flex-none">
                <ChevronLeft className="h-4 w-4" /> Zum Modul
              </Link>
            )}

            {/* Primärer Weiter-Button */}
            {nextLesson ? (
              <Link href={`/kurse/${courseId}/lektion/${nextLesson.id}`} className="btn-primary flex-1 justify-center sm:flex-none">
                <span className="hidden sm:inline">Nächste Lektion</span>
                <span className="sm:hidden">Weiter</span>
                <ChevronRight className="h-4 w-4" />
              </Link>
            ) : isLastInModule && nextModule ? (
              <Link
                href={`/kurse/${courseId}/modul/${nextModule.id}`}
                className="btn-primary flex-1 justify-center sm:flex-none"
              >
                <CheckCircle className="h-4 w-4" />
                <span className="hidden sm:inline">Weiter zu Modul {moduleIdx + 2}</span>
                <span className="sm:hidden">Nächstes Modul</span>
              </Link>
            ) : (
              <Link href={`/kurse/${courseId}`} className="btn-primary flex-1 justify-center sm:flex-none">
                <CheckCircle className="h-4 w-4" /> Kurs abgeschlossen!
              </Link>
            )}
          </div>
        </div>

        {/* Rechte Sidebar */}
        <LessonSidebar
          courseId={courseId}
          currentLessonId={lessonId}
          modules={modules}
          completedIds={Array.from(completedIds)}
        />
      </div>
    </div>
  )
}
