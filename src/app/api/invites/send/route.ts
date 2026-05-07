import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { sendInviteEmail } from '@/lib/email'
import { nanoid } from 'nanoid'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { firstName, lastName, email, label, maxUses = 1, expires } = body

  const supabase = await createAdminClient()
  const { data: { user } } = await supabase.auth.getUser()

  const token      = nanoid(24)
  const appUrl     = 'https://academy.ai-methode.de'
  const inviteUrl  = `${appUrl}/registrieren?token=${token}`
  const displayName = [firstName, lastName].filter(Boolean).join(' ') || email || 'Mitglied'

  const { error: tokenError } = await supabase.from('invite_tokens').insert({
    token,
    label:      label || (email ? `Einladung für ${displayName}` : 'Einladungslink'),
    max_uses:   maxUses,
    expires_at: expires || null,
    created_by: user?.id ?? null,
  })

  if (tokenError) {
    return NextResponse.json({ ok: false, error: tokenError.message }, { status: 500 })
  }

  // Send invite email via Resend (only when an email address was provided)
  let emailSent = false
  if (email) {
    try {
      const { error } = await sendInviteEmail({
        to:        email,
        inviteUrl,
        firstName: firstName?.trim() || undefined,
      })
      emailSent = !error
      if (error) console.error('[invite] Resend error:', error)
    } catch (err) {
      console.error('[invite] sendInviteEmail failed:', err)
    }
  }

  return NextResponse.json({ ok: true, inviteUrl, emailSent, token })
}
