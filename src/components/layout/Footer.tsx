import Link from 'next/link'

export function Footer() {
  return (
    <footer className="mt-auto border-t border-gray-100 dark:border-[#2a2a2a] py-4 px-6">
      <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-gray-400">
        <span>© {new Date().getFullYear()} AIM Advisory LLC</span>
        <span className="hidden sm:inline">·</span>
        <Link href="/impressum" className="hover:text-gray-600 transition-colors">Impressum</Link>
        <span>·</span>
        <Link href="/datenschutz" className="hover:text-gray-600 transition-colors">Datenschutz</Link>
      </div>
    </footer>
  )
}
