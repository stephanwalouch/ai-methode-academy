'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Upload, Trash2, FileText, FileSpreadsheet, Presentation, File, Loader2, X } from 'lucide-react'

interface Resource {
  id: string
  title: string
  url: string
  file_size: number | null
  file_type: string | null
  storage_path: string | null
  sort_order: number
}

const ACCEPTED_TYPES: Record<string, string> = {
  'application/pdf': 'pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'word',
  'application/msword': 'word',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'excel',
  'application/vnd.ms-excel': 'excel',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'powerpoint',
  'application/vnd.ms-powerpoint': 'powerpoint',
}

const EXT_MAP: Record<string, string> = {
  pdf: 'pdf', docx: 'word', doc: 'word',
  xlsx: 'excel', xls: 'excel', pptx: 'powerpoint', ppt: 'powerpoint',
}

const MAX_SIZE = 50 * 1024 * 1024 // 50 MB

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function FileIcon({ type }: { type: string | null }) {
  if (type === 'pdf')        return <FileText        className="h-4 w-4 text-red-500"    />
  if (type === 'word')       return <FileText        className="h-4 w-4 text-blue-500"   />
  if (type === 'excel')      return <FileSpreadsheet className="h-4 w-4 text-green-600"  />
  if (type === 'powerpoint') return <Presentation   className="h-4 w-4 text-orange-500" />
  return <File className="h-4 w-4 text-gray-400" />
}

function typeLabel(type: string | null) {
  if (type === 'pdf')        return 'PDF'
  if (type === 'word')       return 'Word'
  if (type === 'excel')      return 'Excel'
  if (type === 'powerpoint') return 'PowerPoint'
  return 'Datei'
}

function detectType(file: File): string {
  const byMime = ACCEPTED_TYPES[file.type]
  if (byMime) return byMime
  const ext = file.name.split('.').pop()?.toLowerCase() ?? ''
  return EXT_MAP[ext] ?? 'other'
}

export function LessonResourceManager({ lessonId }: { lessonId: string }) {
  const [resources, setResources] = useState<Resource[]>([])
  const [loading, setLoading]     = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError]         = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Load existing resources
  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('lesson_downloads')
      .select('*')
      .eq('lesson_id', lessonId)
      .order('sort_order')
      .then(({ data }) => {
        setResources((data as Resource[]) ?? [])
        setLoading(false)
      })
  }, [lessonId])

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return
    setError(null)
    setUploading(true)

    const supabase = createClient()

    for (const file of Array.from(files)) {
      // Validation
      if (file.size > MAX_SIZE) {
        setError(`„${file.name}" ist zu groß (max. 50 MB).`)
        setUploading(false)
        return
      }
      const fileType = detectType(file)
      if (fileType === 'other') {
        setError(`„${file.name}": Dateityp nicht unterstützt. Erlaubt: PDF, Word, Excel, PowerPoint.`)
        setUploading(false)
        return
      }

      // Upload to Storage
      const ext       = file.name.split('.').pop()?.toLowerCase() ?? ''
      const safeName  = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const path      = `${lessonId}/${safeName}`

      const { error: uploadErr } = await supabase.storage
        .from('lesson-files')
        .upload(path, file, { cacheControl: '3600', upsert: false })

      if (uploadErr) {
        setError(`Upload fehlgeschlagen: ${uploadErr.message}`)
        setUploading(false)
        return
      }

      // Get signed URL for initial display (signed for 10 years ≈ permanent)
      const { data: signed } = await supabase.storage
        .from('lesson-files')
        .createSignedUrl(path, 60 * 60 * 24 * 365 * 10)

      const url = signed?.signedUrl ?? ''

      // Insert DB row
      const { data: row } = await supabase
        .from('lesson_downloads')
        .insert({
          lesson_id:    lessonId,
          title:        file.name,
          url,
          file_size:    file.size,
          file_type:    fileType,
          storage_path: path,
          sort_order:   resources.length,
        })
        .select()
        .single()

      if (row) setResources(prev => [...prev, row as Resource])
    }

    setUploading(false)
    if (inputRef.current) inputRef.current.value = ''
  }

  async function deleteResource(resource: Resource) {
    setDeletingId(resource.id)
    const supabase = createClient()

    // Delete from storage (if managed by us)
    if (resource.storage_path) {
      await supabase.storage.from('lesson-files').remove([resource.storage_path])
    }

    // Delete DB row
    await supabase.from('lesson_downloads').delete().eq('id', resource.id)

    setResources(prev => prev.filter(r => r.id !== resource.id))
    setDeletingId(null)
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-3 text-xs text-gray-400">
        <Loader2 className="h-3.5 w-3.5 animate-spin" /> Lädt…
      </div>
    )
  }

  return (
    <div className="space-y-3">

      {/* Existing files */}
      {resources.length > 0 && (
        <div className="space-y-1.5">
          {resources.map(r => (
            <div
              key={r.id}
              className="flex items-center gap-2.5 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2"
            >
              <FileIcon type={r.file_type} />
              <div className="flex-1 min-w-0">
                <p className="truncate text-xs font-medium text-gray-700">{r.title}</p>
                <p className="text-[11px] text-gray-400">
                  {typeLabel(r.file_type)}
                  {r.file_size ? ` · ${formatSize(r.file_size)}` : ''}
                </p>
              </div>
              <button
                onClick={() => deleteResource(r)}
                disabled={deletingId === r.id}
                className="flex-shrink-0 rounded p-1 text-gray-300 transition-colors hover:bg-red-50 hover:text-red-500"
                title="Löschen"
              >
                {deletingId === r.id
                  ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  : <Trash2 className="h-3.5 w-3.5" />
                }
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
          <span className="flex-1">{error}</span>
          <button onClick={() => setError(null)} className="flex-shrink-0">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Upload button */}
      <div>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".pdf,.docx,.doc,.xlsx,.xls,.pptx,.ppt,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation"
          className="hidden"
          onChange={e => handleFiles(e.target.files)}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-200 py-2.5 text-xs text-gray-400 transition-colors hover:border-brand-300 hover:text-brand-500 disabled:opacity-60"
        >
          {uploading
            ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Lädt hoch…</>
            : <><Upload className="h-3.5 w-3.5" /> Datei hochladen (PDF, Word, Excel, PowerPoint · max. 50 MB)</>
          }
        </button>
      </div>
    </div>
  )
}
