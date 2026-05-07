'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { VideoPlayer } from './VideoPlayer'
import { CompletionToast } from './CompletionToast'

interface Props {
  videoId: string
  libraryId: string
  title: string
  lessonId: string
  userId: string
  initialCompleted: boolean
  moduleTitle?: string
  moduleNumber?: number
  moduleLessonIds?: string[]
  initialCompletedIds?: string[]
  courseLessonIds?: string[]
  onCompleted?: () => void
}

export function VideoAutoComplete({
  videoId, libraryId, title, lessonId, userId, initialCompleted,
  moduleTitle, moduleNumber, moduleLessonIds = [], initialCompletedIds = [],
  courseLessonIds = [],
  onCompleted,
}: Props) {
  const [completed, setCompleted] = useState(initialCompleted)
  const [toast, setToast]         = useState<'lesson' | 'module' | null>(null)
  const router = useRouter()

  const dismiss = useCallback(() => setToast(null), [])

  const handleEnded = useCallback(async () => {
    if (completed) return
    const supabase = createClient()
    const { error } = await supabase
      .from('lesson_progress')
      .upsert({ user_id: userId, lesson_id: lessonId })
    if (!error) {
      setCompleted(true)
      onCompleted?.()
      const nowCompleted = new Set([...initialCompletedIds, lessonId])

      // Redirect to congratulations page if all course lessons are done
      if (courseLessonIds.length > 0 && courseLessonIds.every(id => nowCompleted.has(id))) {
        router.push('/abschluss')
        return
      }

      const moduleComplete = moduleLessonIds.length > 0 && moduleLessonIds.every(id => nowCompleted.has(id))
      setToast(moduleComplete ? 'module' : 'lesson')
    }
  }, [completed, lessonId, userId, moduleLessonIds, initialCompletedIds, courseLessonIds, onCompleted, router])

  return (
    <>
      <VideoPlayer videoId={videoId} libraryId={libraryId} title={title} onEnded={handleEnded} />
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
