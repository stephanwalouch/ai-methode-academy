'use client'

import { useEffect } from 'react'
import { CheckCircle } from 'lucide-react'
import confetti from 'canvas-confetti'

interface Props {
  type: 'lesson' | 'module'
  moduleTitle?: string
  moduleNumber?: number
  onDismiss: () => void
}

export function CompletionToast({ type, moduleTitle, moduleNumber, onDismiss }: Props) {
  useEffect(() => {
    if (type === 'module') {
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.55 }, colors: ['#b8922a', '#d4a93a', '#f5d78a', '#22c55e', '#60a5fa'] })
      setTimeout(() => confetti({ particleCount: 60, spread: 110, origin: { y: 0.55, x: 0.25 }, colors: ['#b8922a', '#f5d78a', '#86efac'] }), 250)
      setTimeout(() => confetti({ particleCount: 60, spread: 110, origin: { y: 0.55, x: 0.75 }, colors: ['#b8922a', '#f5d78a', '#93c5fd'] }), 400)
    }
    const ms = type === 'module' ? 5000 : 3000
    const t = setTimeout(onDismiss, ms)
    return () => clearTimeout(t)
  }, [type, onDismiss])

  if (type === 'module') {
    return (
      <>
        <style>{`
          @keyframes cta-pop-in {
            0%   { opacity: 0; transform: translate(-50%, -48%) scale(0.85); }
            60%  { transform: translate(-50%, -50%) scale(1.04); }
            100% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
          }
          .cta-module { animation: cta-pop-in 0.35s ease-out forwards; }
        `}</style>
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={onDismiss}>
          <div
            className="cta-module absolute left-1/2 top-1/2 w-[90vw] max-w-sm rounded-2xl bg-white p-8 text-center shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-50 text-4xl">
              🎉
            </div>
            <p className="text-2xl font-black text-gray-900">Modul abgeschlossen!</p>
            {moduleNumber && moduleTitle && (
              <p className="mt-2 text-sm leading-relaxed text-gray-500">
                Du hast <span className="font-semibold text-gray-800">Modul {moduleNumber} – {moduleTitle}</span> erfolgreich beendet. Stark gemacht!
              </p>
            )}
            <button
              onClick={onDismiss}
              className="mt-6 w-full rounded-xl py-3 text-sm font-bold text-white"
              style={{ background: '#b8922a' }}
            >
              Weiter geht&apos;s 🚀
            </button>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <style>{`
        @keyframes toast-up {
          0%   { opacity: 0; transform: translateX(-50%) translateY(16px); }
          100% { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        .cta-toast { animation: toast-up 0.28s ease-out forwards; }
      `}</style>
      <div className="cta-toast fixed bottom-6 left-1/2 z-50 pointer-events-none">
        <div className="flex items-center gap-2.5 rounded-full bg-green-500 px-5 py-3 text-sm font-semibold text-white shadow-xl">
          <CheckCircle className="h-4 w-4 flex-shrink-0" />
          Lektion abgeschlossen! Weiter so! 💪
        </div>
      </div>
    </>
  )
}
