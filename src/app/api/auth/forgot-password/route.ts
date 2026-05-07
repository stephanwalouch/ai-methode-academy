import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { sendPasswordResetEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  const { email } = await request.json()
  if (!email) return NextResponse.json({ ok: false }, { status: 400 })

  // Always return 200 to prevent email enumeration
  const appUrl = process.env.NEXT_PUBLIC_SITE_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? 'https://academy.ai-methode.de'

  try {
    const supabase = await createAdminClient()

    // Generate a Supabase recovery link (works regardless of email existence)
    const { data, error } = await supabase.auth.admin.generateLink({
      type: 'recovery',
      email,
      options: {
        redirectTo: `${appUrl}/passwort-reset`,
      },
    })

    if (error || !data?.properties?.action_link) {
      // User not found or other error – still return OK to the client
      console.warn('[reset] generateLink skipped:', error?.message ?? 'no link')
      return NextResponse.json({ ok: true })
    }

    const resetUrl = data.properties.action_link

    // Look up the user's name for a personalized email
    const { data: { users } } = await supabase.auth.admin.listUsers()
    const user = users?.find((u: { email?: string }) => u.email === email)
    const firstName = (user?.user_metadata?.full_name as string | undefined)
      ?.trim()
      ?.split(' ')[0]

    const { error: sendError } = await sendPasswordResetEmail({
      to:        email,
      resetUrl,
      firstName,
    })

    if (sendError) console.error('[reset] Resend error:', sendError)
  } catch (err) {
    console.error('[reset] error:', err)
  }

  return NextResponse.json({ ok: true })
}
