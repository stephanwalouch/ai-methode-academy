import { createClient } from '@/lib/supabase/server'
import { createAnnouncement } from './actions'
import { AnnouncementList } from './AnnouncementList'
import { Megaphone, PlusCircle } from 'lucide-react'

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

          <AnnouncementList announcements={announcements ?? []} />
      </div>
    </div>
  )
}
