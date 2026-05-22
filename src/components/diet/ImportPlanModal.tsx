import {
  Check,
  ClipboardCopy,
  ExternalLink,
  FileJson,
  Sparkles,
  X,
} from 'lucide-react'
import { useState } from 'react'
import { buildDietExtractionPrompt } from '../../lib/ai-prompt'
import { useDiet } from '../../contexts/DietContext'
import { Button } from '../ui/Button'

interface ImportPlanModalProps {
  open: boolean
  onClose: () => void
}

type Step = 'prompt' | 'import'

export function ImportPlanModal({ open, onClose }: ImportPlanModalProps) {
  const { importFromJson, loadDemo } = useDiet()
  const [step, setStep] = useState<Step>('prompt')
  const [jsonText, setJsonText] = useState('')
  const [copied, setCopied] = useState(false)
  const [importing, setImporting] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)

  if (!open) return null

  const prompt = buildDietExtractionPrompt()

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(prompt)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      setLocalError('Não foi possível copiar. Selecione e copie manualmente.')
    }
  }

  const handleImport = async () => {
    setLocalError(null)
    setImporting(true)
    try {
      await importFromJson(jsonText)
      setJsonText('')
      setStep('prompt')
      onClose()
    } catch (e) {
      setLocalError(e instanceof Error ? e.message : 'Erro ao importar JSON')
    } finally {
      setImporting(false)
    }
  }

  const handleFile = (file: File) => {
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') setJsonText(reader.result)
    }
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
            2. Colar JSON
          </button>
        </div>

        <div className="overflow-y-auto px-5 py-4">
          {step === 'prompt' ? (
            <div className="space-y-4">
              <div className="flex gap-3 rounded-2xl bg-brand-50 p-4">
                <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-brand-700" />
                <div className="text-sm leading-relaxed text-brand-900">
                  <p className="font-semibold">Conversão externa (Gemini, ChatGPT…)</p>
                  <p className="mt-1 text-brand-800/90">
                    O app não processa o PDF. Você usa uma IA na web e cola o resultado
                    aqui.
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
                    (ou outra IA com upload de PDF).
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">
                    2
                  </span>
                  <span>Anexe o PDF do plano alimentar no chat.</span>
                </li>
                <li className="flex gap-2">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">
                    3
                  </span>
                  <span>Copie o prompt abaixo e envie na conversa.</span>
                </li>
                <li className="flex gap-2">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">
                    4
                  </span>
                  <span>
                    Copie o JSON que a IA devolver e vá em{' '}
                    <strong>2. Colar JSON</strong>.
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
            <div className="space-y-3">
              <p className="text-sm text-ink-muted">
                Cole o JSON retornado pela IA (pode incluir{' '}
                <code className="rounded bg-stone-100 px-1">```json</code>).
              </p>

              <textarea
                value={jsonText}
                onChange={(e) => setJsonText(e.target.value)}
                placeholder='{ "patientName": "...", "menus": [...] }'
                className="h-48 w-full resize-y rounded-2xl border border-border bg-white px-4 py-3 font-mono text-xs text-ink outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
                spellCheck={false}
              />

              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed border-border py-3 text-sm font-medium text-brand-700 hover:bg-brand-50">
                <FileJson className="h-4 w-4" />
                Ou carregar arquivo .json
                <input
                  type="file"
                  accept="application/json,.json"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleFile(file)
                  }}
                />
              </label>
            </div>
          )}

          {localError && (
            <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
              {localError}
            </p>
          )}
        </div>

        <div className="space-y-2 border-t border-border px-5 py-4">
          {step === 'import' ? (
            <Button
              fullWidth
              disabled={!jsonText.trim() || importing}
              onClick={() => void handleImport()}
            >
              {importing ? 'Importando...' : 'Usar este plano'}
            </Button>
          ) : (
            <Button fullWidth variant="outline" onClick={() => setStep('import')}>
              Já tenho o JSON → colar
            </Button>
          )}

          <Button
            fullWidth
            variant="secondary"
            onClick={() => {
              loadDemo()
              onClose()
            }}
          >
            Usar plano de demonstração (Lucas)
          </Button>
        </div>
      </div>
    </div>
  )
}
