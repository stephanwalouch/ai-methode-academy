'use client'

import { useState } from 'react'
import { Download, Loader2 } from 'lucide-react'

export function CertificateDownloadButton() {
  const [loading, setLoading] = useState(false)

  async function handleDownload() {
    setLoading(true)
    try {
      const res = await fetch('/api/certificate')
      if (!res.ok) throw new Error('Fehler beim Erstellen')
      const blob = await res.blob()
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href     = url
      a.download = 'Zertifikat-AI-Methode-Academy.pdf'
      a.click()
      URL.revokeObjectURL(url)
    } catch (e) {
      alert('Zertifikat konnte nicht erstellt werden. Bitte versuche es erneut.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      className="inline-flex items-center gap-2.5 rounded-xl px-7 py-3 text-sm font-bold shadow-lg transition-all hover:scale-[1.02] active:scale-100 disabled:opacity-60 disabled:cursor-not-allowed"
      style={{ background: '#b8922a', color: '#fff' }}
    >
      {loading
        ? <><Loader2 className="h-4 w-4 animate-spin" /> Wird erstellt…</>
        : <><Download className="h-4 w-4" /> Zertifikat herunterladen</>
      }
    </button>
  )
}
