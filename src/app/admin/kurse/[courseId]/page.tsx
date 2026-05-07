import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ExternalLink, Layers, PlayCircle } from 'lucide-react'
import { CourseEditForm } from './CourseEditForm'
import { ModuleManager } from './ModuleManager'

export default async function AdminKursDetailPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params
  const supabase = await createClient()

  const { data: course } = await supabase
    .from('courses')
    .select(`
      id, title, description, thumbnail_url, is_published, sort_order,
      modules(
        id, title, description, sort_order,
        lessons(id, title, description, bunny_video_id, bunny_library_id, duration_seconds, sort_order, is_published)
      )
    `)
    .eq('id', courseId)
    .single()

  if (!course) notFound()

  type Lesson = {
    id: string; title: string; description: string | null
    bunny_video_id: string | null; bunny_library_id: string | null
    duration_seconds: number | null; sort_order: number; is_published: boolean
  }
  type Module = { id: string; title: string; description: string | null; sort_order: number; lessons: Lesson[] }

  const modules = (course.modules as Module[]).sort((a, b) => a.sort_order - b.sort_order)
  const totalLessons = modules.reduce((acc, m) => acc + m.lessons.length, 0)

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-start gap-4">
        <Link href="/admin/kurse" className="mt-1 flex-shrink-0 rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-gray-900 leading-tight">{course.title}</h1>
          <div className="mt-1.5 flex flex-wrap items-center gap-3 text-sm text-gray-500">
            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold
              ${course.is_published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
              {course.is_published ? '● Veröffentlicht' : '○ Entwurf'}
            </span>
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <Layers className="h-3.5 w-3.5" /> {modules.length} Module
            </span>
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <PlayCircle className="h-3.5 w-3.5" /> {totalLessons} Lektionen
            </span>
            {course.is_published && (
              <Link
                href={`/kurse/${course.id}`}
                target="_blank"
                className="flex items-center gap-1 text-xs hover:underline"
                style={{ color: '#b8922a' }}
              >
                <ExternalLink className="h-3 w-3" /> Kursvorschau
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Kursdetails bearbeiten */}
      <CourseEditForm course={{
        id:            course.id,
        title:         course.title,
        description:   course.description,
        thumbnail_url: course.thumbnail_url,
        is_published:  course.is_published,
        sort_order:    course.sort_order,
      }} />

      {/* Module & Lektionen */}
      <ModuleManager courseId={courseId} modules={modules} />
    </div>
  )
}
