import { createClient } from '@/lib/supabase/server'
import { createAnnouncement, toggleAnnouncement, deleteAnnouncement } from './actions'
import { Megaphone, Trash2, ToggleLeft, ToggleRight, PlusCircle } from 'lucide-react'

export default async function AnkuendigungenPage() {
  const supabase = await createClient()
  const { data: announcements } = await supabase
    .from('announcements')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-8">

      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: '#fdf8ee' }}>
            <Megaphone className="h-5 w-5" style={{ color: '#b8922a' }} />
          </div>
          <h1 className="text-2xl font-black text-gray-900">Ankündigungen</h1>
        </div>
        <p className="text-sm text-gray-500 ml-12">
          Aktive Ankündigungen erscheinen als Banner oben auf dem Dashboard aller User.
          Es kann jeweils nur eine Ankündigung aktiv sein.
        </p>
      </div>

      {/* Create form */}
      <div className="card p-6">
        <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-gray-900">
          <PlusCircle className="h-4 w-4" style={{ color: '#b8922a' }} />
          Neue Ankündigung erstellen
        </h2>
        <form action={createAnnouncement} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500">
              Titel
            </label>
            <input
              name="title"
              required
              maxLength={120}
              placeholder="z. B. Neues Video verfügbar!"
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition focus:border-[#b8922a] focus:ring-2 focus:ring-[#b8922a]/20 dark:border-gray-700 dark:bg-[#1e1e1e] dark:text-gray-100"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500">
              Nachricht
            </label>
            <textarea
              name="body"
              required
              rows={3}
              maxLength={500}
              placeholder="z. B. Modul 3 Lektion 5 ist jetzt online. Schau es dir gleich an!"
              className="w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition focus:border-[#b8922a] focus:ring-2 focus:ring-[#b8922a]/20 dark:border-gray-700 dark:bg-[#1e1e1e] dark:text-gray-100"
            />
          </div>
          <button type="submit" className="btn-primary">
            Ankündigung erstellen
          </button>
        </form>
      </div>

      {/* List */}
      <div>
        <h2 className="mb-3 text-base font-bold text-gray-900">
          Alle Ankündigungen
          {announcements && announcements.length > 0 && (
            <span className="ml-2 text-sm font-normal text-gray-400">({announcements.length})</span>
          )}
        </h2>

        {!announcements || announcements.length === 0 ? (
          <div className="card flex flex-col items-center justify-center py-12 text-center">
            <Megaphone className="mb-3 h-10 w-10 text-gray-200" />
            <p className="text-sm font-medium text-gray-400">Noch keine Ankündigungen</p>
            <p className="mt-1 text-xs text-gray-300">Erstelle deine erste Ankündigung oben.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {announcements.map((a) => (
              <div
                key={a.id}
                className={`card flex items-start gap-4 p-5 transition-all ${
                  a.is_active ? 'border-amber-300 bg-amber-50/60 dark:border-amber-700/50 dark:bg-amber-900/10' : ''
                }`}
              >
                {/* Status dot */}
                <div className="mt-0.5 flex-shrink-0">
                  <div className={`h-2.5 w-2.5 rounded-full ${a.is_active ? 'bg-green-500' : 'bg-gray-300'}`} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-gray-900 text-sm">{a.title}</p>
                    {a.is_active && (
                      <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-[11px] font-semibold text-green-700 dark:bg-green-900/30 dark:text-green-400">
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
                </div>

                {/* Actions */}
                <div className="flex flex-shrink-0 items-center gap-2">
                  {/* Toggle */}
                  <form
                    action={async () => {
                      'use server'
                      await toggleAnnouncement(a.id, !a.is_active)
                    }}
                  >
                    <button
                      type="submit"
                      title={a.is_active ? 'Deaktivieren' : 'Aktivieren'}
                      className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                        a.is_active
                          ? 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50'
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
                      }`}
                    >
                      {a.is_active
                        ? <><ToggleRight className="h-3.5 w-3.5" /> Aktiv</>
                        : <><ToggleLeft className="h-3.5 w-3.5" /> Inaktiv</>
                      }
                    </button>
                  </form>

                  {/* Delete */}
                  <form
                    action={async () => {
                      'use server'
                      await deleteAnnouncement(a.id)
                    }}
                  >
                    <button
                      type="submit"
                      title="Löschen"
                      className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
