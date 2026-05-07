import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const { token, email } = await request.json()
  if (!token || !email) return NextResponse.json({ ok: false }, { status: 400 })

  const supabase = await createAdminClient()

  // Nutzer-ID aus E-Mail ermitteln
  const { data: { users } } = await supabase.auth.admin.listUsers()
  const user = users?.find((u: { email?: string }) => u.email === email)

  await supabase
    .from('invite_tokens')
    .update({
      used_by:   user?.id ?? null,
      used_at:   new Date().toISOString(),
      use_count: (await supabase.from('invite_tokens').select('use_count').eq('token', token).single()).data?.use_count + 1,
    })
    .eq('token', token)

  return NextResponse.json({ ok: true })
}
