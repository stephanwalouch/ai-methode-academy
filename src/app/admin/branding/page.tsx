'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Save } from 'lucide-react'

const colorPresets = [
  { name: 'AI Methode', primary: '#b8922a', accent: '#9a7820' },
  { name: 'Blau',       primary: '#3b82f6', accent: '#2563eb' },
  { name: 'Grün',       primary: '#10b981', accent: '#059669' },
  { name: 'Rose',       primary: '#f43f5e', accent: '#e11d48' },
  { name: 'Orange',     primary: '#f97316', accent: '#ea580c' },
  { name: 'Dunkel',     primary: '#1e293b', accent: '#334155' },
]

export default function BrandingPage() {
  const router = useRouter()
  const [name, setName]         = useState('')
  const [logoUrl, setLogoUrl]   = useState('')
  const [primary, setPrimary]   = useState('#b8922a')
  const [accent, setAccent]     = useState('#9a7820')
  const [saving, setSaving]     = useState(false)
  const [saved, setSaved]       = useState(false)
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    createClient().from('branding').select('*').single().then(({ data }) => {
      if (data) {
        setName(data.platform_name)
        setLogoUrl(data.logo_url ?? '')
        setPrimary(data.primary_color)
        setAccent(data.accent_color)
      }
      setLoading(false)
    })
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const supabase = createClient()
    await supabase.from('branding').update({
      platform_name: name.trim(),
      logo_url:      logoUrl.trim() || null,
      primary_color: primary,
      accent_color:  accent,
    }).neq('id', '00000000-0000-0000-0000-000000000000') // Update einzige Zeile

    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    router.refresh()
  }

  if (loading) return <div className="text-gray-400 text-sm">Laden…</div>

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Branding anpassen</h1>
        <p className="mt-1 text-sm text-gray-500">Logo, Name und Farben deiner Plattform einstellen</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Allgemein */}
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Allgemein</h2>

          <div>
            <label className="label">Plattform-Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="input mt-1"
              placeholder="AI Methode"
              required
            />
            <p className="mt-1 text-xs text-gray-400">Wird im Browser-Tab und im Menü angezeigt.</p>
          </div>

          <div>
            <label className="label">Logo-URL (optional)</label>
            <input
              type="url"
              value={logoUrl}
              onChange={e => setLogoUrl(e.target.value)}
              className="input mt-1"
              placeholder="https://deine-domain.de/logo.png"
            />
            {logoUrl && (
              <img src={logoUrl} alt="Logo-Vorschau" className="mt-2 h-10 w-auto object-contain rounded border border-gray-200 p-1" />
            )}
          </div>
        </div>

        {/* Farben */}
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Farben</h2>

          <div>
            <p className="label mb-2">Schnellauswahl</p>
            <div className="flex flex-wrap gap-2">
              {colorPresets.map(p => (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => { setPrimary(p.primary); setAccent(p.accent) }}
                  className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium hover:border-gray-400 transition-colors"
                >
                  <div className="h-4 w-4 rounded-full" style={{ background: p.primary }} />
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Primärfarbe</label>
              <div className="mt-1 flex items-center gap-2">
                <input
                  type="color"
                  value={primary}
                  onChange={e => setPrimary(e.target.value)}
                  className="h-9 w-16 rounded border border-gray-200 cursor-pointer p-0.5"
                />
                <input
                  type="text"
                  value={primary}
                  onChange={e => setPrimary(e.target.value)}
                  className="input flex-1 font-mono text-sm"
                  pattern="^#[0-9a-fA-F]{6}$"
                />
              </div>
            </div>
            <div>
              <label className="label">Akzentfarbe</label>
              <div className="mt-1 flex items-center gap-2">
                <input
                  type="color"
                  value={accent}
                  onChange={e => setAccent(e.target.value)}
                  className="h-9 w-16 rounded border border-gray-200 cursor-pointer p-0.5"
                />
                <input
                  type="text"
                  value={accent}
                  onChange={e => setAccent(e.target.value)}
                  className="input flex-1 font-mono text-sm"
                  pattern="^#[0-9a-fA-F]{6}$"
                />
              </div>
            </div>
          </div>

          {/* Vorschau */}
          <div className="rounded-lg p-4 space-y-2" style={{ background: `${primary}10` }}>
            <p className="text-xs font-medium text-gray-500">Vorschau</p>
            <button type="button" className="rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm" style={{ background: primary }}>
              Primär-Button
            </button>
            <div className="ml-3 inline-flex rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm" style={{ background: accent }}>
              Akzent-Button
            </div>
          </div>
        </div>

        <button type="submit" disabled={saving} className="btn-primary">
          {saved ? '✓ Gespeichert' : saving ? 'Speichern…' : <><Save className="h-4 w-4" /> Änderungen speichern</>}
        </button>
      </form>
    </div>
  )
}
