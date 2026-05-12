'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { VideoPlayer } from './VideoPlayer'
import { CompletionToast } from './CompletionToast'

const POS_KEY = (lessonId: string) => `vpos_${lessonId}`
const SAVE_INTERVAL_SEC = 5  // save to localStorage every 5 seconds

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
  const [startAt, setStartAt]     = useState<number | undefined>(undefined)
  const router = useRouter()

  // Read saved position on mount (client-only)
  useEffect(() => {
    try {
      const saved = localStorage.getItem(POS_KEY(lessonId))
      if (saved) {
        const pos = parseFloat(saved)
        if (pos > 5) setStartAt(pos)
      }
    } catch { /* ignore */ }
  }, [lessonId])

  // Track completed IDs in a ref so it stays up-to-date across multiple video completions
  const completedIdsRef = useRef(new Set(initialCompletedIds))

  const lastSavedRef = useRef(0)
  const handleTimeUpdate = useCallback((currentTime: number) => {
    if (currentTime - lastSavedRef.current >= SAVE_INTERVAL_SEC) {
      lastSavedRef.current = currentTime
      try {
        localStorage.setItem(POS_KEY(lessonId), String(currentTime))
      } catch { /* ignore */ }
    }
  }, [lessonId])

  const dismiss = useCallback(() => setToast(null), [])

  const handleEnded = useCallback(async () => {
    if (completed) return
    // Clear saved position when video finishes
    try { localStorage.removeItem(POS_KEY(lessonId)) } catch { /* ignore */ }

    const supabase = createClient()
    const { error } = await supabase
      .from('lesson_progress')
      .upsert({ user_id: userId, lesson_id: lessonId })
    if (!error) {
      completedIdsRef.current.add(lessonId)
      setCompleted(true)
      onCompleted?.()

      // Redirect to congratulations page if all course lessons are done
      if (courseLessonIds.length > 0 && courseLessonIds.every(id => completedIdsRef.current.has(id))) {
        router.push('/abschluss')
        return
      }

      const moduleComplete = moduleLessonIds.length > 0 && moduleLessonIds.every(id => completedIdsRef.current.has(id))
      setToast(moduleComplete ? 'module' : 'lesson')
    }
  }, [completed, lessonId, userId, moduleLessonIds, courseLessonIds, onCompleted, router])

  return (
    <>
      <VideoPlayer
        videoId={videoId}
        libraryId={libraryId}
        title={title}
        startAt={startAt}
        onEnded={handleEnded}
        onTimeUpdate={handleTimeUpdate}
      />
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
