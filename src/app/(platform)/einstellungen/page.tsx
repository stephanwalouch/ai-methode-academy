'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User, Lock, Moon, Sun } from 'lucide-react'
import { useTheme } from '@/components/ThemeProvider'

export default function EinstellungenPage() {
  const { isDark, toggle } = useTheme()
  const [fullName, setFullName]     = useState('')
  const [email, setEmail]           = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [profileMsg, setProfileMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)
  const [pwMsg, setPwMsg]           = useState<{ type: 'ok' | 'err'; text: string } | null>(null)
  const [loading, setLoading]       = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      setEmail(user.email ?? '')
      supabase.from('profiles').select('full_name').eq('id', user.id).single()
        .then(({ data }) => setFullName(data?.full_name ?? ''))
    })
  }, [])

  async function updateProfile(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setProfileMsg(null)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase.from('profiles').update({ full_name: fullName }).eq('id', user!.id)
    setProfileMsg(error ? { type: 'err', text: 'Fehler beim Speichern.' } : { type: 'ok', text: 'Profil gespeichert.' })
    setLoading(false)
  }

  async function updatePassword(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setPwMsg(null)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    setPwMsg(error ? { type: 'err', text: 'Passwort konnte nicht geändert werden.' } : { type: 'ok', text: 'Passwort geändert.' })
    setNewPassword('')
    setLoading(false)
  }

  return (
    <div className="space-y-8 max-w-lg">
      <h1 className="text-2xl font-bold text-gray-900">Einstellungen</h1>

      {/* Profil */}
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50">
            <User className="h-5 w-5 text-brand-600" />
          </div>
          <h2 className="font-semibold text-gray-900">Profil bearbeiten</h2>
        </div>

        {profileMsg && (
          <div className={`mb-4 rounded-lg p-3 text-sm ${profileMsg.type === 'ok' ? 'bg-green-50 text-green-700 ring-1 ring-green-200' : 'bg-red-50 text-red-700 ring-1 ring-red-200'}`}>
            {profileMsg.text}
          </div>
        )}

        <form onSubmit={updateProfile} className="space-y-4">
          <div>
            <label className="label">Name</label>
            <input
              type="text"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              className="input mt-1"
              placeholder="Dein Name"
            />
          </div>
          <div>
            <label className="label">E-Mail-Adresse</label>
            <input type="email" value={email} className="input mt-1 opacity-60" disabled />
            <p className="mt-1 text-xs text-gray-400">E-Mail-Adresse kann nicht geändert werden.</p>
          </div>
          <button type="submit" disabled={loading} className="btn-primary">
            Speichern
          </button>
        </form>
      </div>

      {/* Passwort */}
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50">
            <Lock className="h-5 w-5 text-brand-600" />
          </div>
          <h2 className="font-semibold text-gray-900">Passwort ändern</h2>
        </div>

        {pwMsg && (
          <div className={`mb-4 rounded-lg p-3 text-sm ${pwMsg.type === 'ok' ? 'bg-green-50 text-green-700 ring-1 ring-green-200' : 'bg-red-50 text-red-700 ring-1 ring-red-200'}`}>
            {pwMsg.text}
          </div>
        )}

        <form onSubmit={updatePassword} className="space-y-4">
          <div>
            <label className="label">Neues Passwort</label>
            <input
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              className="input mt-1"
              placeholder="Mindestens 8 Zeichen"
              minLength={8}
              required
            />
          </div>
          <button type="submit" disabled={loading || newPassword.length < 8} className="btn-primary">
            Passwort ändern
          </button>
        </form>
      </div>

      {/* Dark Mode */}
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50">
            {isDark ? <Sun className="h-5 w-5 text-brand-600" /> : <Moon className="h-5 w-5 text-brand-600" />}
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">Erscheinungsbild</h2>
            <p className="text-xs text-gray-500">Wird in deinem Konto gespeichert</p>
          </div>
        </div>

        <button
          type="button"
          onClick={async () => {
            toggle()
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
              await supabase.from('profiles').update({ dark_mode: !isDark }).eq('id', user.id)
            }
          }}
          className={`relative flex w-full items-center justify-between rounded-xl border p-4 text-left transition-colors ${
            isDark
              ? 'border-[#b8922a]/40 bg-[#1c1611]'
              : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${isDark ? 'bg-[#2a2010]' : 'bg-white border border-gray-200'}`}>
              {isDark ? <Moon className="h-5 w-5 text-[#d4a843]" /> : <Sun className="h-5 w-5 text-amber-500" />}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">{isDark ? 'Dunkel-Modus aktiv' : 'Hell-Modus aktiv'}</p>
              <p className="text-xs text-gray-500">{isDark ? 'Klicken um zum Hell-Modus zu wechseln' : 'Klicken um zum Dunkel-Modus zu wechseln'}</p>
            </div>
          </div>
          {/* Toggle pill */}
          <div className={`relative h-6 w-11 rounded-full transition-colors ${isDark ? 'bg-[#b8922a]' : 'bg-gray-200'}`}>
            <div className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${isDark ? 'translate-x-5' : 'translate-x-0.5'}`} />
          </div>
        </button>
      </div>

      {/* Datenschutz */}
      <div className="card p-5 bg-gray-50">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Datenschutz (DSGVO)</h3>
        <p className="text-xs text-gray-500 leading-relaxed">
          Deine Daten werden ausschließlich zur Bereitstellung der Kursplattform verwendet.
          Du kannst jederzeit die Löschung deiner Daten beantragen. Wende dich dazu an den Administrator.
        </p>
      </div>
    </div>
  )
}
