'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, ShieldOff, ShieldCheck } from 'lucide-react'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { deleteUser, banUser, unbanUser } from '@/app/admin/actions'

interface Props {
  userId: string
  userName: string
  isBanned: boolean
}

export function UserActions({ userId, userName, isBanned }: Props) {
  const router = useRouter()
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [banOpen, setBanOpen]       = useState(false)
  const [pending, startTransition]  = useTransition()

  function handleDelete() {
    startTransition(async () => {
      try {
        await deleteUser(userId)
        setDeleteOpen(false)
      } catch (err) {
        console.error(err)
        alert('Fehler beim Löschen des Nutzers.')
        setDeleteOpen(false)
      }
    })
  }

  function handleBan() {
    startTransition(async () => {
      const result = await banUser(userId)
      setBanOpen(false)
      if (result?.error) {
        alert('Fehler beim Sperren:\n' + result.error)
      } else {
        router.refresh()
      }
    })
  }

  function handleUnban() {
    startTransition(async () => {
      const result = await unbanUser(userId)
      if (result?.error) {
        alert('Fehler beim Entsperren:\n' + result.error)
      } else {
        router.refresh()
      }
    })
  }

  return (
    <>
      <div className="flex items-center gap-1">
        {/* Ban / Unban */}
        {isBanned ? (
          <button
            type="button"
            onClick={handleUnban}
            disabled={pending}
            title="Entsperren"
            className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-green-600 hover:bg-green-50 transition-colors disabled:opacity-50"
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            <span className="hidden xl:inline">Entsperren</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setBanOpen(true)}
            disabled={pending}
            title="Sperren"
            className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-amber-600 hover:bg-amber-50 transition-colors disabled:opacity-50"
          >
            <ShieldOff className="h-3.5 w-3.5" />
            <span className="hidden xl:inline">Sperren</span>
          </button>
        )}

        {/* Delete */}
        <button
          type="button"
          onClick={() => setDeleteOpen(true)}
          disabled={pending}
          title="Löschen"
          className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
        >
          <Trash2 className="h-3.5 w-3.5" />
          <span className="hidden xl:inline">Löschen</span>
        </button>
      </div>

      {/* Ban Dialog */}
      <ConfirmDialog
        open={banOpen}
        onClose={() => setBanOpen(false)}
        onConfirm={handleBan}
        title="Nutzer sperren"
        description={`${userName} wird gesperrt und kann sich nicht mehr anmelden. Du kannst die Sperre jederzeit aufheben.`}
        confirmWord="SPERREN"
        confirmLabel="Nutzer sperren"
        variant="warning"
        loading={pending}
      />

      {/* Delete Dialog */}
      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Nutzer löschen"
        description={`${userName} wird unwiderruflich gelöscht – inklusive aller Fortschrittsdaten und Notizen. Dieser Vorgang kann nicht rückgängig gemacht werden.`}
        confirmWord="LÖSCHEN"
        confirmLabel="Nutzer endgültig löschen"
        variant="danger"
        loading={pending}
      />
    </>
  )
}
