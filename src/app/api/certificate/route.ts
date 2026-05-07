import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'

export const dynamic = 'force-dynamic'

const LOGO_URL = 'https://www.ai-methode.de/logo-aim.png'

const GOLD   = rgb(0.722, 0.573, 0.165)  // #b8922a
const GOLD_L = rgb(0.831, 0.667, 0.290)  // #d4aa4a
const DARK   = rgb(0.102, 0.071, 0.008)  // #1a1208
const GRAY   = rgb(0.420, 0.447, 0.502)  // #6b7280
const LGRAY  = rgb(0.898, 0.918, 0.929)  // #e5e7eb
const WHITE  = rgb(1, 1, 1)

interface Lesson { id: string; is_published: boolean }
interface Module { id: string; lessons: Lesson[] }
interface Course { title: string; modules: Module[] }

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const [{ data: profile }, { data: courses }, { data: progress }] = await Promise.all([
      supabase.from('profiles').select('full_name').eq('id', user.id).single(),
      supabase.from('courses')
        .select('title, modules(id, lessons(id, is_published))')
        .eq('is_published', true)
        .order('sort_order')
        .limit(1)
        .single(),
      supabase.from('lesson_progress').select('lesson_id').eq('user_id', user.id),
    ])

    const course = courses as unknown as Course | null

    // Verify course is completed
    const allLessonIds = (course?.modules ?? []).flatMap(m =>
      m.lessons.filter(l => l.is_published).map(l => l.id)
    )
    const completedIds = new Set(progress?.map(p => p.lesson_id) ?? [])
    const allDone = allLessonIds.length > 0 && allLessonIds.every(id => completedIds.has(id))
    if (!allDone) return NextResponse.json({ error: 'Course not completed' }, { status: 403 })

    const fullName    = profile?.full_name ?? user.email ?? 'Absolvent'
    const courseTitle = course?.title ?? 'AI Methode Academy'
    const issuedAt    = new Date().toLocaleDateString('de-DE', { day: '2-digit', month: 'long', year: 'numeric' })

    // ── Build PDF ────────────────────────────────────────────────
    const pdfDoc = await PDFDocument.create()
    const page   = pdfDoc.addPage([841.89, 595.28])  // A4 landscape
    const { width, height } = page.getSize()

    const fontBold     = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
    const fontReg      = await pdfDoc.embedFont(StandardFonts.Helvetica)
    const fontOblique  = await pdfDoc.embedFont(StandardFonts.HelveticaBoldOblique)
    const fontSigName  = await pdfDoc.embedFont(StandardFonts.TimesRomanBoldItalic)
    const fontSigTitle = await pdfDoc.embedFont(StandardFonts.TimesRomanItalic)

    // Fetch & embed logo
    let logoImage: Awaited<ReturnType<typeof pdfDoc.embedPng>> | null = null
    try {
      const logoRes = await fetch(LOGO_URL)
      if (logoRes.ok) {
        const logoBytes = await logoRes.arrayBuffer()
        logoImage = await pdfDoc.embedPng(logoBytes)
      }
    } catch { /* logo optional */ }

    // ── Background ───────────────────────────────────────────────
    page.drawRectangle({ x: 0, y: 0, width, height, color: WHITE })

    // ── Gold border bars ─────────────────────────────────────────
    page.drawRectangle({ x: 0, y: height - 10, width, height: 10, color: GOLD })
    page.drawRectangle({ x: 0, y: 0, width, height: 10, color: GOLD })
    page.drawRectangle({ x: 0, y: 10, width: 5, height: height - 20, color: GOLD_L })
    page.drawRectangle({ x: width - 5, y: 10, width: 5, height: height - 20, color: GOLD_L })

    // ── Corner ornaments ─────────────────────────────────────────
    const C = 22; const S = 44; const T = 2.5
    page.drawRectangle({ x: C,           y: height - C - T,  width: S, height: T, color: GOLD })
    page.drawRectangle({ x: C,           y: height - C - S,  width: T, height: S, color: GOLD })
    page.drawRectangle({ x: width-C-S,   y: height - C - T,  width: S, height: T, color: GOLD })
    page.drawRectangle({ x: width-C-T,   y: height - C - S,  width: T, height: S, color: GOLD })
    page.drawRectangle({ x: C,           y: C,               width: S, height: T, color: GOLD })
    page.drawRectangle({ x: C,           y: C,               width: T, height: S, color: GOLD })
    page.drawRectangle({ x: width-C-S,   y: C,               width: S, height: T, color: GOLD })
    page.drawRectangle({ x: width-C-T,   y: C,               width: T, height: S, color: GOLD })

    // ── Helper: centered text ────────────────────────────────────
    function drawCentered(text: string, y: number, font: typeof fontBold, size: number, color: typeof GOLD) {
      const tw = font.widthOfTextAtSize(text, size)
      page.drawText(text, { x: (width - tw) / 2, y, font, size, color })
    }
    function drawAt(text: string, cx: number, y: number, font: typeof fontBold, size: number, color: typeof GOLD) {
      const tw = font.widthOfTextAtSize(text, size)
      page.drawText(text, { x: cx - tw / 2, y, font, size, color })
    }

    // ── Logo ─────────────────────────────────────────────────────
    if (logoImage) {
      const logoDims = logoImage.scaleToFit(120, 44)
      page.drawImage(logoImage, {
        x: (width - logoDims.width) / 2,
        y: height - 26 - logoDims.height,
        width: logoDims.width,
        height: logoDims.height,
      })
    } else {
      drawCentered('AI METHODE ACADEMY', height - 66, fontBold, 9, GOLD)
    }

    // ── Gold divider ─────────────────────────────────────────────
    const divY = height - 94
    page.drawRectangle({ x: width/2 - 60, y: divY, width: 50, height: 1, color: GOLD })
    page.drawRectangle({ x: width/2 + 10, y: divY, width: 50, height: 1, color: GOLD })
    page.drawCircle({ x: width/2, y: divY + 0.5, size: 2.5, color: GOLD })

    // ── Certificate label ────────────────────────────────────────
    drawCentered('ZERTIFIKAT DER TEILNAHME', height - 110, fontReg, 9, GRAY)

    // ── "verliehen an" ───────────────────────────────────────────
    drawCentered('verliehen an', height - 146, fontReg, 10, GRAY)

    // ── Recipient name ───────────────────────────────────────────
    const nameSize = Math.min(36, Math.max(22, Math.floor(480 / (fullName.length * 0.55))))
    drawCentered(fullName, height - 194, fontOblique, nameSize, DARK)

    // Name underline
    const nameWidth = fontOblique.widthOfTextAtSize(fullName, nameSize)
    const lineX = (width - Math.min(nameWidth + 40, 380)) / 2
    const lineW = Math.min(nameWidth + 40, 380)
    page.drawRectangle({ x: lineX, y: height - 204, width: lineW, height: 1.5, color: GOLD })

    // ── Course ───────────────────────────────────────────────────
    drawCentered('für den erfolgreichen Abschluss des Kurses', height - 238, fontReg, 10, GRAY)
    const ctSize = Math.min(18, Math.max(12, Math.floor(500 / (courseTitle.length * 0.6))))
    drawCentered(courseTitle, height - 264, fontBold, ctSize, GOLD)

    // ── Disclaimer ───────────────────────────────────────────────
    drawCentered(
      'Privates Weiterbildungszertifikat · Nicht staatlich anerkannt',
      height - 296, fontReg, 7, LGRAY
    )

    // ═══════════════════════════════════════════════════════════════
    // ── FOOTER (3 columns) ────────────────────────────────────────
    // Left: Signature | Center: Seal | Right: Date
    // ═══════════════════════════════════════════════════════════════
    const footerY = 28   // baseline for labels

    // ── LEFT: Signature ──────────────────────────────────────────
    const sigX = width * 0.22
    const sigLineY = footerY + 42

    // Signature line
    page.drawRectangle({ x: sigX - 70, y: sigLineY, width: 140, height: 1, color: LGRAY })

    // Signature name in italic serif (looks handwritten)
    const sigName = 'Tarik Dzelic'
    const sigNameSize = 16
    drawAt(sigName, sigX, sigLineY + 6, fontSigName, sigNameSize, DARK)

    // Title below line
    drawAt('Kursleiter', sigX, footerY + 28, fontReg, 7, GRAY)
    drawAt('AI Methode Academy', sigX, footerY + 18, fontReg, 7, GRAY)

    // ── CENTER: Digital Seal ──────────────────────────────────────
    const sealX = width / 2
    const sealY = footerY + 44

    // Outer ring
    page.drawCircle({ x: sealX, y: sealY, size: 40, borderColor: GOLD,   borderWidth: 2.5 })
    // Middle ring
    page.drawCircle({ x: sealX, y: sealY, size: 33, borderColor: GOLD_L, borderWidth: 1 })
    // Inner ring
    page.drawCircle({ x: sealX, y: sealY, size: 26, borderColor: GOLD,   borderWidth: 0.5 })

    // Checkmark drawn as two lines (✓ can't be encoded in WinAnsi)
    page.drawLine({ start: { x: sealX - 9, y: sealY - 1 }, end: { x: sealX - 3, y: sealY - 8 }, thickness: 2.5, color: GOLD })
    page.drawLine({ start: { x: sealX - 3, y: sealY - 8 }, end: { x: sealX + 10, y: sealY + 8 }, thickness: 2.5, color: GOLD })

    // Seal text lines
    const sealTopLine   = 'AI METHODE'
    const sealBotLine   = 'ACADEMY'
    const sealSz = 5.5
    drawAt(sealTopLine, sealX, sealY + 14, fontBold, sealSz, GOLD)
    drawAt(sealBotLine, sealX, sealY - 20, fontBold, sealSz, GOLD)

    // Small dots as dividers on seal
    page.drawCircle({ x: sealX - 16, y: sealY + 17, size: 1, color: GOLD_L })
    page.drawCircle({ x: sealX + 16, y: sealY + 17, size: 1, color: GOLD_L })
    page.drawCircle({ x: sealX - 12, y: sealY - 22, size: 1, color: GOLD_L })
    page.drawCircle({ x: sealX + 12, y: sealY - 22, size: 1, color: GOLD_L })

    // "ZERTIFIZIERT" arc-label below seal
    drawAt('· ZERTIFIZIERT ·', sealX, footerY + 8, fontReg, 5.5, GRAY)

    // ── RIGHT: Date ───────────────────────────────────────────────
    const dateX = width * 0.78
    const dateLineY = footerY + 42

    page.drawRectangle({ x: dateX - 70, y: dateLineY, width: 140, height: 1, color: LGRAY })

    // Signature-style date placeholder
    const sigDate = issuedAt
    const sigDateW = fontSigTitle.widthOfTextAtSize(sigDate, 11)
    page.drawText(sigDate, {
      x: dateX - sigDateW / 2,
      y: dateLineY + 6,
      font: fontSigTitle, size: 11, color: DARK,
    })

    drawAt('AUSGESTELLT AM', dateX, footerY + 28, fontReg, 7, GRAY)

    // ── Serialize ─────────────────────────────────────────────────
    const pdfBytes = await pdfDoc.save()

    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Zertifikat-AI-Methode-Academy.pdf"`,
        'Cache-Control': 'no-store',
      },
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error('[certificate] failed:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
