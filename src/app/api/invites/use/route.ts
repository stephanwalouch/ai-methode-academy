import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { sendWelcomeEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  const { token, email } = await request.json()
  if (!token || !email) return NextResponse.json({ ok: false }, { status: 400 })

  const supabase = await createAdminClient()

  // Find the user who just registered
  const { data: { users } } = await supabase.auth.admin.listUsers()
  const user = users?.find((u: { email?: string }) => u.email === email)

  // Mark token as used
  const { data: tokenRow } = await supabase
    .from('invite_tokens')
    .select('use_count')
    .eq('token', token)
    .single()

  await supabase
    .from('invite_tokens')
    .update({
      used_by:   user?.id ?? null,
      used_at:   new Date().toISOString(),
      use_count: (tokenRow?.use_count ?? 0) + 1,
    })
    .eq('token', token)

  // Send welcome email
  const fullName = (user?.user_metadata?.full_name as string | undefined)?.trim()
  try {
    const { error } = await sendWelcomeEmail({ to: email, fullName })
    if (error) console.error('[welcome] Resend error:', error)
  } catch (err) {
    console.error('[welcome] sendWelcomeEmail failed:', err)
  }

  return NextResponse.json({ ok: true })
}
