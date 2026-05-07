'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Eye, EyeOff, CheckCircle } from 'lucide-react'

export default function PasswortResetPage() {
  const router = useRouter()
  const [password, setPassword]   = useState('')
  const [confirm, setConfirm]     = useState('')
  const [showPw, setShowPw]       = useState(false)
  const [showCf, setShowCf]       = useState(false)
  const [error, setError]         = useState<string | null>(null)
  const [loading, setLoading]     = useState(false)
  const [done, setDone]           = useState(false)
  const [ready, setReady]         = useState(false)

  useEffect(() => {
    // Supabase redirects with #access_token in the URL hash.
    // The client SDK picks this up automatically on auth state change.
    const supabase = createClient()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setReady(true)
    })
    return () => subscription.unsubscribe()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (password.length < 8) {
      setError('Das Passwort muss mindestens 8 Zeichen lang sein.')
      return
    }
    if (password !== confirm) {
      setError('Die Passwörter stimmen nicht überein.')
      return
    }
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })
    setLoading(false)
    if (error) {
      setError('Das Passwort konnte nicht geändert werden. Bitte fordere einen neuen Link an.')
      return
    }
    setDone(true)
    setTimeout(() => router.push('/dashboard'), 2500)
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-[#f7f7f5] dark:bg-[#111111]">
        <div className="w-full max-w-md">
          <div className="card p-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-50">
              <CheckCircle className="h-7 w-7 text-green-500" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">Passwort geändert</h1>
            <p className="mt-2 text-sm text-gray-500">Du wirst automatisch weitergeleitet…</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[#f7f7f5] dark:bg-[#111111]">
      <div className="w-full max-w-md">
        <div className="card p-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Neues Passwort</h1>
            <p className="mt-1 text-sm text-gray-500">
              Wähle ein sicheres Passwort mit mindestens 8 Zeichen.
            </p>
          </div>

          {!ready && (
            <div className="mb-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-700 ring-1 ring-amber-200">
              Link wird geprüft… Falls diese Meldung bleibt, fordere einen neuen Reset-Link an.
            </div>
          )}

          {error && (
            <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 ring-1 ring-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="password" className="label">Neues Passwort</label>
              <div className="relative mt-1">
                <input
                  id="password"
                  type={showPw ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="input pr-10"
                  placeholder="Mindestens 8 Zeichen"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPw(!showPw)}
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirm" className="label">Passwort bestätigen</label>
              <div className="relative mt-1">
                <input
                  id="confirm"
                  type={showCf ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  className="input pr-10"
                  placeholder="Passwort wiederholen"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowCf(!showCf)}
                >
                  {showCf ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading || !ready} className="btn-primary w-full">
              {loading ? 'Wird gespeichert…' : 'Passwort speichern'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
