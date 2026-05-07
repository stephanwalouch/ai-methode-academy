'use client'

import { useState, useEffect, useRef } from 'react'
import { StickyNote, Check, Loader2 } from 'lucide-react'

interface LessonNotesProps {
  lessonId: string
  initialContent: string
}

export function LessonNotes({ lessonId, initialContent }: LessonNotesProps) {
  const [content, setContent] = useState(initialContent)
  const [status, setStatus]   = useState<'idle' | 'saving' | 'saved'>('idle')
  const timerRef              = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    setContent(initialContent)
  }, [lessonId, initialContent])

  function handleChange(val: string) {
    setContent(val)
    setStatus('saving')
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => save(val), 1200)
  }

  async function save(val: string) {
    await fetch('/api/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lesson_id: lessonId, content: val }),
    })
    setStatus('saved')
    setTimeout(() => setStatus('idle'), 2000)
  }

  return (
    <div className="card p-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
          <StickyNote className="h-4 w-4" style={{ color: '#b8922a' }} />
          Meine Notizen
        </h3>
        <span className="flex items-center gap-1 text-xs text-gray-400">
          {status === 'saving' && <><Loader2 className="h-3 w-3 animate-spin" /> Speichern…</>}
          {status === 'saved'  && <><Check className="h-3 w-3 text-green-500" /> Gespeichert</>}
        </span>
      </div>
      <textarea
        value={content}
        onChange={e => handleChange(e.target.value)}
        placeholder="Schreibe hier deine persönlichen Notizen zu dieser Lektion…"
        className="input min-h-28 resize-y text-sm leading-relaxed"
        rows={5}
      />
    </div>
  )
}
