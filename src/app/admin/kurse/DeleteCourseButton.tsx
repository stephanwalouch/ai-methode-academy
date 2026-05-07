'use client'

import { useState, useTransition } from 'react'
import { Trash2 } from 'lucide-react'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { deleteCourse } from '@/app/admin/actions'

interface Props {
  courseId: string
  courseTitle: string
}

export function DeleteCourseButton({ courseId, courseTitle }: Props) {
  const [open, setOpen]       = useState(false)
  const [pending, startTransition] = useTransition()

  function handleConfirm() {
    startTransition(async () => {
      try {
        await deleteCourse(courseId)
        setOpen(false)
      } catch (err) {
        console.error(err)
        alert('Fehler beim Löschen des Kurses.')
        setOpen(false)
      }
    })
  }

  return (
    <>
      <button
        type="button"
        onClick={e => { e.stopPropagation(); e.preventDefault(); setOpen(true) }}
        className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
        title="Kurs löschen"
      >
        <Trash2 className="h-3.5 w-3.5" />
        Löschen
      </button>

      <ConfirmDialog
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={handleConfirm}
        title={`Kurs löschen`}
        description={`„${courseTitle}" wird unwiderruflich gelöscht – inklusive aller Module, Lektionen und Fortschrittsdaten aller Mitglieder.`}
        confirmWord="LÖSCHEN"
        confirmLabel="Kurs endgültig löschen"
        variant="danger"
        loading={pending}
      />
    </>
  )
}
