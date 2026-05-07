'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Plus, ChevronDown, Trash2, GripVertical } from 'lucide-react'
import { LessonManager } from './LessonManager'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'

interface Lesson {
  id: string; title: string; description: string | null
  bunny_video_id: string | null; bunny_library_id: string | null
  duration_seconds: number | null; sort_order: number; is_published: boolean
}

interface Module {
  id: string; title: string; description: string | null; sort_order: number; lessons: Lesson[]
}

export function ModuleManager({ courseId, modules: initialModules }: { courseId: string; modules: Module[] }) {
  const router = useRouter()
  const [modules, setModules]   = useState(initialModules)
  const [newTitle, setNewTitle] = useState('')
  const [adding, setAdding]     = useState(false)
  const [openModules, setOpen]  = useState<Set<string>>(new Set(initialModules.slice(0, 1).map(m => m.id)))

  async function addModule() {
    if (!newTitle.trim()) return
    setAdding(true)
    const supabase = createClient()
    const { data } = await supabase.from('modules').insert({
      course_id:  courseId,
      title:      newTitle.trim(),
      sort_order: modules.length,
    }).select().single()
    if (data) setModules(prev => [...prev, { ...data, lessons: [] }])
    setNewTitle('')
    setAdding(false)
    router.refresh()
  }

  async function deleteModule(moduleId: string) {
    if (!confirm('Modul und alle enthaltenen Lektionen wirklich löschen?')) return
    const supabase = createClient()
    await supabase.from('modules').delete().eq('id', moduleId)
    setModules(prev => prev.filter(m => m.id !== moduleId))
    router.refresh()
  }

  function toggleOpen(id: string) {
    setOpen(prev => {
      const next = new Set(prev)
      if (next.has(id)) { next.delete(id) } else { next.add(id) }
      return next
    })
  }

  async function onDragEnd(result: DropResult) {
    if (!result.destination || result.destination.index === result.source.index) return
    const reordered = Array.from(modules)
    const [moved] = reordered.splice(result.source.index, 1)
    reordered.splice(result.destination.index, 0, moved)
    const updated = reordered.map((m, i) => ({ ...m, sort_order: i }))
    setModules(updated)

    const supabase = createClient()
    await Promise.all(updated.map(m => supabase.from('modules').update({ sort_order: m.sort_order }).eq('id', m.id)))
    router.refresh()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Module & Lektionen</h2>
        <span className="text-sm text-gray-500">{modules.length} Module</span>
      </div>

      {/* Neues Modul */}
      <div className="card p-4 bg-gray-50">
        <p className="text-sm font-medium text-gray-700 mb-3">Neues Modul hinzufügen</p>
        <div className="flex gap-2">
          <input
            type="text"
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addModule()}
            className="input flex-1"
            placeholder="Modulname, z.B. Einführung"
          />
          <button onClick={addModule} disabled={adding || !newTitle.trim()} className="btn-primary flex-shrink-0">
            <Plus className="h-4 w-4" />
            Hinzufügen
          </button>
        </div>
      </div>

      {/* Module Liste mit Drag & Drop */}
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="modules">
          {provided => (
            <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-3">
              {modules.map((module, mIdx) => (
                <Draggable key={module.id} draggableId={module.id} index={mIdx}>
                  {(drag, snapshot) => (
                    <div
                      ref={drag.innerRef}
                      {...drag.draggableProps}
                      className={`card overflow-hidden ${snapshot.isDragging ? 'shadow-lg ring-2 ring-brand-200' : ''}`}
                    >
                      <div className="flex w-full items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div {...drag.dragHandleProps} className="cursor-grab text-gray-300 hover:text-gray-400 flex-shrink-0">
                            <GripVertical className="h-4 w-4" />
                          </div>
                          <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">
                            {mIdx + 1}
                          </span>
                          <button
                            onClick={() => toggleOpen(module.id)}
                            className="flex items-center gap-2 flex-1 min-w-0 text-left"
                          >
                            <span className="font-medium text-gray-900 truncate">{module.title}</span>
                            <span className="text-xs text-gray-400 flex-shrink-0">{module.lessons.length} Lektionen</span>
                          </button>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button
                            onClick={() => deleteModule(module.id)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                          <button onClick={() => toggleOpen(module.id)} className="p-1.5">
                            <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${openModules.has(module.id) ? 'rotate-180' : ''}`} />
                          </button>
                        </div>
                      </div>

                      {openModules.has(module.id) && (
                        <div className="border-t border-gray-100 p-4">
                          <LessonManager moduleId={module.id} lessons={module.lessons.sort((a, b) => a.sort_order - b.sort_order)} />
                        </div>
                      )}
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {!modules.length && (
        <div className="text-center py-8 text-gray-400 text-sm">
          Noch keine Module vorhanden. Füge oben ein erstes Modul hinzu.
        </div>
      )}
    </div>
  )
}
