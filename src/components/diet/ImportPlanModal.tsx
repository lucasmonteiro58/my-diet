import {
  Check,
  ClipboardCopy,
  ExternalLink,
  FileJson,
  Sparkles,
  Upload,
  X,
} from 'lucide-react'
import { useRef, useState } from 'react'
import { buildDietExtractionPrompt, DIET_JSON_FILENAME } from '../../lib/ai-prompt'
import { useDiet } from '../../contexts/DietContext'
import { Button } from '../ui/Button'

interface ImportPlanModalProps {
  open: boolean
  onClose: () => void
}

type Step = 'prompt' | 'import'

export function ImportPlanModal({ open, onClose }: ImportPlanModalProps) {
  const { importFromJson } = useDiet()
  const [step, setStep] = useState<Step>('prompt')
  const [jsonText, setJsonText] = useState('')
  const [fileName, setFileName] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [importing, setImporting] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!open) return null

  const prompt = buildDietExtractionPrompt()

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(prompt)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
      setLocalError(null)
    } catch {
      setLocalError('Não foi possível copiar. Selecione e copie manualmente.')
    }
  }

  const runImport = async (content: string) => {
    setLocalError(null)
    setImporting(true)
    try {
      await importFromJson(content)
      setJsonText('')
      setFileName(null)
      setStep('prompt')
      onClose()
    } catch (e) {
      setLocalError(e instanceof Error ? e.message : 'Erro ao importar JSON')
    } finally {
      setImporting(false)
    }
  }

  const handleFile = (file: File) => {
    if (!file.name.endsWith('.json') && file.type !== 'application/json') {
      setLocalError('Selecione um arquivo .json')
      return
    }
    setFileName(file.name)
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setJsonText(reader.result)
        void runImport(reader.result)
      }
    }
    reader.onerror = () => setLocalError('Não foi possível ler o arquivo.')
    reader.readAsText(file)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
      <div
        className="flex max-h-[90dvh] w-full max-w-lg flex-col overflow-hidden rounded-3xl bg-surface-elevated shadow-2xl"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-lg font-bold text-ink">Importar plano</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-ink-muted hover:bg-stone-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex gap-1 border-b border-border px-5 py-2">
          <button
            type="button"
            onClick={() => setStep('prompt')}
            className={[
              'rounded-xl px-3 py-2 text-sm font-medium transition',
              step === 'prompt'
                ? 'bg-brand-600 text-white'
                : 'text-ink-muted hover:bg-stone-100',
            ].join(' ')}
          >
            1. IA + PDF
          </button>
          <button
            type="button"
            onClick={() => setStep('import')}
            className={[
              'rounded-xl px-3 py-2 text-sm font-medium transition',
              step === 'import'
                ? 'bg-brand-600 text-white'
                : 'text-ink-muted hover:bg-stone-100',
            ].join(' ')}
          >
            2. Arquivo JSON
          </button>
        </div>

        <div className="overflow-y-auto px-5 py-4">
          {step === 'prompt' ? (
            <div className="space-y-4">
              <div className="flex gap-3 rounded-2xl bg-brand-50 p-4">
                <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-brand-700" />
                <div className="text-sm leading-relaxed text-brand-900">
                  <p className="font-semibold">Conversão na IA (Gemini, ChatGPT…)</p>
                  <p className="mt-1 text-brand-800/90">
                    O prompt pede um arquivo{' '}
                    <code className="rounded bg-white/60 px-1 font-mono text-xs">
                      {DIET_JSON_FILENAME}
                    </code>{' '}
                    para baixar e importar no app.
                  </p>
                </div>
              </div>

              <ol className="space-y-3 text-sm text-ink">
                <li className="flex gap-2">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">
                    1
                  </span>
                  <span>
                    Abra{' '}
                    <a
                      href="https://gemini.google.com"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-0.5 font-medium text-brand-700 underline"
                    >
                      Gemini
                      <ExternalLink className="h-3 w-3" />
                    </a>{' '}
                    e anexe o PDF do plano.
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">
                    2
                  </span>
                  <span>Copie o prompt e envie no chat.</span>
                </li>
                <li className="flex gap-2">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">
                    3
                  </span>
                  <span>
                    Baixe o arquivo <strong>{DIET_JSON_FILENAME}</strong> que a IA
                    gerar (ou salve o JSON que ela colar no chat como .json).
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">
                    4
                  </span>
                  <span>
                    No app, aba <strong>2. Arquivo JSON</strong> e selecione o
                    arquivo.
                  </span>
                </li>
              </ol>

              <Button fullWidth onClick={() => void handleCopyPrompt()}>
                {copied ? (
                  <>
                    <Check className="h-4 w-4" />
                    Prompt copiado!
                  </>
                ) : (
                  <>
                    <ClipboardCopy className="h-4 w-4" />
                    Copiar prompt para IA
                  </>
                )}
              </Button>

              <details className="rounded-2xl border border-border bg-stone-50">
                <summary className="cursor-pointer px-4 py-3 text-xs font-medium text-ink-muted">
                  Ver prompt completo
                </summary>
                <pre className="max-h-48 overflow-auto whitespace-pre-wrap break-words px-4 pb-4 text-xs text-ink">
                  {prompt}
                </pre>
              </details>
            </div>
          ) : (
            <div className="space-y-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="application/json,.json"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleFile(file)
                  e.target.value = ''
                }}
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={importing}
                className="flex w-full flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-brand-300 bg-brand-50/50 px-4 py-8 transition hover:border-brand-500 hover:bg-brand-50 disabled:opacity-50"
              >
                <Upload className="h-8 w-8 text-brand-600" />
                <span className="text-sm font-semibold text-brand-800">
                  {importing
                    ? 'Importando...'
                    : `Selecionar ${DIET_JSON_FILENAME}`}
                </span>
                <span className="text-xs text-ink-muted">
                  Arquivo gerado pela IA ou salvo do chat
                </span>
              </button>

              {fileName && !importing && (
                <p className="text-center text-xs text-brand-700">
                  Arquivo: {fileName}
                </p>
              )}

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-surface-elevated px-2 text-ink-muted">
                    ou cole o JSON
                  </span>
                </div>
              </div>

              <textarea
                value={jsonText}
                onChange={(e) => setJsonText(e.target.value)}
                placeholder='{ "patientName": "...", "menus": [...] }'
                className="h-36 w-full resize-y rounded-2xl border border-border bg-white px-4 py-3 font-mono text-xs text-ink outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
                spellCheck={false}
              />

              <Button
                fullWidth
                variant="outline"
                disabled={!jsonText.trim() || importing}
                onClick={() => void runImport(jsonText)}
              >
                <FileJson className="h-4 w-4" />
                Importar texto colado
              </Button>
            </div>
          )}

          {localError && (
            <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
              {localError}
            </p>
          )}
        </div>

        <div className="border-t border-border px-5 py-4">
          {step === 'prompt' ? (
            <Button fullWidth variant="outline" onClick={() => setStep('import')}>
              Já tenho o arquivo JSON →
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  )
}
