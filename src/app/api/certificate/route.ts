import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { renderToBuffer } from '@react-pdf/renderer'
import { CertificatePDF } from '@/components/CertificatePDF'

interface Lesson  { id: string; is_published: boolean }
interface Module  { id: string; lessons: Lesson[] }
interface Course  { title: string; modules: Module[] }

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const [{ data: profile }, { data: courses }, { data: progress }] = await Promise.all([
    supabase.from('profiles').select('full_name').eq('id', user.id).single(),
    supabase.from('courses').select('title, modules(id, lessons(id, is_published))').eq('is_published', true).order('sort_order').limit(1).single(),
    supabase.from('lesson_progress').select('lesson_id').eq('user_id', user.id),
  ])

  const course = courses as unknown as Course | null

  // Verify course is actually completed
  const allLessonIds = (course?.modules ?? []).flatMap(m =>
    m.lessons.filter(l => l.is_published).map(l => l.id)
  )
  const completedIds = new Set(progress?.map(p => p.lesson_id) ?? [])
  const allDone = allLessonIds.length > 0 && allLessonIds.every(id => completedIds.has(id))
  if (!allDone) return NextResponse.json({ error: 'Course not completed' }, { status: 403 })

  const fullName    = profile?.full_name ?? user.email ?? 'Absolvent'
  const courseTitle = course?.title ?? 'AI Methode Academy'
  const issuedAt    = new Date().toLocaleDateString('de-DE', { day: '2-digit', month: 'long', year: 'numeric' })

  const buffer = await renderToBuffer(
    CertificatePDF({ fullName, courseTitle, issuedAt })
  )

  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="Zertifikat-AI-Methode-Academy.pdf"`,
    },
  })
}
