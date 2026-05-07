'use client'

import { useState } from 'react'
import { ArrowLeft, Mail } from 'lucide-react'
import Link from 'next/link'

export default function PasswortVergessenPage() {
  const [email, setEmail]     = useState('')
  const [sent, setSent]       = useState(false)
  const [error, setError]     = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (!res.ok) throw new Error('Server error')
      setSent(true)
    } catch {
      setError('Es ist ein Fehler aufgetreten. Bitte versuche es erneut.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[#f7f7f5] dark:bg-[#111111]">
      <div className="w-full max-w-md">
        <div className="card p-8">
          <div className="mb-6">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" /> Zurück zum Login
            </Link>
          </div>

          {sent ? (
            <div className="text-center py-4">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-50">
                <Mail className="h-7 w-7 text-green-500" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">E-Mail verschickt</h1>
              <p className="mt-2 text-sm text-gray-500">
                Wir haben dir einen Link zum Zurücksetzen geschickt.<br />
                Bitte überprüfe auch deinen Spam-Ordner.
              </p>
              <Link
                href="/login"
                className="btn-primary mt-6 inline-block w-full text-center"
              >
                Zurück zum Login
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Passwort vergessen?</h1>
                <p className="mt-1 text-sm text-gray-500">
                  Gib deine E-Mail-Adresse ein und wir schicken dir einen Reset-Link.
                </p>
              </div>

              {error && (
                <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 ring-1 ring-red-200">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
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

                <button type="submit" disabled={loading} className="btn-primary w-full">
                  {loading ? 'Wird gesendet…' : 'Reset-Link anfordern'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
