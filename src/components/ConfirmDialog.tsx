'use client'

import { useEffect, useRef, useState } from 'react'
import { AlertTriangle, X } from 'lucide-react'

interface ConfirmDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: string
  confirmWord: string          // The word the user must type
  confirmLabel?: string        // Button label, default = confirmWord
  variant?: 'danger' | 'warning'
  loading?: boolean
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmWord,
  confirmLabel,
  variant = 'danger',
  loading = false,
}: ConfirmDialogProps) {
  const [typed, setTyped] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setTyped('')
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  const matches = typed === confirmWord
  const iconColor = variant === 'danger' ? 'text-red-500' : 'text-amber-500'
  const iconBg    = variant === 'danger' ? 'bg-red-50'   : 'bg-amber-50'
  const btnClass  = variant === 'danger'
    ? 'btn-danger disabled:opacity-40 disabled:cursor-not-allowed'
    : 'inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed'

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.45)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="card w-full max-w-md p-6 dark:bg-[#1c1c1c]">
        {/* Header */}
        <div className="flex items-start gap-4">
          <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${iconBg}`}>
            <AlertTriangle className={`h-5 w-5 ${iconColor}`} />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-semibold text-gray-900">{title}</h2>
            <p className="mt-1 text-sm text-gray-500">{description}</p>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Confirmation input */}
        <div className="mt-5">
          <label className="label">
            Tippe <span className="font-mono font-bold text-gray-800">{confirmWord}</span> zur Bestätigung
          </label>
          <input
            ref={inputRef}
            type="text"
            value={typed}
            onChange={e => setTyped(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && matches && !loading) onConfirm() }}
            className="input mt-1"
            placeholder={confirmWord}
            autoComplete="off"
            spellCheck={false}
          />
        </div>

        {/* Buttons */}
        <div className="mt-5 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="btn-secondary"
          >
            Abbrechen
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={!matches || loading}
            className={btnClass}
          >
            {loading ? 'Bitte warten…' : (confirmLabel ?? confirmWord)}
          </button>
        </div>
      </div>
    </div>
  )
}
