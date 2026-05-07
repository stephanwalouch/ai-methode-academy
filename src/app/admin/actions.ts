'use server'

import { revalidatePath } from 'next/cache'
import { createClient, createAdminClient } from '@/lib/supabase/server'

// ─── Delete Course ────────────────────────────────────────────────────────────
export async function deleteCourse(courseId: string) {
  const supabase = await createClient()

  // Delete in correct order (FK constraints):
  // 1. lesson_progress (references lessons)
  // 2. notes (references lessons)
  // 3. lessons (references modules)
  // 4. modules (references courses)
  // 5. course itself

  // Get all module ids for this course
  const { data: modules } = await supabase
    .from('modules')
    .select('id')
    .eq('course_id', courseId)

  const moduleIds = modules?.map(m => m.id) ?? []

  if (moduleIds.length > 0) {
    // Get all lesson ids for these modules
    const { data: lessons } = await supabase
      .from('lessons')
      .select('id')
      .in('module_id', moduleIds)

    const lessonIds = lessons?.map(l => l.id) ?? []

    if (lessonIds.length > 0) {
      // Delete lesson_progress
      await supabase.from('lesson_progress').delete().in('lesson_id', lessonIds)
      // Delete notes
      await supabase.from('notes').delete().in('lesson_id', lessonIds)
      // Delete lessons
      await supabase.from('lessons').delete().in('module_id', moduleIds)
    }

    // Delete modules
    await supabase.from('modules').delete().eq('course_id', courseId)
  }

  // Finally delete the course
  const { error } = await supabase.from('courses').delete().eq('id', courseId)
  if (error) throw new Error(error.message)

  revalidatePath('/admin/kurse')
}

// ─── Delete User ──────────────────────────────────────────────────────────────
export async function deleteUser(userId: string) {
  const supabase      = await createClient()
  const adminSupabase = await createAdminClient()

  // Delete user data first
  await supabase.from('lesson_progress').delete().eq('user_id', userId)
  await supabase.from('notes').delete().eq('user_id', userId)
  await supabase.from('profiles').delete().eq('id', userId)

  // Delete auth user (requires service role)
  const { error } = await adminSupabase.auth.admin.deleteUser(userId)
  if (error) throw new Error(error.message)

  revalidatePath('/admin/nutzer')
}

// ─── Ban User ─────────────────────────────────────────────────────────────────
export async function banUser(userId: string): Promise<{ error: string } | null> {
  try {
    const supabase = await createAdminClient()
    const { error } = await supabase
      .from('profiles')
      .update({ is_banned: true })
      .eq('id', userId)

    if (error) return { error: error.message }
    revalidatePath('/admin/nutzer')
    return null
  } catch (e) {
    return { error: e instanceof Error ? e.message : String(e) }
  }
}

// ─── Unban User ───────────────────────────────────────────────────────────────
export async function unbanUser(userId: string): Promise<{ error: string } | null> {
  try {
    const supabase = await createAdminClient()
    const { error } = await supabase
      .from('profiles')
      .update({ is_banned: false })
      .eq('id', userId)

    if (error) return { error: error.message }
    revalidatePath('/admin/nutzer')
    return null
  } catch (e) {
    return { error: e instanceof Error ? e.message : String(e) }
  }
}
