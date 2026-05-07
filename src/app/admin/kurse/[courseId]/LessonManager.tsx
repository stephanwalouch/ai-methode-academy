'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Plus, Trash2, Edit2, Check, X, Eye, EyeOff, GripVertical, Paperclip, ChevronDown } from 'lucide-react'
import { LessonResourceManager } from '@/components/admin/LessonResourceManager'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'

interface Lesson {
  id: string; title: string; description: string | null
  bunny_video_id: string | null; bunny_library_id: string | null
  duration_seconds: number | null; sort_order: number; is_published: boolean
}

export function LessonManager({ moduleId, lessons: initial }: { moduleId: string; lessons: Lesson[] }) {
  const router = useRouter()
  const [lessons, setLessons]     = useState(initial)
  const [editId, setEditId]       = useState<string | null>(null)
  const [resourcesId, setResourcesId] = useState<string | null>(null)
  const [newForm, setNewForm]     = useState(false)
  const [form, setForm]           = useState({ title: '', description: '', bunny_video_id: '', bunny_library_id: '', duration_seconds: '' })
  const [saving, setSaving]       = useState(false)

  async function addLesson() {
    if (!form.title.trim()) return
    setSaving(true)
    const supabase = createClient()
    const { data } = await supabase.from('lessons').insert({
      module_id:       moduleId,
      title:           form.title.trim(),
      description:     form.description.trim() || null,
      bunny_video_id:  form.bunny_video_id.trim() || null,
      bunny_library_id: form.bunny_library_id.trim() || null,
      duration_seconds: form.duration_seconds ? parseInt(form.duration_seconds) : null,
      sort_order:      lessons.length,
      is_published:    true,
    }).select().single()
    if (data) setLessons(prev => [...prev, data])
    setForm({ title: '', description: '', bunny_video_id: '', bunny_library_id: '', duration_seconds: '' })
    setNewForm(false)
    setSaving(false)
    router.refresh()
  }

  async function deleteLesson(id: string) {
    if (!confirm('Lektion wirklich löschen?')) return
    const supabase = createClient()
    await supabase.from('lessons').delete().eq('id', id)
    setLessons(prev => prev.filter(l => l.id !== id))
    router.refresh()
  }

  async function togglePublish(lesson: Lesson) {
    const supabase = createClient()
    await supabase.from('lessons').update({ is_published: !lesson.is_published }).eq('id', lesson.id)
    setLessons(prev => prev.map(l => l.id === lesson.id ? { ...l, is_published: !l.is_published } : l))
    router.refresh()
  }

  async function saveEdit(lesson: Lesson) {
    setSaving(true)
    const supabase = createClient()
    await supabase.from('lessons').update({
      title:            form.title.trim() || lesson.title,
      description:      form.description.trim() || null,
      bunny_video_id:   form.bunny_video_id.trim() || null,
      bunny_library_id: form.bunny_library_id.trim() || null,
      duration_seconds: form.duration_seconds ? parseInt(form.duration_seconds) : null,
    }).eq('id', lesson.id)
    setLessons(prev => prev.map(l => l.id === lesson.id ? {
      ...l,
      title:            form.title.trim() || l.title,
      description:      form.description.trim() || null,
      bunny_video_id:   form.bunny_video_id.trim() || null,
      bunny_library_id: form.bunny_library_id.trim() || null,
      duration_seconds: form.duration_seconds ? parseInt(form.duration_seconds) : null,
    } : l))
    setEditId(null)
    setSaving(false)
    router.refresh()
  }

  function startEdit(lesson: Lesson) {
    setEditId(lesson.id)
    setForm({
      title:            lesson.title,
      description:      lesson.description ?? '',
      bunny_video_id:   lesson.bunny_video_id ?? '',
      bunny_library_id: lesson.bunny_library_id ?? '',
      duration_seconds: lesson.duration_seconds?.toString() ?? '',
    })
  }

  async function onDragEnd(result: DropResult) {
    if (!result.destination || result.destination.index === result.source.index) return
    const reordered = Array.from(lessons)
    const [moved] = reordered.splice(result.source.index, 1)
    reordered.splice(result.destination.index, 0, moved)
    const updated = reordered.map((l, i) => ({ ...l, sort_order: i }))
    setLessons(updated)

    const supabase = createClient()
    await Promise.all(updated.map(l => supabase.from('lessons').update({ sort_order: l.sort_order }).eq('id', l.id)))
    router.refresh()
  }

  return (
    <div className="space-y-3">
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId={`lessons-${moduleId}`}>
          {provided => (
            <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-2">
              {lessons.map((lesson, idx) => (
                <Draggable key={lesson.id} draggableId={lesson.id} index={idx} isDragDisabled={editId === lesson.id}>
                  {(drag, snapshot) => (
                    <div
                      ref={drag.innerRef}
                      {...drag.draggableProps}
                      className={`rounded-lg border ${snapshot.isDragging ? 'border-brand-300 shadow-lg' : editId === lesson.id ? 'border-brand-200 bg-brand-50' : 'border-gray-100 bg-white'} p-3`}
                    >
                      {editId === lesson.id ? (
                        <div className="space-y-3">
                          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <div>
                              <label className="label text-xs">Titel *</label>
                              <input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="input mt-0.5 text-sm" />
                            </div>
                            <div>
                              <label className="label text-xs">Dauer (Sekunden)</label>
                              <input type="number" value={form.duration_seconds} onChange={e => setForm(f => ({ ...f, duration_seconds: e.target.value }))} className="input mt-0.5 text-sm" placeholder="z.B. 600" />
                            </div>
                            <div>
                              <label className="label text-xs">Bunny Video-ID</label>
                              <input type="text" value={form.bunny_video_id} onChange={e => setForm(f => ({ ...f, bunny_video_id: e.target.value }))} className="input mt-0.5 text-sm font-mono" placeholder="abc123..." />
                            </div>
                            <div>
                              <label className="label text-xs">Bunny Library-ID (optional)</label>
                              <input type="text" value={form.bunny_library_id} onChange={e => setForm(f => ({ ...f, bunny_library_id: e.target.value }))} className="input mt-0.5 text-sm font-mono" placeholder="Überschreibt Env-Variable" />
                            </div>
                          </div>
                          <div>
                            <label className="label text-xs">Beschreibung</label>
                            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="input mt-0.5 text-sm resize-none" rows={2} />
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => saveEdit(lesson)} disabled={saving} className="btn-primary text-xs py-1.5">
                              <Check className="h-3.5 w-3.5" /> Speichern
                            </button>
                            <button onClick={() => setEditId(null)} className="btn-secondary text-xs py-1.5">
                              <X className="h-3.5 w-3.5" /> Abbrechen
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-0">
                          <div className="flex items-center gap-2">
                            <div {...drag.dragHandleProps} className="cursor-grab text-gray-300 hover:text-gray-400 flex-shrink-0">
                              <GripVertical className="h-4 w-4" />
                            </div>
                            <span className="text-xs text-gray-400 w-5 text-center flex-shrink-0">{idx + 1}</span>
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-medium ${lesson.is_published ? 'text-gray-900' : 'text-gray-400'}`}>
                                {lesson.title}
                                {lesson.bunny_video_id && <span className="ml-2 text-xs text-brand-500 font-normal">▶ Video</span>}
                              </p>
                              {lesson.duration_seconds && (
                                <p className="text-xs text-gray-400">{Math.floor(lesson.duration_seconds / 60)} min</p>
                              )}
                            </div>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              <button
                                onClick={() => setResourcesId(id => id === lesson.id ? null : lesson.id)}
                                title="Ressourcen verwalten"
                                className={`p-1.5 rounded transition-colors ${resourcesId === lesson.id ? 'bg-amber-50 text-amber-600' : 'text-gray-400 hover:text-amber-500 hover:bg-amber-50'}`}
                              >
                                <Paperclip className="h-3.5 w-3.5" />
                              </button>
                              <button onClick={() => togglePublish(lesson)} title={lesson.is_published ? 'Verstecken' : 'Zeigen'} className="p-1.5 rounded text-gray-400 hover:text-brand-500 hover:bg-brand-50 transition-colors">
                                {lesson.is_published ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                              </button>
                              <button onClick={() => startEdit(lesson)} className="p-1.5 rounded text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-colors">
                                <Edit2 className="h-3.5 w-3.5" />
                              </button>
                              <button onClick={() => deleteLesson(lesson.id)} className="p-1.5 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Resources panel */}
                          {resourcesId === lesson.id && (
                            <div className="mt-3 rounded-lg border border-amber-100 bg-amber-50/50 p-3">
                              <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-amber-700">
                                <Paperclip className="h-3 w-3" />
                                Ressourcen &amp; Downloads
                                <button
                                  onClick={() => setResourcesId(null)}
                                  className="ml-auto text-amber-400 hover:text-amber-600"
                                >
                                  <ChevronDown className="h-3.5 w-3.5" />
                                </button>
                              </div>
                              <LessonResourceManager lessonId={lesson.id} />
                            </div>
                          )}
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

      {/* Neue Lektion */}
      {newForm ? (
        <div className="rounded-lg border-2 border-dashed border-brand-200 bg-brand-50 p-3 space-y-3">
          <p className="text-xs font-semibold text-brand-700">Neue Lektion</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="label text-xs">Titel *</label>
              <input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="input mt-0.5 text-sm" placeholder="Lektionsname" autoFocus />
            </div>
            <div>
              <label className="label text-xs">Dauer (Sekunden)</label>
              <input type="number" value={form.duration_seconds} onChange={e => setForm(f => ({ ...f, duration_seconds: e.target.value }))} className="input mt-0.5 text-sm" placeholder="z.B. 600 = 10 min" />
            </div>
            <div>
              <label className="label text-xs">Bunny Video-ID</label>
              <input type="text" value={form.bunny_video_id} onChange={e => setForm(f => ({ ...f, bunny_video_id: e.target.value }))} className="input mt-0.5 text-sm font-mono" placeholder="Video-ID aus Bunny Dashboard" />
            </div>
            <div>
              <label className="label text-xs">Bunny Library-ID (optional)</label>
              <input type="text" value={form.bunny_library_id} onChange={e => setForm(f => ({ ...f, bunny_library_id: e.target.value }))} className="input mt-0.5 text-sm font-mono" />
            </div>
          </div>
          <div>
            <label className="label text-xs">Beschreibung</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="input mt-0.5 text-sm resize-none" rows={2} />
          </div>
          <div className="flex gap-2">
            <button onClick={addLesson} disabled={saving || !form.title.trim()} className="btn-primary text-xs py-1.5">
              <Check className="h-3.5 w-3.5" /> Lektion hinzufügen
            </button>
            <button onClick={() => { setNewForm(false); setForm({ title: '', description: '', bunny_video_id: '', bunny_library_id: '', duration_seconds: '' }) }} className="btn-secondary text-xs py-1.5">
              <X className="h-3.5 w-3.5" /> Abbrechen
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setNewForm(true)}
          className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-200 py-3 text-sm text-gray-400 hover:border-brand-300 hover:text-brand-500 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Lektion hinzufügen
        </button>
      )}
    </div>
  )
}
