import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const supabase = await createAdminClient()

  // Admin-Check
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { subject, message } = await request.json()
  if (!subject?.trim() || !message?.trim()) {
    return NextResponse.json({ error: 'Betreff und Nachricht erforderlich' }, { status: 400 })
  }

  const resendKey = process.env.RESEND_API_KEY
  if (!resendKey) return NextResponse.json({ error: 'RESEND_API_KEY nicht konfiguriert' }, { status: 500 })

  // Alle nicht-Admin Mitglieder laden
  const { data: profiles } = await supabase
    .from('profiles')
    .select('email, full_name')
    .neq('role', 'admin')
    .not('email', 'is', null)

  if (!profiles?.length) return NextResponse.json({ sent: 0, failed: 0 })

  const fromEmail = process.env.RESEND_FROM_EMAIL ?? 'noreply@ai-methode.de'
  const appName   = 'AI Methode Academy'

  // HTML-E-Mail Template
  function buildHtml(name: string, msg: string) {
    const greeting = name ? `Hallo ${name.split(' ')[0]},` : 'Hallo,'
    const lines = msg.split('\n').map(l => l.trim() ? `<p style="margin:0 0 12px">${l}</p>` : '<br/>').join('')
    return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:sans-serif">
  <div style="max-width:560px;margin:32px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 8px #0000000d">
    <div style="background:linear-gradient(135deg,#1a0f02,#3b200a,#b8922a);padding:32px 36px">
      <p style="margin:0;font-size:20px;font-weight:900;color:#fff">${appName}</p>
    </div>
    <div style="padding:32px 36px;color:#374151;font-size:15px;line-height:1.6">
      <p style="margin:0 0 16px;font-weight:600">${greeting}</p>
      ${lines}
    </div>
    <div style="padding:16px 36px 28px;color:#9ca3af;font-size:12px;border-top:1px solid #f3f4f6">
      ${appName} · Diese E-Mail wurde vom Admin gesendet.
    </div>
  </div>
</body>
</html>`
  }

  // Einzeln senden (Resend free tier: 100 E-Mails/Tag)
  let sent = 0
  let failed = 0

  for (const p of profiles) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: `${appName} <${fromEmail}>`,
          to: p.email,
          subject,
          html: buildHtml(p.full_name ?? '', message),
          text: `${p.full_name ? `Hallo ${p.full_name.split(' ')[0]},\n\n` : ''}${message}`,
        }),
      })
      if (res.ok) sent++
      else failed++
    } catch {
      failed++
    }
  }

  return NextResponse.json({ sent, failed })
}
