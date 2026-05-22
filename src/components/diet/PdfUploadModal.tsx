import { FileUp, Loader2, X } from 'lucide-react'
import { useRef, useState } from 'react'
import { useDiet } from '../../contexts/DietContext'
import { Button } from '../ui/Button'

interface PdfUploadModalProps {
  open: boolean
  onClose: () => void
}

export function PdfUploadModal({ open, onClose }: PdfUploadModalProps) {
  const { importPdf, loadDemo, savePlan } = useDiet()
  const inputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)

  if (!open) return null

  const handleFile = async (file: File) => {
    if (!file.type.includes('pdf')) return
    setLoading(true)
    try {
      await importPdf(file)
      await savePlan()
      onClose()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
      <div
        className="w-full max-w-lg animate-in rounded-3xl bg-surface-elevated p-5 shadow-2xl"
        role="dialog"
        aria-modal="true"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-ink">Importar plano</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-ink-muted hover:bg-stone-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="mb-4 text-sm text-ink-muted">
          Envie o PDF do seu nutricionista. O app extrai cardápios, refeições e
          recomendações automaticamente.
        </p>

        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) void handleFile(file)
          }}
        />

        <Button
          fullWidth
          disabled={loading}
          onClick={() => inputRef.current?.click()}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <FileUp className="h-4 w-4" />
          )}
          {loading ? 'Processando PDF...' : 'Selecionar PDF'}
        </Button>

        <Button
          fullWidth
          variant="secondary"
          className="mt-2"
          onClick={() => {
            loadDemo()
            onClose()
          }}
        >
          Usar plano de demonstração (Lucas)
        </Button>
      </div>
    </div>
  )
}
