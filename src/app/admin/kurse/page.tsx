import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus, PlayCircle, ChevronRight, Layers } from 'lucide-react'
import { TogglePublished } from './TogglePublished'
import { DeleteCourseButton } from './DeleteCourseButton'

export default async function AdminKursePage() {
  const supabase = await createClient()

  const { data: courses } = await supabase
    .from('courses')
    .select(`
      id, title, description, is_published, sort_order, created_at,
      modules(id, lessons(id))
    `)
    .order('sort_order')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kurse verwalten</h1>
          <p className="mt-1 text-sm text-gray-500">{courses?.length ?? 0} Kurs{courses?.length !== 1 ? 'e' : ''}</p>
        </div>
        <Link href="/admin/kurse/neu" className="btn-primary">
          <Plus className="h-4 w-4" />
          Neuer Kurs
        </Link>
      </div>

      {!courses?.length ? (
        <div className="card p-12 text-center">
          <PlayCircle className="h-12 w-12 mx-auto mb-4 text-gray-200" />
          <p className="text-gray-500 font-medium">Noch keine Kurse angelegt</p>
          <Link href="/admin/kurse/neu" className="btn-primary mt-4 inline-flex">
            <Plus className="h-4 w-4" />
            Ersten Kurs erstellen
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {courses.map(course => {
            const modules     = course.modules as { id: string; lessons: { id: string }[] }[]
            const lessonCount = modules.reduce((acc, m) => acc + m.lessons.length, 0)

            return (
              <div key={course.id} className="card overflow-hidden">
                <Link
                  href={`/admin/kurse/${course.id}`}
                  className="flex items-center gap-4 p-5 hover:bg-gray-50/50 transition-colors"
                >
                  {/* Icon */}
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl"
                    style={{ background: course.is_published ? '#fdf8ee' : '#f3f4f6' }}>
                    <PlayCircle className="h-6 w-6" style={{ color: course.is_published ? '#b8922a' : '#9ca3af' }} />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <p className="font-semibold text-gray-900">{course.title}</p>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold
                        ${course.is_published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {course.is_published ? '● Veröffentlicht' : '○ Entwurf'}
                      </span>
                    </div>
                    {course.description && (
                      <p className="mt-0.5 text-sm text-gray-500 truncate">{course.description}</p>
                    )}
                    <div className="mt-2 flex items-center gap-4 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <Layers className="h-3.5 w-3.5" />
                        {modules.length} Module
                      </span>
                      <span className="flex items-center gap-1">
                        <PlayCircle className="h-3.5 w-3.5" />
                        {lessonCount} Lektionen
                      </span>
                    </div>
                  </div>

                  <ChevronRight className="h-5 w-5 flex-shrink-0 text-gray-300" />
                </Link>

                {/* Footer bar – stoppt Bubbling */}
                <div className="border-t border-gray-100 px-5 py-3 flex items-center justify-between bg-gray-50/30">
                  <div className="flex items-center gap-3">
                    <p className="text-xs text-gray-400">
                      {course.is_published
                        ? 'Kurs ist für Mitglieder sichtbar'
                        : 'Kurs ist noch nicht veröffentlicht'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <DeleteCourseButton courseId={course.id} courseTitle={course.title} />
                    <TogglePublished courseId={course.id} isPublished={course.is_published} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
