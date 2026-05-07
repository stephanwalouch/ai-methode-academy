import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/layout/Sidebar'
import { MobileSidebar } from '@/components/layout/MobileSidebar'
import { Footer } from '@/components/layout/Footer'
import { DarkModeSync } from '@/components/DarkModeSync'

export default async function PlatformLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: profile }, { data: branding }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('branding').select('*').single(),
  ])

  const darkMode = profile?.dark_mode === true

  // Synchronous inline script – runs before React hydrates, eliminates any flash.
  // This is the authoritative source: DB preference always wins over localStorage.
  const themeScript = darkMode
    ? `document.documentElement.classList.add('dark');try{localStorage.setItem('theme','dark')}catch(e){}`
    : `document.documentElement.classList.remove('dark');try{localStorage.removeItem('theme')}catch(e){}`

  return (
    <>
      {/* Apply theme synchronously before first paint */}
      <script dangerouslySetInnerHTML={{ __html: themeScript }} />

      <div className="flex h-screen overflow-hidden bg-[#f7f7f5] dark:bg-[#111111]">
        <DarkModeSync dark={darkMode} />

        {/* Desktop Sidebar */}
        <div className="hidden lg:flex lg:flex-shrink-0">
          <Sidebar profile={profile} branding={branding} />
        </div>

        {/* Mobile Sidebar */}
        <MobileSidebar profile={profile} branding={branding} />

        {/* Main Content */}
        <main className="flex flex-col flex-1 overflow-y-auto">
          {/* On mobile: pt-14 makes room for the fixed hamburger button (top-3 + h-10 ≈ 52px → 56px) */}
          <div className="mx-auto w-full max-w-5xl flex-1 px-4 pt-14 pb-8 sm:px-6 lg:px-8 lg:pt-8">
            {children}
          </div>
          <Footer />
        </main>
      </div>
    </>
  )
}
