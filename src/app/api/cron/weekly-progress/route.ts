import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { Resend } from 'resend'

export const dynamic = 'force-dynamic'

const FROM    = 'AI Methode Academy <noreply@ai-methode.de>'
const APP_URL = 'https://academy.ai-methode.de'

function progressEmail(firstName: string, pct: number, done: number, total: number, nextTitle: string | null): string {
  const bar = Math.round(pct / 5)   // 0–20 blocks
  const filled = '█'.repeat(bar)
  const empty  = '░'.repeat(20 - bar)

  const motivation =
    pct === 0   ? 'Du hast noch nicht begonnen – starte heute deinen ersten Schritt! 🚀' :
    pct < 25    ? 'Ein guter Anfang! Bleib dran und mach weiter. 💪' :
    pct < 50    ? 'Du bist gut dabei! Schon fast auf halbem Weg. 🔥' :
    pct < 75    ? 'Mehr als die Hälfte geschafft – du machst das großartig! ⭐' :
    pct < 100   ? 'Fast am Ziel! Nur noch ein letzter Schub. 🏁' :
                  'Du hast den Kurs abgeschlossen! Lade dein Zertifikat herunter. 🏆'

  const ctaLabel = pct === 0 ? 'Kurs starten' : pct === 100 ? 'Zertifikat herunterladen' : 'Weitermachen'
  const ctaHref  = pct === 100 ? `${APP_URL}/abschluss` : `${APP_URL}/dashboard`

  return `<!DOCTYPE html>
<html lang="de">
<head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/></head>
<body style="margin:0;padding:0;background:#f0ede8;font-family:Arial,sans-serif;">
<div style="display:none;max-height:0;overflow:hidden;font-size:1px;color:#f0ede8;">
  Dein wöchentlicher Fortschritt: ${pct}% abgeschlossen
</div>
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f0ede8;padding:40px 16px;">
<tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">

  <!-- Logo/Header -->
  <tr><td style="background:linear-gradient(135deg,#1a0f02,#3b200a,#b8922a);border-radius:16px 16px 0 0;padding:32px 36px 28px;">
    <img src="https://www.ai-methode.de/logo-aim.png" alt="AI Methode Academy" height="36" style="display:block;margin-bottom:16px;" />
    <p style="margin:0;color:rgba(251,191,36,0.7);font-size:13px;">Hallo ${firstName} 👋</p>
    <h1 style="margin:4px 0 0;color:#fff;font-size:22px;font-weight:900;">Dein wöchentlicher Fortschritt</h1>
  </td></tr>

  <!-- Body -->
  <tr><td style="background:#fff;padding:32px 36px;">

    <!-- Progress -->
    <p style="margin:0 0 8px;font-size:13px;font-weight:700;color:#b8922a;text-transform:uppercase;letter-spacing:1px;">Fortschritt</p>
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:8px;">
      <div style="flex:1;background:#f0ede8;border-radius:8px;height:10px;overflow:hidden;">
        <div style="width:${pct}%;background:linear-gradient(90deg,#b8922a,#d4a93a);height:100%;border-radius:8px;"></div>
      </div>
      <span style="font-size:20px;font-weight:900;color:#b8922a;">${pct}%</span>
    </div>
    <p style="margin:0 0 24px;font-size:13px;color:#9ca3af;">${done} von ${total} Lektionen abgeschlossen</p>

    <!-- Motivation -->
    <p style="margin:0 0 24px;font-size:15px;color:#374151;line-height:1.6;">${motivation}</p>

    ${nextTitle && pct < 100 ? `
    <!-- Next lesson -->
    <div style="background:#fdf8ee;border:1px solid #f5e4b8;border-radius:12px;padding:16px 20px;margin-bottom:28px;">
      <p style="margin:0 0 4px;font-size:11px;font-weight:700;color:#b8922a;text-transform:uppercase;letter-spacing:1px;">Als nächstes</p>
      <p style="margin:0;font-size:14px;font-weight:600;color:#1a1208;">${nextTitle}</p>
    </div>
    ` : ''}

    <!-- CTA -->
    <table cellpadding="0" cellspacing="0"><tr><td style="border-radius:12px;background:linear-gradient(90deg,#b8922a,#c9a030);">
      <a href="${ctaHref}" style="display:inline-block;padding:14px 28px;color:#fff;font-size:14px;font-weight:700;text-decoration:none;">${ctaLabel} →</a>
    </td></tr></table>

  </td></tr>

  <!-- Footer -->
  <tr><td style="background:#f9f6f2;border-radius:0 0 16px 16px;padding:20px 36px;border-top:1px solid #f0ede8;">
    <p style="margin:0;font-size:11px;color:#9ca3af;text-align:center;">
      AI Methode Academy · <a href="${APP_URL}" style="color:#b8922a;text-decoration:none;">academy.ai-methode.de</a>
    </p>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>`
}

export async function GET(request: NextRequest) {
  // Verify cron secret to prevent unauthorized calls
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const resend   = new Resend(process.env.RESEND_API_KEY)
  const supabase = await createClient()

  const [{ data: profiles }, { data: courses }, { data: allProgress }] = await Promise.all([
    supabase.from('profiles').select('id, full_name, email, role').neq('role', 'admin'),
    supabase.from('courses').select('id, modules(id, lessons(id, is_published, title))').eq('is_published', true).order('sort_order').limit(1).single(),
    supabase.from('lesson_progress').select('user_id, lesson_id').limit(50000),
  ])

  if (!profiles?.length) return NextResponse.json({ sent: 0 })

  // Build lesson list
  type Lesson = { id: string; title: string; is_published: boolean }
  type Module = { id: string; lessons: Lesson[] }
  const allLessons = ((courses as unknown as { modules: Module[] } | null)?.modules ?? []).flatMap(m =>
    m.lessons.filter((l: Lesson) => l.is_published)
  )
  const totalLessons = allLessons.length

  // Progress per user
  const progressByUser = new Map<string, Set<string>>()
  allProgress?.forEach(p => {
    if (!progressByUser.has(p.user_id)) progressByUser.set(p.user_id, new Set())
    progressByUser.get(p.user_id)!.add(p.lesson_id)
  })

  let sent = 0
  const errors: string[] = []

  for (const user of profiles) {
    if (!user.email) continue
    const completed = progressByUser.get(user.id) ?? new Set()
    const done = completed.size
    const pct  = totalLessons > 0 ? Math.round((done / totalLessons) * 100) : 0
    const firstName = user.full_name?.split(' ')[0] ?? 'Hey'
    const nextLesson = allLessons.find(l => !completed.has(l.id))

    try {
      await resend.emails.send({
        from: FROM,
        to: user.email,
        subject: `Dein Fortschritt diese Woche: ${pct}% – AI Methode Academy`,
        html: progressEmail(firstName, pct, done, totalLessons, nextLesson?.title ?? null),
      })
      sent++
    } catch (e) {
      errors.push(`${user.email}: ${e instanceof Error ? e.message : String(e)}`)
    }
  }

  return NextResponse.json({ sent, errors: errors.length ? errors : undefined })
}
