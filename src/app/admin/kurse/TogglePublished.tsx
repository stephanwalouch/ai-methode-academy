'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Eye, EyeOff } from 'lucide-react'

export function TogglePublished({ courseId, isPublished }: { courseId: string; isPublished: boolean }) {
  const [published, setPublished] = useState(isPublished)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function toggle() {
    setLoading(true)
    const supabase = createClient()
    await supabase.from('courses').update({ is_published: !published }).eq('id', courseId)
    setPublished(!published)
    setLoading(false)
    router.refresh()
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      title={published ? 'Verstecken' : 'Veröffentlichen'}
      className={`p-2 rounded-lg transition-colors ${published ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-50'}`}
    >
      {published ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
    </button>
  )
}
