'use client'

import { useEffect, useRef, useState } from 'react'
import { Play } from 'lucide-react'

interface VideoPlayerProps {
  videoId: string
  libraryId: string
  title: string
  onEnded?: () => void
}

export function VideoPlayer({ videoId, libraryId, title, onEnded }: VideoPlayerProps) {
  const [loaded, setLoaded] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const src = `https://iframe.mediadelivery.net/embed/${libraryId}/${videoId}?autoplay=false&loop=false&muted=false&preload=false&responsive=true`

  useEffect(() => {
    if (!onEnded) return
    const handler = (e: MessageEvent) => {
      try {
        const data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data
        // Bunny Stream player.js protocol
        if (data?.event === 'ended' || data?.type === 'ended') {
          onEnded()
        }
      } catch {
        // ignore non-JSON messages
      }
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [onEnded])

  return (
    <div className="relative w-full overflow-hidden rounded-xl bg-black shadow-xl" style={{ paddingTop: '56.25%' }}>
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
          <div className="text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-white/10">
              <Play className="h-6 w-6 text-white fill-white" />
            </div>
            <p className="text-sm text-white/60">{title}</p>
          </div>
        </div>
      )}
      <iframe
        ref={iframeRef}
        src={src}
        className="absolute inset-0 h-full w-full border-0"
        allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
        allowFullScreen
        onLoad={() => setLoaded(true)}
        title={title}
      />
    </div>
  )
}
