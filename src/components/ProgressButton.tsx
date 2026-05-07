'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { CheckCircle, Circle } from 'lucide-react'
import { CompletionToast } from './CompletionToast'

interface ProgressButtonProps {
  lessonId: string
  userId: string
  initialCompleted: boolean
  moduleTitle?: string
  moduleNumber?: number
  moduleLessonIds?: string[]
  initialCompletedIds?: string[]
  courseLessonIds?: string[]
  onToggle?: (completed: boolean) => void
}

export function ProgressButton({
  lessonId, userId, initialCompleted,
  moduleTitle, moduleNumber, moduleLessonIds = [], initialCompletedIds = [],
  courseLessonIds = [],
  onToggle,
}: ProgressButtonProps) {
  const [completed, setCompleted] = useState(initialCompleted)
  const [loading, setLoading]     = useState(false)
  const [toast, setToast]         = useState<'lesson' | 'module' | null>(null)
  const router = useRouter()

  const dismiss = useCallback(() => setToast(null), [])

  async function toggle() {
    setLoading(true)
    const supabase = createClient()

    if (completed) {
      await supabase.from('lesson_progress').delete().eq('user_id', userId).eq('lesson_id', lessonId)
      setCompleted(false)
      onToggle?.(false)
    } else {
      await supabase.from('lesson_progress').upsert({ user_id: userId, lesson_id: lessonId })
      setCompleted(true)
      onToggle?.(true)

      const nowCompleted = new Set([...initialCompletedIds, lessonId])

      // Redirect to congratulations page if all course lessons are done
      if (courseLessonIds.length > 0 && courseLessonIds.every(id => nowCompleted.has(id))) {
        router.push('/abschluss')
        return
      }

      // Check module completion: all other module lessons already done + this one now done
      const moduleComplete = moduleLessonIds.length > 0 && moduleLessonIds.every(id => nowCompleted.has(id))
      setToast(moduleComplete ? 'module' : 'lesson')
    }
    setLoading(false)
  }

  return (
    <>
      <button
        onClick={toggle}
        disabled={loading}
        className={`btn-${completed ? 'secondary' : 'primary'} transition-all w-full sm:w-auto`}
      >
        {completed
          ? <><CheckCircle className="h-4 w-4 text-green-500" /> Als unerledigt markieren</>
          : <><Circle className="h-4 w-4" /> Als abgeschlossen markieren</>
        }
      </button>

      {toast && (
        <CompletionToast
          type={toast}
          moduleTitle={moduleTitle}
          moduleNumber={moduleNumber}
          onDismiss={dismiss}
        />
      )}
    </>
  )
}
