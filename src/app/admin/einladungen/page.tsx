import { createClient } from '@/lib/supabase/server'
import { CreateInviteForm } from './CreateInviteForm'
import { CopyLink } from './CopyLink'
import { CheckCircle, Clock, XCircle } from 'lucide-react'

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('de-DE', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  })
}

export default async function EinladungenPage() {
  const supabase = await createClient()

  const { data: tokens } = await supabase
    .from('invite_tokens')
    .select(`
      id, token, label, use_count, max_uses, expires_at, created_at, used_at,
      used_profile:profiles!invite_tokens_used_by_fkey(full_name, email)
    `)
    .order('created_at', { ascending: false })

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Einladungslinks</h1>
        <p className="mt-1 text-sm text-gray-500">
          Generiere einmalige Links, um neue Mitglieder einzuladen.
        </p>
      </div>

      <div className="card p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Neuen Link erstellen</h2>
        <CreateInviteForm />
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Alle Links ({tokens?.length ?? 0})
        </h2>
        <div className="space-y-3">
          {!tokens?.length && (
            <div className="card p-8 text-center text-gray-400 text-sm">
              Noch keine Einladungslinks erstellt.
            </div>
          )}
          {tokens?.map(token => {
            const used      = (token.use_count ?? 0) >= (token.max_uses ?? 1)
            const expired   = token.expires_at && new Date(token.expires_at) < new Date()
            const status    = used ? 'used' : expired ? 'expired' : 'active'
            const inviteUrl = `${appUrl}/registrieren?token=${token.token}`
            const usedProfile = token.used_profile as unknown as { full_name: string | null; email: string } | null

            return (
              <div key={token.id} className="card p-4">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {status === 'active'  && <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />}
                      {status === 'used'    && <XCircle className="h-4 w-4 text-gray-400 flex-shrink-0" />}
                      {status === 'expired' && <Clock className="h-4 w-4 text-yellow-500 flex-shrink-0" />}
                      <span className="font-medium text-sm text-gray-900">
                        {token.label || `Link vom ${formatDate(token.created_at)}`}
                      </span>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium
                        ${status === 'active'  ? 'bg-green-100 text-green-700' : ''}
                        ${status === 'used'    ? 'bg-gray-100 text-gray-500' : ''}
                        ${status === 'expired' ? 'bg-yellow-100 text-yellow-700' : ''}
                      `}>
                        {status === 'active' ? 'Aktiv' : status === 'used' ? 'Verwendet' : 'Abgelaufen'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 truncate font-mono">{inviteUrl}</p>
                    <div className="mt-1 flex items-center gap-3 text-xs text-gray-400">
                      <span>Nutzungen: {token.use_count}/{token.max_uses}</span>
                      {token.expires_at && <span>· Ablauf: {formatDate(token.expires_at)}</span>}
                      {usedProfile && <span>· Genutzt von: {usedProfile.full_name || usedProfile.email}</span>}
                    </div>
                  </div>
                  {status === 'active' && <CopyLink url={inviteUrl} />}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
