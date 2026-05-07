import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const { lesson_id, content } = await request.json()
  if (!lesson_id) return NextResponse.json({ ok: false }, { status: 400 })

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ ok: false }, { status: 401 })

  const { error } = await supabase.from('lesson_notes').upsert(
    { user_id: user.id, lesson_id, content: content ?? '' },
    { onConflict: 'user_id,lesson_id' }
  )

  return NextResponse.json({ ok: !error })
}
