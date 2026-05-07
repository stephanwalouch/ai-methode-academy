'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Search, CheckCircle2, PlayCircle, X } from 'lucide-react'

interface LessonEntry {
  id: string
  title: string
  moduleTitle: string
  courseId: string
  isCompleted: boolean
  durationSeconds: number | null
}

interface Props {
  lessons: LessonEntry[]
}

function fmtDuration(secs: number | null) {
  if (!secs) return null
  const m = Math.floor(secs / 60)
  const s = secs % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

export function LessonSearch({ lessons }: Props) {
  const [query, setQuery] = useState('')

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    return lessons.filter(
      l =>
        l.title.toLowerCase().includes(q) ||
        l.moduleTitle.toLowerCase().includes(q)
    )
  }, [query, lessons])

  const showResults = query.trim().length > 0

  return (
    <div className="relative">
      {/* Search input */}
      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="search"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Lektionen durchsuchen…"
          className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-10 text-sm text-gray-900 outline-none transition focus:border-[#b8922a] focus:ring-2 focus:ring-[#b8922a]/20 dark:border-gray-700 dark:bg-[#1e1e1e] dark:text-gray-100"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Dropdown results */}
      {showResults && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1.5 max-h-80 overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-[#1e1e1e]">
          {results.length === 0 ? (
            <div className="px-4 py-6 text-center text-sm text-gray-400">
              Keine Lektionen gefunden für &bdquo;{query}&ldquo;
            </div>
          ) : (
            <ul className="divide-y divide-gray-100 dark:divide-gray-800">
              {results.map(l => (
                <li key={l.id}>
                  <Link
                    href={`/kurse/${l.courseId}/lektion/${l.id}`}
                    onClick={() => setQuery('')}
                    className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-amber-50 dark:hover:bg-amber-900/10"
                  >
                    {l.isCompleted ? (
                      <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-green-500" />
                    ) : (
                      <PlayCircle className="h-4 w-4 flex-shrink-0 text-gray-300" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                        {l.title}
                      </p>
                      <p className="truncate text-xs text-gray-400">{l.moduleTitle}</p>
                    </div>
                    {fmtDuration(l.durationSeconds) && (
                      <span className="flex-shrink-0 text-xs text-gray-400">
                        {fmtDuration(l.durationSeconds)}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <div className="border-t border-gray-100 px-4 py-2 text-[11px] text-gray-400 dark:border-gray-800">
            {results.length > 0 ? `${results.length} Ergebnis${results.length === 1 ? '' : 'se'}` : '0 Ergebnisse'}
          </div>
        </div>
      )}
    </div>
  )
}
