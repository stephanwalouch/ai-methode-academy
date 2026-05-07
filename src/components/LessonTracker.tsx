'use client'

import { useEffect } from 'react'

export function LessonTracker({ lessonId, courseId }: { lessonId: string; courseId: string }) {
  useEffect(() => {
    fetch('/api/last-viewed', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lesson_id: lessonId, course_id: courseId }),
    })
  }, [lessonId, courseId])

  return null
}
