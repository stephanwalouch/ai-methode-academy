import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'

export default async function KursePage() {
  const supabase = await createClient()

  const { data: course } = await supabase
    .from('courses')
    .select('id')
    .eq('is_published', true)
    .order('sort_order')
    .limit(1)
    .single()

  if (!course) notFound()

  redirect(`/kurse/${course.id}`)
}
