'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function NeuerKursPage() {
  const router = useRouter()
  const [title, setTitle]         = useState('')
  const [description, setDesc]    = useState('')
  const [thumbnailUrl, setThumb]  = useState('')
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState<string | null>(null)

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { data, error } = await supabase.from('courses').insert({
      title:         title.trim(),
      description:   description.trim() || null,
      thumbnail_url: thumbnailUrl.trim() || null,
      created_by:    user!.id,
      is_published:  false,
    }).select('id').single()

    if (error) { setError('Fehler beim Erstellen des Kurses.'); setLoading(false); return }
    router.push(`/admin/kurse/${data.id}`)
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/kurse" className="text-gray-400 hover:text-gray-600">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Neuer Kurs</h1>
      </div>

      <div className="card p-6">
        {error && <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 ring-1 ring-red-200">{error}</div>}

        <form onSubmit={handleCreate} className="space-y-5">
          <div>
            <label className="label">Kurstitel *</label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="input mt-1"
              placeholder="z.B. JavaScript für Einsteiger"
            />
          </div>

          <div>
            <label className="label">Beschreibung</label>
            <textarea
              value={description}
              onChange={e => setDesc(e.target.value)}
              className="input mt-1 resize-y"
              rows={4}
              placeholder="Was lernen die Teilnehmer in diesem Kurs?"
            />
          </div>

          <div>
            <label className="label">Thumbnail-URL (optional)</label>
            <input
              type="url"
              value={thumbnailUrl}
              onChange={e => setThumb(e.target.value)}
              className="input mt-1"
              placeholder="https://..."
            />
          </div>

          <p className="text-sm text-gray-500">
            Nach dem Erstellen kannst du Module und Lektionen hinzufügen.
          </p>

          <div className="flex gap-3">
            <button type="submit" disabled={loading || !title.trim()} className="btn-primary">
              {loading ? 'Wird erstellt…' : 'Kurs erstellen'}
            </button>
            <Link href="/admin/kurse" className="btn-secondary">Abbrechen</Link>
          </div>
        </form>
      </div>
    </div>
  )
}
