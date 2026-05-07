'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

export function CopyLink({ url }: { url: string }) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button onClick={copy} className="btn-secondary flex-shrink-0 text-xs">
      {copied ? <><Check className="h-3.5 w-3.5 text-green-500" /> Kopiert!</> : <><Copy className="h-3.5 w-3.5" /> Link kopieren</>}
    </button>
  )
}
