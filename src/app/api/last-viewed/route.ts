import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const { lesson_id, course_id } = await request.json()
  if (!lesson_id || !course_id) return NextResponse.json({ ok: false }, { status: 400 })

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ ok: false }, { status: 401 })

  await supabase.from('last_viewed_lessons').upsert(
    { user_id: user.id, course_id, lesson_id, viewed_at: new Date().toISOString() },
    { onConflict: 'user_id,course_id' }
  )

  // last_seen_at auf Profil aktualisieren
  await supabase.from('profiles').update({ last_seen_at: new Date().toISOString() }).eq('id', user.id)

  return NextResponse.json({ ok: true })
}
