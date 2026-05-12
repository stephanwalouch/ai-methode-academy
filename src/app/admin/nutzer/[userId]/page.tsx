import { createClient, createAdminClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, FileText, BookOpen, Clock } from 'lucide-react'

function fmtDate(d: string | null) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('de-DE', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default async function UserNotesPage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params
  const supabase      = await createClient()
  const adminSupabase = await createAdminClient()

  // Verify the requesting user is an admin
  const { data: { user: currentUser } } = await supabase.auth.getUser()
  if (!currentUser) redirect('/login')
  const { data: currentProfile } = await supabase.from('profiles').select('role').eq('id', currentUser.id).single()
  if (currentProfile?.role !== 'admin') redirect('/dashboard')

  const [{ data: profile }, { data: notes }, { data: courses }] = await Promise.all([
    supabase.from('profiles').select('full_name, email, role').eq('id', userId).single(),
    adminSupabase
      .from('lesson_notes')
      .select('lesson_id, content, updated_at')
      .eq('user_id', userId)
      .neq('content', '')
      .order('updated_at', { ascending: false }),
    supabase.from('courses').select(`
      id, title,
      modules(id, title, sort_order, lessons(id, title, sort_order, is_published))
    `).eq('is_published', true),
  ])

  if (!profile || profile.role === 'admin') notFound()

  // Build lesson map for titles
  type Lesson = { id: string; title: string; sort_order: number; is_published: boolean }
  type Module = { id: string; title: string; sort_order: number; lessons: Lesson[] }
  type Course = { id: string; title: string; modules: Module[] }

  const lessonMap = new Map<string, { lessonTitle: string; moduleTitle: string; courseTitle: string }>()
  ;(courses as Course[] ?? []).forEach(c => {
    ;(c.modules as Module[]).forEach(m => {
      m.lessons.filter(l => l.is_published).forEach(l => {
        lessonMap.set(l.id, { lessonTitle: l.title, moduleTitle: m.title, courseTitle: c.title })
      })
    })
  })

  const notesWithMeta = (notes ?? []).map(n => ({
    ...n,
    ...lessonMap.get(n.lesson_id),
  }))

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <Link href="/admin/nutzer" className="mb-4 inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" /> Zurück zur Nutzerliste
        </Link>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold text-white" style={{ background: '#b8922a' }}>
            {(profile.full_name ?? profile.email ?? '?')[0].toUpperCase()}
          </div>
          <div>
            <h1 className="text-xl font-black text-gray-900">{profile.full_name ?? '—'}</h1>
            <p className="text-sm text-gray-400">{profile.email}</p>
          </div>
        </div>
      </div>

      {/* Notizen */}
      <div>
        <h2 className="mb-3 flex items-center gap-2 text-base font-bold text-gray-900">
          <FileText className="h-4 w-4" style={{ color: '#b8922a' }} />
          Notizen
          {notesWithMeta.length > 0 && (
            <span className="text-sm font-normal text-gray-400">({notesWithMeta.length})</span>
          )}
        </h2>

        {notesWithMeta.length === 0 ? (
          <div className="card flex flex-col items-center justify-center py-12 text-center">
            <FileText className="mb-2 h-8 w-8 text-gray-200" />
            <p className="text-sm font-medium text-gray-400">Keine Notizen vorhanden</p>
            <p className="mt-1 text-xs text-gray-300">Dieser Nutzer hat noch keine Notizen geschrieben.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notesWithMeta.map(note => (
              <div key={note.lesson_id} className="card p-5">
                <div className="mb-3 flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-0.5">
                      <BookOpen className="h-3 w-3" />
                      <span>{note.moduleTitle ?? '—'}</span>
                    </div>
                    <p className="text-sm font-semibold text-gray-900">{note.lessonTitle ?? note.lesson_id}</p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0 text-[11px] text-gray-400">
                    <Clock className="h-3 w-3" />
                    {fmtDate(note.updated_at)}
                  </div>
                </div>
                <p className="text-sm leading-relaxed text-gray-600 whitespace-pre-wrap">{note.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
