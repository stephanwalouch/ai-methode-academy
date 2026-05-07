import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Suspense } from 'react'
import './globals.css'
import { createClient } from '@/lib/supabase/server'
import { NavigationProgress } from '@/components/NavigationProgress'
import { ThemeProvider } from '@/components/ThemeProvider'

const inter = Inter({ subsets: ['latin'] })

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: {
      default:  'AI Methode Academy',
      template: '%s | AI Methode Academy',
    },
    description: 'Dein Weg zur eigenen KI-Agentur – AI Methode Academy',
    icons: {
      icon:  '/favicon.ico',
      apple: '/apple-touch-icon.png',
    },
  }
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: branding } = await supabase.from('branding').select('*').single()

  const primaryColor = branding?.primary_color ?? '#b8922a'
  const accentColor  = branding?.accent_color  ?? '#9a7820'

  const cssVars = `
    :root {
      --brand-50:  ${primaryColor}12;
      --brand-100: ${primaryColor}25;
      --brand-200: ${primaryColor}45;
      --brand-500: ${primaryColor};
      --brand-600: ${accentColor};
      --brand-700: ${accentColor}ee;
      --brand-900: ${accentColor}99;
    }
  `

  return (
    <html lang="de" suppressHydrationWarning>
      <head>
        <style dangerouslySetInnerHTML={{ __html: cssVars }} />
      </head>
      <body className={inter.className}>
        <ThemeProvider>
          <Suspense fallback={null}>
            <NavigationProgress />
          </Suspense>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
