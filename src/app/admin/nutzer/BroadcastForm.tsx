'use client'

import { useState, useCallback } from 'react'
import { Send, X, Users, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'

interface Props {
  userCount: number
}

export function BroadcastForm({ userCount }: Props) {
  const [open, setOpen]       = useState(false)
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [status, setStatus]   = useState<'idle' | 'sending' | 'success' | 'error'>('idle')
  const [result, setResult]   = useState<{ sent: number; failed: number } | null>(null)

  const close = useCallback(() => {
    if (status === 'sending') return
    setOpen(false)
    setTimeout(() => { setStatus('idle'); setResult(null) }, 300)
  }, [status])

  async function send() {
    if (!subject.trim() || !message.trim()) return
    setStatus('sending')
    try {
      const res = await fetch('/api/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject: subject.trim(), message: message.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Fehler')
      setResult({ sent: data.sent, failed: data.failed ?? 0 })
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="btn-secondary flex items-center gap-2"
      >
        <Send className="h-4 w-4" />
        Nachricht senden
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={close}>
          <div
            className="w-full max-w-lg rounded-2xl bg-white shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Nachricht an alle senden</h2>
                <p className="mt-0.5 flex items-center gap-1.5 text-xs text-gray-400">
                  <Users className="h-3.5 w-3.5" />
                  {userCount} Mitglieder erhalten diese E-Mail
                </p>
              </div>
              <button onClick={close} disabled={status === 'sending'}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">

              {status === 'success' && result && (
                <div className="flex items-start gap-3 rounded-xl bg-green-50 border border-green-100 px-4 py-3">
                  <CheckCircle className="h-5 w-5 flex-shrink-0 text-green-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-green-800">
                      {result.sent} E-Mail{result.sent !== 1 ? 's' : ''} erfolgreich gesendet!
                    </p>
                    {result.failed > 0 && (
                      <p className="text-xs text-green-600 mt-0.5">{result.failed} fehlgeschlagen</p>
                    )}
                  </div>
                </div>
              )}

              {status === 'error' && (
                <div className="flex items-center gap-3 rounded-xl bg-red-50 border border-red-100 px-4 py-3">
                  <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-500" />
                  <p className="text-sm text-red-700">Fehler beim Senden. Bitte prüfe den RESEND_API_KEY.</p>
                </div>
              )}

              {status !== 'success' && (
                <>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Betreff
                    </label>
                    <input
                      type="text"
                      value={subject}
                      onChange={e => setSubject(e.target.value)}
                      placeholder="z.B. Neue Videos verfügbar 🎬"
                      disabled={status === 'sending'}
                      className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-100 disabled:bg-gray-50"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Nachricht
                    </label>
                    <textarea
                      value={message}
                      onChange={e => setMessage(e.target.value)}
                      placeholder="Hallo,&#10;&#10;ich wollte euch informieren dass..."
                      rows={6}
                      disabled={status === 'sending'}
                      className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-100 disabled:bg-gray-50 resize-none"
                    />
                    <p className="mt-1 text-xs text-gray-400">
                      Der Name des Empfängers wird automatisch eingefügt.
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 border-t border-gray-100 px-6 py-4">
              <button onClick={close} disabled={status === 'sending'}
                className="btn-secondary">
                {status === 'success' ? 'Schließen' : 'Abbrechen'}
              </button>
              {status !== 'success' && (
                <button
                  onClick={send}
                  disabled={!subject.trim() || !message.trim() || status === 'sending'}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {status === 'sending'
                    ? <><Loader2 className="h-4 w-4 animate-spin" /> Wird gesendet…</>
                    : <><Send className="h-4 w-4" /> An alle senden</>
                  }
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
