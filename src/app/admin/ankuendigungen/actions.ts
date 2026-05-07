'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createAnnouncement(formData: FormData) {
  const supabase = await createClient()
  const title = (formData.get('title') as string).trim()
  const body  = (formData.get('body')  as string).trim()
  if (!title || !body) return

  await supabase.from('announcements').insert({ title, body, is_active: false })
  revalidatePath('/admin/ankuendigungen')
}

export async function toggleAnnouncement(id: string, isActive: boolean) {
  const supabase = await createClient()

  if (isActive) {
    // Deactivate all others first so only one is active at a time
    await supabase.from('announcements').update({ is_active: false }).neq('id', id)
  }

  await supabase.from('announcements').update({ is_active: isActive }).eq('id', id)
  revalidatePath('/admin/ankuendigungen')
  revalidatePath('/dashboard')
}

export async function updateAnnouncement(id: string, title: string, body: string) {
  const supabase = await createClient()
  await supabase.from('announcements').update({ title: title.trim(), body: body.trim() }).eq('id', id)
  revalidatePath('/admin/ankuendigungen')
  revalidatePath('/dashboard')
}

export async function deleteAnnouncement(id: string) {
  const supabase = await createClient()
  await supabase.from('announcements').delete().eq('id', id)
  revalidatePath('/admin/ankuendigungen')
  revalidatePath('/dashboard')
}
