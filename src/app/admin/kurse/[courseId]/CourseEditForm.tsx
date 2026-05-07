'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Save } from 'lucide-react'

interface CourseData {
  id: string; title: string; description: string | null
  thumbnail_url: string | null; is_published: boolean; sort_order: number
}

export function CourseEditForm({ course }: { course: CourseData }) {
  const router = useRouter()
  const [title, setTitle]       = useState(course.title)
  const [desc, setDesc]         = useState(course.description ?? '')
  const [thumb, setThumb]       = useState(course.thumbnail_url ?? '')
  const [pub, setPub]           = useState(course.is_published)
  const [order, setOrder]       = useState(course.sort_order)
  const [saving, setSaving]     = useState(false)
  const [saved, setSaved]       = useState(false)

  async function save(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const supabase = createClient()
    await supabase.from('courses').update({
      title:         title.trim(),
      description:   desc.trim() || null,
      thumbnail_url: thumb.trim() || null,
      is_published:  pub,
      sort_order:    order,
    }).eq('id', course.id)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    router.refresh()
  }

  return (
    <div className="card p-6">
      <h2 className="font-semibold text-gray-900 mb-4">Kursdetails</h2>
      <form onSubmit={save} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Titel *</label>
            <input type="text" required value={title} onChange={e => setTitle(e.target.value)} className="input mt-1" />
          </div>
          <div>
            <label className="label">Reihenfolge</label>
            <input type="number" value={order} onChange={e => setOrder(parseInt(e.target.value))} className="input mt-1" />
          </div>
        </div>

        <div>
          <label className="label">Beschreibung</label>
          <textarea value={desc} onChange={e => setDesc(e.target.value)} className="input mt-1 resize-y" rows={3} />
        </div>

        <div>
          <label className="label">Thumbnail-URL</label>
          <input type="url" value={thumb} onChange={e => setThumb(e.target.value)} className="input mt-1" placeholder="https://..." />
        </div>

        <div className="flex items-center gap-3">
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" checked={pub} onChange={e => setPub(e.target.checked)} className="sr-only peer" />
            <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-500"></div>
          </label>
          <span className="text-sm text-gray-700">Kurs veröffentlichen</span>
        </div>

        <button type="submit" disabled={saving} className="btn-primary">
          {saved ? '✓ Gespeichert' : saving ? 'Speichern…' : <><Save className="h-4 w-4" /> Speichern</>}
        </button>
      </form>
    </div>
  )
}
