'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Mail, Link2, Copy, Check, ChevronDown, ChevronUp } from 'lucide-react'

type Mode = 'email' | 'link'

export function CreateInviteForm() {
  const router = useRouter()
  const [mode, setMode]           = useState<Mode>('email')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName]   = useState('')
  const [email, setEmail]         = useState('')
  const [label, setLabel]         = useState('')
  const [maxUses, setMaxUses]     = useState(1)
  const [expires, setExpires]     = useState('')
  const [loading, setLoading]     = useState(false)
  const [result, setResult]       = useState<{ inviteUrl: string; emailSent: boolean } | null>(null)
  const [copied, setCopied]       = useState(false)
  const [showAdvanced, setAdv]    = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setResult(null)

    const body: Record<string, unknown> = {
      maxUses,
      expires: expires || null,
    }

    if (mode === 'email') {
      body.email     = email.trim()
      body.firstName = firstName.trim()
      body.lastName  = lastName.trim()
      body.label     = `${firstName.trim()} ${lastName.trim()}`.trim() || email.trim()
    } else {
      body.label = label.trim() || null
    }

    const res  = await fetch('/api/invites/send', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    const json = await res.json()

    if (json.ok) {
      setResult({ inviteUrl: json.inviteUrl, emailSent: json.emailSent })
      setFirstName(''); setLastName(''); setEmail(''); setLabel('')
      setMaxUses(1); setExpires('')
      router.refresh()
    }
    setLoading(false)
  }

  async function copyUrl(url: string) {
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-5">
      {/* Mode toggle */}
      <div className="flex rounded-xl border border-gray-200 overflow-hidden">
        {(['email', 'link'] as Mode[]).map(m => (
          <button
            key={m}
            onClick={() => { setMode(m); setResult(null) }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-colors
              ${mode === m ? 'text-white' : 'text-gray-500 hover:text-gray-700 bg-white'}`}
            style={mode === m ? { background: '#b8922a' } : {}}
          >
            {m === 'email' ? <><Mail className="h-4 w-4" /> Per E-Mail einladen</> : <><Link2 className="h-4 w-4" /> Link generieren</>}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === 'email' ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <label className="label">Vorname</label>
              <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} className="input mt-1" placeholder="Maria" />
            </div>
            <div>
              <label className="label">Nachname</label>
              <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} className="input mt-1" placeholder="Müller" />
            </div>
            <div>
              <label className="label">E-Mail *</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="input mt-1" placeholder="maria@beispiel.de" required />
            </div>
          </div>
        ) : (
          <div>
            <label className="label">Bezeichnung (optional)</label>
            <input type="text" value={label} onChange={e => setLabel(e.target.value)} className="input mt-1" placeholder="z.B. Für das Team-Event" />
          </div>
        )}

        {/* Advanced */}
        <button type="button" onClick={() => setAdv(v => !v)} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors">
          {showAdvanced ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          Erweiterte Optionen
        </button>
        {showAdvanced && (
          <div className="grid grid-cols-2 gap-3 rounded-xl border border-gray-100 bg-gray-50 p-4">
            <div>
              <label className="label text-xs">Max. Nutzungen</label>
              <input type="number" min={1} max={100} value={maxUses} onChange={e => setMaxUses(parseInt(e.target.value))} className="input mt-1 text-sm" />
            </div>
            <div>
              <label className="label text-xs">Ablaufdatum</label>
              <input type="date" value={expires} onChange={e => setExpires(e.target.value)} className="input mt-1 text-sm" min={new Date().toISOString().split('T')[0]} />
            </div>
          </div>
        )}

        <button type="submit" disabled={loading || (mode === 'email' && !email.trim())} className="btn-primary">
          {loading ? 'Wird erstellt…' : mode === 'email' ? 'Einladung senden' : 'Link erstellen'}
        </button>
      </form>

      {/* Result */}
      {result && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-4 space-y-3">
          {result.emailSent ? (
            <p className="text-sm font-medium text-green-800">E-Mail wurde versandt.</p>
          ) : (
            <p className="text-sm font-medium text-green-800">Einladungslink ist zum Kopieren bereit.</p>
          )}
          <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-white p-3">
            <p className="flex-1 truncate font-mono text-xs text-gray-600">{result.inviteUrl}</p>
            <button onClick={() => copyUrl(result.inviteUrl)} className="flex-shrink-0 rounded-lg p-1.5 text-gray-400 hover:text-green-600 transition-colors">
              {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
