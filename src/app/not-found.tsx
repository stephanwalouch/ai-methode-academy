'use client'

import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[#f7f7f5] dark:bg-[#111111]">
      <div className="w-full max-w-md text-center">

        {/* Logo */}
        <img
          src="https://www.ai-methode.de/logo-aim.png"
          alt="AI Methode"
          className="mx-auto mb-10 h-12 w-auto object-contain"
          onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
        />

        {/* 404 number */}
        <p
          className="text-8xl font-black leading-none tracking-tight"
          style={{ color: '#b8922a', opacity: 0.18 }}
        >
          404
        </p>

        {/* Heading */}
        <h1 className="mt-4 text-2xl font-bold text-gray-900">
          Seite nicht gefunden
        </h1>

        {/* Subtext */}
        <p className="mt-3 text-sm text-gray-500 leading-relaxed">
          Die Seite, die du suchst, existiert nicht<br className="hidden sm:block" /> oder wurde verschoben.
        </p>

        {/* CTA */}
        <Link
          href="/dashboard"
          className="btn-primary mt-8 inline-block px-8"
        >
          Zurück zum Dashboard
        </Link>

        {/* Subtle divider + login link for logged-out users */}
        <p className="mt-6 text-xs text-gray-400">
          Noch nicht angemeldet?{' '}
          <Link href="/login" className="underline hover:text-gray-600 transition-colors">
            Zum Login
          </Link>
        </p>

      </div>
    </div>
  )
}
