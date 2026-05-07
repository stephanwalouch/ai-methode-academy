import { createClient } from '@/lib/supabase/server'
import { CreateInviteForm } from './CreateInviteForm'
import { InviteList } from './InviteList'

export default async function EinladungenPage() {
  const supabase = await createClient()

  const { data: tokens } = await supabase
    .from('invite_tokens')
    .select(`
      id, token, label, use_count, max_uses, expires_at, created_at, used_at,
      used_profile:profiles!invite_tokens_used_by_fkey(full_name, email)
    `)
    .order('created_at', { ascending: false })

  const appUrl = 'https://academy.ai-methode.de'

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
        <InviteList tokens={(tokens ?? []) as unknown as Parameters<typeof InviteList>[0]['tokens']} appUrl={appUrl} />
      </div>
    </div>
  )
}
