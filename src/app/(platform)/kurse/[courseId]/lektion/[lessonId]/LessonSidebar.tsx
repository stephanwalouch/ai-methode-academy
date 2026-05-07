'use client'

import Link from 'next/link'
import { useState } from 'react'
import { CheckCircle, Circle, PlayCircle, X, ListVideo } from 'lucide-react'
import { clsx } from 'clsx'

interface Lesson { id: string; title: string; sort_order: number }
interface Module  { id: string; title: string; sort_order: number; lessons: Lesson[] }

interface Props {
  courseId: string
  currentLessonId: string
  modules: Module[]
  completedIds: string[]
}

export function LessonSidebar({ courseId, currentLessonId, modules, completedIds }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const completedSet = new Set(completedIds)
  const allLessons = modules.flatMap(m => m.lessons)
  const done  = allLessons.filter(l => completedSet.has(l.id)).length
  const total = allLessons.length

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Kursinhalt</p>
        <span className="text-xs text-gray-400">{done}/{total}</span>
      </div>
      <div className="flex-1 overflow-y-auto">
        {modules.map((module, mIdx) => {
          const modLessons = module.lessons.sort((a, b) => a.sort_order - b.sort_order)
          return (
            <div key={module.id}>
              <p className="sticky top-0 bg-gray-50 px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400 border-b border-gray-100">
                {mIdx + 1}. {module.title}
              </p>
              {modLessons.map((lesson) => {
                const completed = completedSet.has(lesson.id)
                const isCurrent = lesson.id === currentLessonId
                return (
                  <Link
                    key={lesson.id}
                    href={`/kurse/${courseId}/lektion/${lesson.id}`}
                    onClick={() => setMobileOpen(false)}
                    className={clsx(
                      'flex items-center gap-2.5 px-4 py-2.5 text-xs transition-colors border-b border-gray-50',
                      isCurrent  ? 'bg-amber-50 font-semibold' : 'hover:bg-gray-50',
                      completed && !isCurrent ? 'text-gray-400' : 'text-gray-700'
                    )}
                  >
                    {completed
                      ? <CheckCircle className="h-3.5 w-3.5 flex-shrink-0 text-green-500" />
                      : isCurrent
                        ? <PlayCircle className="h-3.5 w-3.5 flex-shrink-0" style={{ color: '#b8922a' }} />
                        : <Circle className="h-3.5 w-3.5 flex-shrink-0 text-gray-200" />}
                    <span className={clsx('flex-1 leading-tight', completed && !isCurrent && 'line-through decoration-gray-300')}
                      style={isCurrent ? { color: '#b8922a' } : {}}>
                      {lesson.title}
                    </span>
                  </Link>
                )
              })}
            </div>
          )
        })}
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden xl:flex w-72 flex-shrink-0">
        <div className="card sticky top-4 w-full overflow-hidden" style={{ maxHeight: 'calc(100vh - 6rem)' }}>
          <SidebarContent />
        </div>
      </aside>

      {/* Mobile: Floating Button + Sheet */}
      <div className="xl:hidden">
        <button
          onClick={() => setMobileOpen(true)}
          className="fixed bottom-6 right-4 z-40 flex items-center gap-2 rounded-full px-4 py-3 text-sm font-semibold text-white shadow-lg"
          style={{ background: '#b8922a' }}
        >
          <ListVideo className="h-4 w-4" />
          <span className="hidden sm:inline">Lektionen</span>
          <span className="rounded-full bg-white/20 px-1.5 text-xs">{done}/{total}</span>
        </button>

        {mobileOpen && (
          <div className="fixed inset-0 z-50 flex flex-col" style={{ background: 'rgba(0,0,0,0.4)' }} onClick={() => setMobileOpen(false)}>
            <div className="mt-auto h-[75vh] bg-white rounded-t-2xl flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <p className="font-semibold text-gray-900">Lektionen</p>
                <button onClick={() => setMobileOpen(false)} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                <SidebarContent />
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
