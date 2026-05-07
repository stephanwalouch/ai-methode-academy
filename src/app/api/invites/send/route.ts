import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { nanoid } from 'nanoid'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { firstName, lastName, email, label, maxUses = 1, expires } = body

  const supabase = await createAdminClient()
  const { data: { user } } = await supabase.auth.getUser()

  const token   = nanoid(24)
  const appUrl  = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const inviteUrl = `${appUrl}/registrieren?token=${token}`
  const displayName = [firstName, lastName].filter(Boolean).join(' ') || email || 'Mitglied'

  const { error: tokenError } = await supabase.from('invite_tokens').insert({
    token,
    label:      label || (email ? `Einladung für ${displayName}` : `Einladungslink`),
    max_uses:   maxUses,
    expires_at: expires || null,
    created_by: user?.id ?? null,
  })

  if (tokenError) return NextResponse.json({ ok: false, error: tokenError.message }, { status: 500 })

  // E-Mail via Resend – optional
  let emailSent = false
  const resendKey = process.env.RESEND_API_KEY

  if (resendKey && email) {
    const emailRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM_EMAIL ?? 'noreply@ai-methode.de',
        to: email,
        subject: `${firstName ? `Hallo ${firstName}, du` : 'Du'} wurdest eingeladen!`,
        html: `
          <div style="font-family: Inter, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px; background: #f7f7f5;">
            <div style="background: white; border-radius: 18px; padding: 40px; border: 1px solid rgba(0,0,0,0.06);">
              <h1 style="font-size: 24px; font-weight: 700; color: #111; margin: 0 0 8px;">
                ${firstName ? `Hallo ${firstName}!` : 'Herzlich willkommen!'}
              </h1>
              <p style="color: #555; font-size: 16px; line-height: 1.6; margin: 0 0 24px;">
                Du wurdest eingeladen, der <strong>AI Methode</strong> Kursplattform beizutreten.
                Klicke auf den Button, um dein Konto zu erstellen.
              </p>
              <a href="${inviteUrl}"
                style="display: inline-block; background: #b8922a; color: white; font-weight: 600;
                       font-size: 15px; padding: 14px 28px; border-radius: 12px; text-decoration: none;">
                Jetzt registrieren
              </a>
              <p style="margin: 24px 0 0; font-size: 13px; color: #999;">
                Oder kopiere diesen Link: <a href="${inviteUrl}" style="color: #b8922a;">${inviteUrl}</a>
              </p>
              <p style="margin: 16px 0 0; font-size: 12px; color: #bbb;">
                Dieser Link ist einmalig gültig. Falls du keine Einladung erwartet hast, ignoriere diese E-Mail.
              </p>
            </div>
          </div>
        `,
      }),
    })
    emailSent = emailRes.ok
  }

  return NextResponse.json({ ok: true, inviteUrl, emailSent, token })
}
