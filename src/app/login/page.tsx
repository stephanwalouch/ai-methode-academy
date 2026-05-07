'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw]     = useState(false)
  const [error, setError]       = useState<string | null>(null)
  const [loading, setLoading]   = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const supabase = createClient()
    const { data: signInData, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError('E-Mail oder Passwort ist falsch.')
      setLoading(false)
      return
    }

    // Check if user is banned
    if (signInData?.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_banned')
        .eq('id', signInData.user.id)
        .single()

      if (profile?.is_banned) {
        await supabase.auth.signOut()
        setError('Dein Konto wurde vorübergehend gesperrt. Bitte wende dich an: info@ai-methode.de')
        setLoading(false)
        return
      }
    }

    // Reset theme to light on every login – dark mode must be explicitly re-enabled
    try {
      localStorage.removeItem('theme')
      document.documentElement.classList.remove('dark')
    } catch {}
    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[#f7f7f5] dark:bg-[#111111]">
      <div className="w-full max-w-md">
        <div className="card overflow-hidden">

          {/* ── Mobile-only gold header ──────────────────────────────── */}
          <div
            className="sm:hidden px-8 py-7 text-center"
            style={{ background: 'linear-gradient(135deg, #1a0f02 0%, #3b200a 50%, #b8922a 100%)' }}
          >
            <img
              src="https://www.ai-methode.de/logo-aim.png"
              alt="AI Methode"
              className="mx-auto mb-3 h-10 w-auto object-contain opacity-90"
              onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
            />
            <p className="text-base font-bold text-white">AI Methode Academy</p>
            <p className="mt-0.5 text-xs text-amber-300/70">Dein Weg zur eigenen KI-Agentur</p>
          </div>

          {/* ── Form body ────────────────────────────────────────────── */}
          <div className="p-6 sm:p-8">
          <div className="text-center mb-6 sm:mb-8">
            {/* Logo only on desktop – hidden on mobile (shown in gold header above) */}
            <img
              src="https://www.ai-methode.de/logo-aim.png"
              alt="AI Methode"
              className="hidden sm:block mx-auto mb-5 h-12 w-auto object-contain"
              onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
            />
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Willkommen in der<br />AI Methode Academy</h1>
            <p className="mt-1 text-sm text-gray-500">Melde dich mit deinen Zugangsdaten an</p>
          </div>

          {error && (
            <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 ring-1 ring-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
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
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="label">Passwort</label>
                <a href="/passwort-vergessen" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
                  Passwort vergessen?
                </a>
              </div>
              <div className="relative mt-1">
                <input
                  id="password"
                  type={showPw ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="input pr-10"
                  placeholder="••••••••"
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

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Anmelden…' : 'Anmelden'}
            </button>

            <p className="mt-3 text-center text-xs text-gray-400">
              Mit der Anmeldung stimmst du unserer{' '}
              <a href="/datenschutz" className="underline hover:text-gray-600 transition-colors">
                Datenschutzerklärung
              </a>{' '}
              zu.
            </p>
          </form>

          <p className="mt-6 text-center text-xs text-gray-400">
            Noch kein Konto? Du benötigst einen Einladungslink.
          </p>
          </div>{/* end form body */}
        </div>

        <div className="mt-4 flex items-center justify-center gap-3 text-xs text-gray-300">
          <a href="/impressum" className="hover:text-gray-500 transition-colors">Impressum</a>
          <span>·</span>
          <a href="/datenschutz" className="hover:text-gray-500 transition-colors">Datenschutz</a>
        </div>
      </div>
    </div>
  )
}
