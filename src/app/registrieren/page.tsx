'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react'

function RegisterForm() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const token        = searchParams.get('token') ?? ''

  const [tokenStatus, setTokenStatus] = useState<'prüfen' | 'gültig' | 'ungültig'>('prüfen')
  const [fullName, setFullName]       = useState('')
  const [email, setEmail]             = useState('')
  const [password, setPassword]       = useState('')
  const [showPw, setShowPw]           = useState(false)
  const [error, setError]             = useState<string | null>(null)
  const [loading, setLoading]         = useState(false)

  useEffect(() => {
    async function checkToken() {
      if (!token) { setTokenStatus('ungültig'); return }
      const res = await fetch(`/api/invites/validate?token=${token}`)
      const data = await res.json()
      setTokenStatus(data.valid ? 'gültig' : 'ungültig')
    }
    checkToken()
  }, [token])

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    if (tokenStatus !== 'gültig') return
    setError(null)
    setLoading(true)
    const supabase = createClient()

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    })

    if (signUpError) {
      if (signUpError.message.includes('already registered')) {
        setError('Diese E-Mail-Adresse ist bereits registriert.')
      } else {
        setError('Registrierung fehlgeschlagen. Bitte versuche es erneut.')
      }
      setLoading(false)
      return
    }

    // Token als verwendet markieren
    await fetch('/api/invites/use', {
      method: 'POST',
      body: JSON.stringify({ token, email }),
      headers: { 'Content-Type': 'application/json' },
    })

    router.push('/dashboard')
    router.refresh()
  }

  if (tokenStatus === 'prüfen') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#f7f7f5' }}>
        <div className="card p-8 text-center">
          <div className="animate-pulse text-gray-500">Einladungslink wird geprüft…</div>
        </div>
      </div>
    )
  }

  if (tokenStatus === 'ungültig') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#f7f7f5' }}>
        <div className="card p-8 text-center max-w-md w-full">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900">Ungültiger Einladungslink</h1>
          <p className="mt-2 text-sm text-gray-500">
            Dieser Einladungslink ist ungültig, abgelaufen oder wurde bereits verwendet.
            Bitte kontaktiere den Administrator.
          </p>
          <a href="/login" className="btn-secondary mt-6 inline-block">
            Zur Anmeldung
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-50 to-brand-100 px-4">
      <div className="w-full max-w-md">
        <div className="card p-8">
          <div className="text-center mb-8">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-green-100">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="text-xs font-medium text-green-600 mb-3">Einladung bestätigt</div>
              <img
              src="https://www.ai-methode.de/logo-aim.png"
              alt="AI Methode"
              className="mx-auto mb-5 h-12 w-auto object-contain"
              onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
            />
            <h1 className="text-2xl font-bold text-gray-900">Konto erstellen</h1>
            <p className="mt-1 text-sm text-gray-500">Erstelle dein persönliches Konto</p>
          </div>

          {error && (
            <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 ring-1 ring-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-5">
            <div>
              <label htmlFor="fullName" className="label">Vollständiger Name</label>
              <input
                id="fullName"
                type="text"
                required
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                className="input mt-1"
                placeholder="Max Mustermann"
              />
            </div>

            <div>
              <label htmlFor="email" className="label">E-Mail-Adresse</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="input mt-1"
                placeholder="deine@email.de"
              />
            </div>

            <div>
              <label htmlFor="password" className="label">Passwort</label>
              <div className="relative mt-1">
                <input
                  id="password"
                  type={showPw ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  minLength={8}
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
              <p className="mt-1 text-xs text-gray-400">Mindestens 8 Zeichen</p>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Konto wird erstellt…' : 'Konto erstellen'}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-gray-400">
            Hast du bereits ein Konto?{' '}
            <a href="/login" className="text-brand-600 hover:underline font-medium">Anmelden</a>
          </p>
        </div>

        <p className="mt-4 text-center text-xs text-gray-400">
          Durch die Registrierung stimmst du unserer Datenschutzerklärung zu. Deine Daten werden
          DSGVO-konform verarbeitet.
        </p>
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  )
}
