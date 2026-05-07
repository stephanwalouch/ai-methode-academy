import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token')
  if (!token) return NextResponse.json({ valid: false })

  const supabase = await createAdminClient()
  const { data, error } = await supabase
    .from('invite_tokens')
    .select('id, expires_at, max_uses, use_count, used_by')
    .eq('token', token)
    .single()

  if (error || !data) return NextResponse.json({ valid: false })

  const expired = data.expires_at && new Date(data.expires_at) < new Date()
  const maxed   = data.use_count >= data.max_uses

  return NextResponse.json({ valid: !expired && !maxed })
}
