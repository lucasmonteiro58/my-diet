import {
  Check,
  ClipboardCopy,
  ExternalLink,
  FileJson,
  FileText,
  Loader2,
  Sparkles,
  Upload,
  X,
} from 'lucide-react'
import { useRef, useState } from 'react'
import { buildDietExtractionPrompt, DIET_JSON_FILENAME } from '../../lib/ai-prompt'
import { DEFAULT_GEMINI_MODEL, isGeminiConfigured } from '../../lib/gemini'
import { useDiet } from '../../contexts/DietContext'
import { Button } from '../ui/Button'

interface ImportPlanModalProps {
  open: boolean
  onClose: () => void
}

type Mode = 'gemini' | 'manual'
type ManualStep = 'prompt' | 'json'

export function ImportPlanModal({ open, onClose }: ImportPlanModalProps) {
  const { importFromJson, importFromPdf } = useDiet()
  const [mode, setMode] = useState<Mode>('gemini')
  const [manualStep, setManualStep] = useState<ManualStep>('prompt')
  const [jsonText, setJsonText] = useState('')
  const [fileName, setFileName] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState<string | null>(null)
  const [localError, setLocalError] = useState<string | null>(null)
  const pdfInputRef = useRef<HTMLInputElement>(null)
  const jsonInputRef = useRef<HTMLInputElement>(null)

  const geminiReady = isGeminiConfigured()
  const manualPrompt = buildDietExtractionPrompt()

  if (!open) return null

  const resetAndClose = () => {
    setJsonText('')
    setFileName(null)
    setStatus(null)
    setLocalError(null)
    setMode('gemini')
    setManualStep('prompt')
    onClose()
  }

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(manualPrompt)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
      setLocalError(null)
    } catch {
      setLocalError('Não foi possível copiar. Selecione e copie manualmente.')
    }
  }

  const runJsonImport = async (content: string) => {
    setLocalError(null)
    setBusy(true)
    setStatus('Validando plano...')
    try {
      await importFromJson(content)
      resetAndClose()
    } catch (e) {
      setLocalError(e instanceof Error ? e.message : 'Erro ao importar JSON')
    } finally {
      setBusy(false)
      setStatus(null)
    }
  }

  const handlePdf = async (file: File) => {
    if (!geminiReady) {
      setLocalError('Configure VITE_GEMINI_API_KEY no .env e reinicie o servidor.')
      return
    }
    setFileName(file.name)
    setLocalError(null)
    setBusy(true)
    setStatus('Enviando PDF para o Gemini...')
    try {
      await importFromPdf(file)
      resetAndClose()
    } catch (e) {
      setLocalError(e instanceof Error ? e.message : 'Erro ao processar o PDF')
    } finally {
      setBusy(false)
      setStatus(null)
    }
  }

  const handleJsonFile = (file: File) => {
    if (!file.name.endsWith('.json') && file.type !== 'application/json') {
      setLocalError('Selecione um arquivo .json')
      return
    }
    setFileName(file.name)
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setJsonText(reader.result)
        void runJsonImport(reader.result)
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
            onClick={() => {
              setMode('gemini')
              setLocalError(null)
            }}
            className={[
              'rounded-xl px-3 py-2 text-sm font-medium transition',
              mode === 'gemini'
                ? 'bg-brand-600 text-white'
                : 'text-ink-muted hover:bg-stone-100',
            ].join(' ')}
          >
            Enviar PDF
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('manual')
              setLocalError(null)
            }}
            className={[
              'rounded-xl px-3 py-2 text-sm font-medium transition',
              mode === 'manual'
                ? 'bg-brand-600 text-white'
                : 'text-ink-muted hover:bg-stone-100',
            ].join(' ')}
          >
            Manual
          </button>
        </div>

        <div className="overflow-y-auto px-5 py-4">
          {mode === 'gemini' ? (
            <div className="space-y-4">
              <div className="flex gap-3 rounded-2xl bg-brand-50 p-4">
                <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-brand-700" />
                <div className="text-sm leading-relaxed text-brand-900">
                  <p className="font-semibold">Importação automática</p>
                  <p className="mt-1 text-brand-800/90">
                    Envie o PDF e o app extrai o plano com a API do Gemini.
                  </p>
                </div>
              </div>

              {!geminiReady && (
                <p className="rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-900">
                  Adicione <code className="font-mono text-xs">VITE_GEMINI_API_KEY</code>{' '}
                  no arquivo <code className="font-mono text-xs">.env</code> e reinicie{' '}
                  <code className="font-mono text-xs">npm run dev</code>.
                </p>
              )}

              {geminiReady && (
                <p className="text-xs leading-relaxed text-ink-muted">
                  Modelo: <strong>{DEFAULT_GEMINI_MODEL}</strong> (cota gratuita: ~20
                  envios/dia). Limites em{' '}
                  <a
                    href="https://aistudio.google.com/rate-limit"
                    target="_blank"
                    rel="noreferrer"
                    className="text-brand-700 underline"
                  >
                    AI Studio
                  </a>
                  .
                </p>
              )}

              <input
                ref={pdfInputRef}
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) void handlePdf(file)
                  e.target.value = ''
                }}
              />

              <button
                type="button"
                onClick={() => pdfInputRef.current?.click()}
                disabled={busy || !geminiReady}
                className="flex w-full flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-brand-300 bg-brand-50/50 px-4 py-8 transition hover:border-brand-500 hover:bg-brand-50 disabled:opacity-50"
              >
                {busy ? (
                  <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
                ) : (
                  <FileText className="h-8 w-8 text-brand-600" />
                )}
                <span className="text-sm font-semibold text-brand-800">
                  {busy ? status ?? 'Processando...' : 'Selecionar PDF do plano'}
                </span>
                <span className="text-xs text-ink-muted">Plano alimentar em PDF (até 20 MB)</span>
              </button>

              {fileName && busy && (
                <p className="text-center text-xs text-ink-muted">{fileName}</p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex gap-1 rounded-xl bg-stone-100 p-1">
                <button
                  type="button"
                  onClick={() => setManualStep('prompt')}
                  className={[
                    'flex-1 rounded-lg py-2 text-xs font-medium transition',
                    manualStep === 'prompt'
                      ? 'bg-white text-ink shadow-sm'
                      : 'text-ink-muted',
                  ].join(' ')}
                >
                  Copiar prompt
                </button>
                <button
                  type="button"
                  onClick={() => setManualStep('json')}
                  className={[
                    'flex-1 rounded-lg py-2 text-xs font-medium transition',
                    manualStep === 'json'
                      ? 'bg-white text-ink shadow-sm'
                      : 'text-ink-muted',
                  ].join(' ')}
                >
                  Colar JSON
                </button>
              </div>

              {manualStep === 'prompt' ? (
                <>
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
                        e anexe o PDF.
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
                        Copie o JSON do bloco <strong>```json</strong> na resposta e cole em{' '}
                        <strong>Colar JSON</strong>.
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

                  <Button
                    fullWidth
                    variant="outline"
                    onClick={() => setManualStep('json')}
                  >
                    Já tenho o JSON →
                  </Button>
                </>
              ) : (
                <>
                  <input
                    ref={jsonInputRef}
                    type="file"
                    accept="application/json,.json"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleJsonFile(file)
                      e.target.value = ''
                    }}
                  />

                  <button
                    type="button"
                    onClick={() => jsonInputRef.current?.click()}
                    disabled={busy}
                    className="flex w-full flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-border px-4 py-6 transition hover:border-brand-300 hover:bg-brand-50/50 disabled:opacity-50"
                  >
                    <Upload className="h-7 w-7 text-brand-600" />
                    <span className="text-sm font-semibold text-ink">
                      Selecionar {DIET_JSON_FILENAME}
                    </span>
                  </button>

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
                    disabled={!jsonText.trim() || busy}
                    onClick={() => void runJsonImport(jsonText)}
                  >
                    <FileJson className="h-4 w-4" />
                    {busy ? 'Importando...' : 'Usar este plano'}
                  </Button>
                </>
              )}
            </div>
          )}

          {localError && (
            <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
              {localError}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
