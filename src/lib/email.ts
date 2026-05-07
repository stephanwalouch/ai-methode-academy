import { Resend } from 'resend'

const FROM = 'AI Methode Academy <noreply@ai-methode.de>'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://ai-methode.de'

// ─────────────────────────────────────────────
// Shared layout helpers
// ─────────────────────────────────────────────

function baseLayout(preheader: string, bodyHtml: string): string {
  return `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>AI Methode Academy</title>
  <!--[if mso]>
  <noscript><xml><o:OfficeDocumentSettings>
    <o:PixelsPerInch>96</o:PixelsPerInch>
  </o:OfficeDocumentSettings></xml></noscript>
  <![endif]-->
</head>
<body style="margin:0;padding:0;background:#f0ede8;font-family:'Inter',Arial,sans-serif;">
  <!-- Preheader -->
  <div style="display:none;max-height:0;overflow:hidden;font-size:1px;color:#f0ede8;">
    ${preheader}&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;
  </div>

  <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
         style="background:#f0ede8;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
             style="max-width:580px;width:100%;">

        <!-- Header -->
        <tr><td style="background:linear-gradient(135deg,#1a0f02 0%,#3b200a 50%,#6b3d10 100%);
                        border-radius:18px 18px 0 0;padding:32px 40px 28px;">
          <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
            <tr>
              <td>
                <img src="https://www.ai-methode.de/logo-aim.png"
                     alt="AI Methode Academy" height="36"
                     style="display:block;height:36px;width:auto;max-width:160px;" />
              </td>
            </tr>
          </table>
        </td></tr>

        <!-- Body card -->
        <tr><td style="background:#ffffff;padding:40px 40px 32px;border-left:1px solid rgba(0,0,0,0.06);
                        border-right:1px solid rgba(0,0,0,0.06);">
          ${bodyHtml}
        </td></tr>

        <!-- Footer -->
        <tr><td style="background:#fdf8ee;border:1px solid rgba(184,146,42,0.15);
                        border-top:none;border-radius:0 0 18px 18px;
                        padding:20px 40px;text-align:center;">
          <p style="margin:0;font-size:12px;color:#9ca3af;line-height:1.6;">
            AI Methode Academy · <a href="${APP_URL}" style="color:#b8922a;text-decoration:none;">ai-methode.de</a><br />
            Du erhältst diese E-Mail, weil du Mitglied der AI Methode Academy bist.
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
}

function goldButton(href: string, label: string): string {
  return `
    <table cellpadding="0" cellspacing="0" role="presentation" style="margin:28px 0;">
      <tr>
        <td style="background:#b8922a;border-radius:12px;">
          <a href="${href}"
             style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:700;
                    color:#ffffff;text-decoration:none;letter-spacing:0.01em;">
            ${label}
          </a>
        </td>
      </tr>
    </table>`
}

function fallbackLink(href: string): string {
  return `<p style="margin:16px 0 0;font-size:13px;color:#9ca3af;">
    Falls der Button nicht funktioniert, kopiere diesen Link in deinen Browser:<br />
    <a href="${href}" style="color:#b8922a;word-break:break-all;font-size:12px;">${href}</a>
  </p>`
}

function divider(): string {
  return `<hr style="border:none;border-top:1px solid #f3f4f6;margin:28px 0;" />`
}

// ─────────────────────────────────────────────
// Email templates
// ─────────────────────────────────────────────

function inviteTemplate(inviteUrl: string, firstName?: string): string {
  const greeting = firstName ? `Hallo ${firstName}!` : 'Herzlich willkommen!'
  const intro = firstName
    ? `du wurdest persönlich zur <strong>AI Methode Academy</strong> eingeladen.`
    : `du wurdest zur <strong>AI Methode Academy</strong> eingeladen.`

  const body = `
    <h1 style="margin:0 0 8px;font-size:24px;font-weight:800;color:#111827;
                letter-spacing:-0.02em;">${greeting}</h1>
    <p style="margin:0 0 4px;font-size:15px;color:#6b7280;">Deine Einladung wartet auf dich.</p>

    ${divider()}

    <p style="margin:0;font-size:15px;color:#374151;line-height:1.7;">
      Sehr gut, ${intro}<br /><br />
      Lerne alles, was du brauchst, um deine eigene <strong>KI-Agentur</strong> aufzubauen –
      Schritt für Schritt, sofort umsetzbar.
    </p>

    ${goldButton(inviteUrl, '🎓 Jetzt Konto erstellen →')}

    <p style="margin:0;font-size:13px;color:#9ca3af;">
      Dieser Einladungslink ist einmalig gültig. Falls du keine Einladung erwartet hast,
      ignoriere diese E-Mail einfach.
    </p>

    ${fallbackLink(inviteUrl)}
  `
  return baseLayout(
    `${firstName ? `${firstName}, deine` : 'Deine'} Einladung zur AI Methode Academy`,
    body
  )
}

function welcomeTemplate(fullName?: string): string {
  const firstName = fullName?.split(' ')[0]
  const greeting  = firstName ? `Willkommen, ${firstName}! 🎉` : 'Willkommen! 🎉'
  const dashboardUrl = `${APP_URL}/dashboard`

  const body = `
    <h1 style="margin:0 0 8px;font-size:24px;font-weight:800;color:#111827;
                letter-spacing:-0.02em;">${greeting}</h1>
    <p style="margin:0 0 4px;font-size:15px;color:#6b7280;">
      Dein Konto wurde erfolgreich erstellt.
    </p>

    ${divider()}

    <p style="margin:0;font-size:15px;color:#374151;line-height:1.7;">
      Schön, dass du dabei bist! Dein Kurs wartet auf dich –
      starte gleich mit der ersten Lektion und lege den Grundstein
      für deine eigene <strong>KI-Agentur</strong>.
    </p>

    ${goldButton(dashboardUrl, '🚀 Zum Dashboard →')}

    <table cellpadding="0" cellspacing="0" role="presentation" width="100%"
           style="background:#fdf8ee;border-radius:12px;border:1px solid rgba(184,146,42,0.2);
                  margin:8px 0 0;">
      <tr><td style="padding:20px 24px;">
        <p style="margin:0 0 12px;font-size:13px;font-weight:700;color:#b8922a;
                   text-transform:uppercase;letter-spacing:0.05em;">Was dich erwartet</p>
        <table cellpadding="0" cellspacing="0" role="presentation">
          <tr>
            <td style="padding:4px 0;font-size:14px;color:#374151;">
              ✦&nbsp; Strukturierter Videokurs in Modulen
            </td>
          </tr>
          <tr>
            <td style="padding:4px 0;font-size:14px;color:#374151;">
              ✦&nbsp; Downloadbare Materialien &amp; Templates
            </td>
          </tr>
          <tr>
            <td style="padding:4px 0;font-size:14px;color:#374151;">
              ✦&nbsp; Persönliche Notizen pro Lektion
            </td>
          </tr>
          <tr>
            <td style="padding:4px 0;font-size:14px;color:#374151;">
              ✦&nbsp; Fortschrittsanzeige &amp; Abschlusszertifikat
            </td>
          </tr>
        </table>
      </td></tr>
    </table>
  `
  return baseLayout(
    `Willkommen bei der AI Methode Academy – dein Kurs wartet!`,
    body
  )
}

function passwordResetTemplate(resetUrl: string, firstName?: string): string {
  const greeting = firstName ? `Hallo ${firstName},` : 'Hallo,'

  const body = `
    <h1 style="margin:0 0 8px;font-size:24px;font-weight:800;color:#111827;
                letter-spacing:-0.02em;">Passwort zurücksetzen</h1>
    <p style="margin:0 0 4px;font-size:15px;color:#6b7280;">
      Wir haben eine Anfrage erhalten.
    </p>

    ${divider()}

    <p style="margin:0;font-size:15px;color:#374151;line-height:1.7;">
      ${greeting}<br /><br />
      wir haben eine Anfrage zum Zurücksetzen deines Passworts erhalten.
      Klicke auf den Button, um ein neues Passwort zu wählen.
    </p>

    ${goldButton(resetUrl, '🔑 Passwort zurücksetzen →')}

    <table cellpadding="0" cellspacing="0" role="presentation" width="100%"
           style="background:#fef2f2;border-radius:10px;border:1px solid #fecaca;
                  margin:8px 0 0;">
      <tr><td style="padding:14px 18px;">
        <p style="margin:0;font-size:13px;color:#dc2626;line-height:1.6;">
          ⚠️ <strong>Nicht du?</strong> Dann ignoriere diese E-Mail einfach –
          dein Passwort bleibt unverändert.<br />
          Dieser Link ist <strong>60 Minuten</strong> gültig.
        </p>
      </td></tr>
    </table>

    ${fallbackLink(resetUrl)}
  `
  return baseLayout(
    `Passwort zurücksetzen für dein AI Methode Academy Konto`,
    body
  )
}

// ─────────────────────────────────────────────
// Send functions
// ─────────────────────────────────────────────

function getResend() {
  const key = process.env.RESEND_API_KEY
  if (!key) throw new Error('RESEND_API_KEY is not set')
  return new Resend(key)
}

export async function sendInviteEmail(opts: {
  to: string
  inviteUrl: string
  firstName?: string
}) {
  const resend = getResend()
  const firstName = opts.firstName?.trim() || undefined
  const subjectName = firstName ? `${firstName}, du` : 'Du'

  return resend.emails.send({
    from: FROM,
    to:   opts.to,
    subject: `${subjectName} wurdest zur AI Methode Academy eingeladen! 🎓`,
    html: inviteTemplate(opts.inviteUrl, firstName),
  })
}

export async function sendWelcomeEmail(opts: {
  to: string
  fullName?: string
}) {
  const resend = getResend()
  const firstName = opts.fullName?.split(' ')[0]
  const subjectName = firstName ? `, ${firstName}` : ''

  return resend.emails.send({
    from: FROM,
    to:   opts.to,
    subject: `Willkommen bei der AI Methode Academy${subjectName}! 🎉`,
    html: welcomeTemplate(opts.fullName),
  })
}

export async function sendPasswordResetEmail(opts: {
  to: string
  resetUrl: string
  firstName?: string
}) {
  const resend = getResend()

  return resend.emails.send({
    from: FROM,
    to:   opts.to,
    subject: `Passwort zurücksetzen – AI Methode Academy`,
    html: passwordResetTemplate(opts.resetUrl, opts.firstName),
  })
}
