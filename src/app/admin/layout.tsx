import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AdminNav } from './AdminNav'
import { Footer } from '@/components/layout/Footer'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/dashboard')

  const { data: branding } = await supabase.from('branding').select('platform_name, logo_url').single()

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-[#111111]">
      <AdminNav branding={branding} />
      <main className="flex flex-col flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-5xl flex-1 px-6 py-8">
          {children}
        </div>
        <Footer />
      </main>
    </div>
  )
}
