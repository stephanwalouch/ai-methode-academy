'use client'

import { useState } from 'react'
import { Trash2, ToggleLeft, ToggleRight, Pencil, Check, X } from 'lucide-react'
import { toggleAnnouncement, deleteAnnouncement, updateAnnouncement } from './actions'

interface Announcement {
  id: string; title: string; body: string; is_active: boolean; created_at: string
}

export function AnnouncementList({ announcements }: { announcements: Announcement[] }) {
  const [editId, setEditId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editBody, setEditBody] = useState('')
  const [saving, setSaving] = useState(false)

  function startEdit(a: Announcement) {
    setEditId(a.id)
    setEditTitle(a.title)
    setEditBody(a.body)
  }

  async function saveEdit(id: string) {
    setSaving(true)
    await updateAnnouncement(id, editTitle, editBody)
    setEditId(null)
    setSaving(false)
  }

  if (!announcements.length) {
    return (
      <div className="card flex flex-col items-center justify-center py-12 text-center">
        <p className="text-sm font-medium text-gray-400">Noch keine Ankündigungen</p>
        <p className="mt-1 text-xs text-gray-300">Erstelle deine erste Ankündigung oben.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {announcements.map(a => (
        <div key={a.id}
          className={`card flex items-start gap-4 p-5 transition-all ${
            a.is_active ? 'border-amber-300 bg-amber-50/60 dark:border-amber-700/50 dark:bg-amber-900/10' : ''
          }`}>
          <div className="mt-0.5 flex-shrink-0">
            <div className={`h-2.5 w-2.5 rounded-full ${a.is_active ? 'bg-green-500' : 'bg-gray-300'}`} />
          </div>

          <div className="flex-1 min-w-0">
            {editId === a.id ? (
              <div className="space-y-2">
                <input
                  value={editTitle}
                  onChange={e => setEditTitle(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-bold text-gray-900 outline-none focus:border-[#b8922a] focus:ring-2 focus:ring-[#b8922a]/20"
                />
                <textarea
                  value={editBody}
                  onChange={e => setEditBody(e.target.value)}
                  rows={2}
                  className="w-full resize-none rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 outline-none focus:border-[#b8922a] focus:ring-2 focus:ring-[#b8922a]/20"
                />
                <div className="flex gap-2">
                  <button onClick={() => saveEdit(a.id)} disabled={saving}
                    className="flex items-center gap-1 rounded-lg bg-[#b8922a] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#a07820]">
                    <Check className="h-3.5 w-3.5" /> Speichern
                  </button>
                  <button onClick={() => setEditId(null)}
                    className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-500 hover:bg-gray-50">
                    <X className="h-3.5 w-3.5" /> Abbrechen
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-bold text-gray-900 text-sm">{a.title}</p>
                  {a.is_active && (
                    <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-[11px] font-semibold text-green-700">
                      Aktiv
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm leading-relaxed text-gray-500">{a.body}</p>
                <p className="mt-2 text-[11px] text-gray-400">
                  {new Date(a.created_at).toLocaleDateString('de-DE', {
                    day: '2-digit', month: '2-digit', year: 'numeric',
                    hour: '2-digit', minute: '2-digit',
                  })}
                </p>
              </>
            )}
          </div>

          {editId !== a.id && (
            <div className="flex flex-shrink-0 items-center gap-2">
              <button onClick={() => startEdit(a)}
                className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-blue-50 hover:text-blue-500">
                <Pencil className="h-4 w-4" />
              </button>
              <form action={toggleAnnouncement.bind(null, a.id, !a.is_active)}>
                <button type="submit"
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                    a.is_active
                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}>
                  {a.is_active ? <><ToggleRight className="h-3.5 w-3.5" /> Aktiv</> : <><ToggleLeft className="h-3.5 w-3.5" /> Inaktiv</>}
                </button>
              </form>
              <form action={deleteAnnouncement.bind(null, a.id)}>
                <button type="submit"
                  className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500">
                  <Trash2 className="h-4 w-4" />
                </button>
              </form>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
