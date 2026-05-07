'use client'

import { useState } from 'react'
import { CheckCircle, Clock, XCircle, Copy, Check, UserCheck, Send } from 'lucide-react'
import { CopyLink } from './CopyLink'

interface Token {
  id: string
  token: string
  label: string | null
  use_count: number
  max_uses: number
  expires_at: string | null
  created_at: string
  used_at: string | null
  used_profile: { full_name: string | null; email: string } | null
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('de-DE', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  })
}

export function InviteList({ tokens, appUrl }: { tokens: Token[]; appUrl: string }) {
  const [tab, setTab] = useState<'aktiv' | 'archiv'>('aktiv')

  const now = new Date()

  const active = tokens
    .filter(t => {
      const expired = t.expires_at && new Date(t.expires_at) < now
      const used    = t.use_count >= t.max_uses
      return !expired && !used
    })
    .slice(0, 10)

  const archive = tokens.filter(t => {
    const expired = t.expires_at && new Date(t.expires_at) < now
    const used    = t.use_count >= t.max_uses
    return expired || used
  })

  const list = tab === 'aktiv' ? active : archive

  return (
    <div>
      {/* Tabs */}
      <div className="mb-4 flex items-center gap-1 rounded-xl border border-gray-200 bg-gray-50 p-1 w-fit">
        {(['aktiv', 'archiv'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-colors ${
              tab === t
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t === 'aktiv' ? `Aktiv (${active.length})` : `Archiv (${archive.length})`}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-3">
        {list.length === 0 && (
          <div className="card p-8 text-center text-sm text-gray-400">
            {tab === 'aktiv' ? 'Keine aktiven Einladungslinks.' : 'Noch keine archivierten Links.'}
          </div>
        )}

        {list.map(token => {
          const inviteUrl   = `${appUrl}/registrieren?token=${token.token}`
          const usedProfile = token.used_profile as { full_name: string | null; email: string } | null
          const isOpen      = token.use_count === 0
          const expired     = token.expires_at && new Date(token.expires_at) < now

          return (
            <div key={token.id} className="card p-4">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1 min-w-0">

                  {/* Label + Status badge */}
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    {tab === 'aktiv' ? (
                      isOpen ? (
                        <>
                          <Send className="h-4 w-4 text-amber-500 flex-shrink-0" />
                          <span className="font-medium text-sm text-gray-900">
                            {token.label || `Link vom ${formatDate(token.created_at)}`}
                          </span>
                          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                            Offen
                          </span>
                        </>
                      ) : (
                        <>
                          <UserCheck className="h-4 w-4 text-green-500 flex-shrink-0" />
                          <span className="font-medium text-sm text-gray-900">
                            {token.label || `Link vom ${formatDate(token.created_at)}`}
                          </span>
                          <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                            Account erstellt
                          </span>
                        </>
                      )
                    ) : (
                      expired ? (
                        <>
                          <Clock className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                          <span className="font-medium text-sm text-gray-900">
                            {token.label || `Link vom ${formatDate(token.created_at)}`}
                          </span>
                          <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-700">
                            Abgelaufen
                          </span>
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 text-gray-400 flex-shrink-0" />
                          <span className="font-medium text-sm text-gray-900">
                            {token.label || `Link vom ${formatDate(token.created_at)}`}
                          </span>
                          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
                            Verwendet
                          </span>
                        </>
                      )
                    )}
                  </div>

                  {/* URL */}
                  <p className="text-xs text-gray-400 truncate font-mono">{inviteUrl}</p>

                  {/* Meta */}
                  <div className="mt-1 flex items-center gap-3 text-xs text-gray-400 flex-wrap">
                    <span>Nutzungen: {token.use_count}/{token.max_uses}</span>
                    {token.expires_at && (
                      <span>· Ablauf: {formatDate(token.expires_at)}</span>
                    )}
                    {tab === 'archiv' && usedProfile && (
                      <span className="text-gray-500 font-medium">
                        · Genutzt von: {usedProfile.full_name || usedProfile.email}
                      </span>
                    )}
                    {tab === 'archiv' && token.used_at && (
                      <span>· Am {formatDate(token.used_at)}</span>
                    )}
                  </div>
                </div>

                {/* Copy button – only for open active links */}
                {tab === 'aktiv' && isOpen && <CopyLink url={inviteUrl} />}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
