import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { PDFDocument, rgb, StandardFonts, PageSizes } from 'pdf-lib'

const GOLD   = rgb(0.722, 0.573, 0.165)   // #b8922a
const GOLD_L = rgb(0.831, 0.667, 0.290)   // #d4aa4a
const DARK   = rgb(0.102, 0.071, 0.008)   // #1a1208
const GRAY   = rgb(0.420, 0.447, 0.502)   // #6b7280
const LGRAY  = rgb(0.898, 0.918, 0.929)   // #e5e7eb
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

    // --- Build PDF ---
    const pdfDoc = await PDFDocument.create()

    // A4 landscape: 841.89 x 595.28 pt
    const page   = pdfDoc.addPage([841.89, 595.28])
    const { width, height } = page.getSize()

    const fontBold   = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
    const fontReg    = await pdfDoc.embedFont(StandardFonts.Helvetica)
    const fontOblique = await pdfDoc.embedFont(StandardFonts.HelveticaBoldOblique)

    // ── Background ──────────────────────────────────────────────
    page.drawRectangle({ x: 0, y: 0, width, height, color: WHITE })

    // ── Gold border bars (top + bottom) ─────────────────────────
    page.drawRectangle({ x: 0, y: height - 10, width, height: 10, color: GOLD })
    page.drawRectangle({ x: 0, y: 0, width, height: 10, color: GOLD })

    // ── Gold side accents ────────────────────────────────────────
    page.drawRectangle({ x: 0, y: 10, width: 5, height: height - 20, color: GOLD_L })
    page.drawRectangle({ x: width - 5, y: 10, width: 5, height: height - 20, color: GOLD_L })

    // ── Corner ornaments (L-shaped, drawn as two thin rects each) ─
    const C = 22   // inset from edge
    const S = 44   // arm length
    const T = 2.5  // line thickness

    // top-left
    page.drawRectangle({ x: C, y: height - C - T, width: S, height: T, color: GOLD })
    page.drawRectangle({ x: C, y: height - C - S, width: T, height: S, color: GOLD })
    // top-right
    page.drawRectangle({ x: width - C - S, y: height - C - T, width: S, height: T, color: GOLD })
    page.drawRectangle({ x: width - C - T, y: height - C - S, width: T, height: S, color: GOLD })
    // bottom-left
    page.drawRectangle({ x: C, y: C, width: S, height: T, color: GOLD })
    page.drawRectangle({ x: C, y: C, width: T, height: S, color: GOLD })
    // bottom-right
    page.drawRectangle({ x: width - C - S, y: C, width: S, height: T, color: GOLD })
    page.drawRectangle({ x: width - C - T, y: C, width: T, height: S, color: GOLD })

    // ── Helper: centered text ─────────────────────────────────────
    function drawCentered(text: string, y: number, font: typeof fontBold, size: number, color: typeof GOLD) {
      const textWidth = font.widthOfTextAtSize(text, size)
      page.drawText(text, { x: (width - textWidth) / 2, y, font, size, color })
    }

    // ── Academy name ─────────────────────────────────────────────
    drawCentered('AI METHODE ACADEMY', height - 68, fontBold, 9, GOLD)

    // ── Gold divider lines ────────────────────────────────────────
    const divY = height - 86
    page.drawRectangle({ x: width / 2 - 60, y: divY, width: 50, height: 1, color: GOLD })
    page.drawRectangle({ x: width / 2 + 10, y: divY, width: 50, height: 1, color: GOLD })
    // center dot
    page.drawCircle({ x: width / 2, y: divY + 0.5, size: 2.5, color: GOLD })

    // ── "Zertifikat der Teilnahme" ────────────────────────────────
    drawCentered('ZERTIFIKAT DER TEILNAHME', height - 112, fontReg, 9, GRAY)

    // ── "verliehen an" ────────────────────────────────────────────
    drawCentered('verliehen an', height - 148, fontReg, 10, GRAY)

    // ── Recipient name ────────────────────────────────────────────
    const nameSize = Math.min(36, Math.max(22, Math.floor(480 / (fullName.length * 0.55))))
    drawCentered(fullName, height - 198, fontOblique, nameSize, DARK)

    // Name underline
    const nameWidth = fontOblique.widthOfTextAtSize(fullName, nameSize)
    const lineX = (width - Math.min(nameWidth + 40, 380)) / 2
    const lineW = Math.min(nameWidth + 40, 380)
    page.drawRectangle({ x: lineX, y: height - 208, width: lineW, height: 1.5, color: GOLD })

    // ── "für den erfolgreichen Abschluss des Kurses" ──────────────
    drawCentered('für den erfolgreichen Abschluss des Kurses', height - 244, fontReg, 10, GRAY)

    // ── Course title ──────────────────────────────────────────────
    const ctSize = Math.min(18, Math.max(12, Math.floor(500 / (courseTitle.length * 0.6))))
    drawCentered(courseTitle, height - 274, fontBold, ctSize, GOLD)

    // ── Disclaimer ────────────────────────────────────────────────
    drawCentered(
      'Privates Weiterbildungszertifikat · Nicht staatlich anerkannt',
      height - 308, fontReg, 7, LGRAY
    )

    // ── Footer: stamp circle ──────────────────────────────────────
    const stampX = width / 2 - 160
    const stampY = 72
    page.drawCircle({ x: stampX, y: stampY, size: 34, borderColor: GOLD, borderWidth: 2.5 })
    page.drawCircle({ x: stampX, y: stampY, size: 27, borderColor: GOLD_L, borderWidth: 1 })
    const stampLines = ['AI', 'METHODE', 'ACADEMY']
    stampLines.forEach((line, i) => {
      const sz = 6
      const tw = fontBold.widthOfTextAtSize(line, sz)
      page.drawText(line, {
        x: stampX - tw / 2,
        y: stampY + 7 - i * 9,
        font: fontBold, size: sz, color: GOLD,
      })
    })

    // ── Footer: date ──────────────────────────────────────────────
    const dateX = width / 2 + 60
    page.drawRectangle({ x: dateX - 60, y: 88, width: 120, height: 1, color: LGRAY })
    const labelDate = 'AUSGESTELLT AM'
    const lwDate = fontReg.widthOfTextAtSize(labelDate, 7)
    page.drawText(labelDate, { x: dateX - lwDate / 2, y: 76, font: fontReg, size: 7, color: GRAY })
    const dwDate = fontBold.widthOfTextAtSize(issuedAt, 9)
    page.drawText(issuedAt, { x: dateX - dwDate / 2, y: 62, font: fontBold, size: 9, color: DARK })

    // ── Serialize ─────────────────────────────────────────────────
    const pdfBytes = await pdfDoc.save()

    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Zertifikat-AI-Methode-Academy.pdf"`,
      },
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error('[certificate] failed:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
