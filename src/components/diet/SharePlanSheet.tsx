import { Check, Copy, Loader2, Share2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useSharedDiets } from '../../contexts/SharedDietsContext'
import { BottomSheet } from '../ui/BottomSheet'
import { Button } from '../ui/Button'

interface SharePlanSheetProps {
  open: boolean
  onClose: () => void
}

export function SharePlanSheet({ open, onClose }: SharePlanSheetProps) {
  const { shareOwnPlan, sharingPlan } = useSharedDiets()
  const [code, setCode] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!open) {
      setCode(null)
      setCopied(false)
      return
    }

    shareOwnPlan()
      .then(setCode)
      .catch(() => {
        // error already toasted inside shareOwnPlan
      })
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleCopy() {
    if (!code) return
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleNativeShare() {
    if (!code) return
    await navigator.share({
      title: 'Código do meu plano alimentar',
      text: `Use o código ${code} no app My Diet para ver meu plano alimentar.`,
    })
  }

  const canNativeShare = typeof navigator !== 'undefined' && !!navigator.share

  return (
    <BottomSheet open={open} onClose={onClose} title="Compartilhar meu plano">
      <div className="space-y-5 px-5 pb-4">
        <p className="text-sm text-ink-muted">
          Compartilhe o código abaixo com quem quiser que veja seu plano alimentar. Eles
          precisarão inserir o código no app.
        </p>

        <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-surface-elevated py-6">
          {sharingPlan || !code ? (
            <Loader2 className="h-8 w-8 animate-spin text-brand-600 dark:text-brand-400" />
          ) : (
            <>
              <p className="text-xs font-medium uppercase tracking-widest text-ink-muted">
                Código de compartilhamento
              </p>
              <p className="text-4xl font-bold tracking-[0.4em] text-brand-600 dark:text-brand-400">
                {code}
              </p>
            </>
          )}
        </div>

        <Button
          fullWidth
          disabled={sharingPlan || !code}
          onClick={() => void handleCopy()}
        >
          {copied ? (
            <>
              <Check className="h-4 w-4" />
              Código copiado!
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              Copiar código
            </>
          )}
        </Button>

        {canNativeShare && (
          <Button
            fullWidth
            variant="secondary"
            disabled={sharingPlan || !code}
            onClick={() => void handleNativeShare()}
          >
            <Share2 className="h-4 w-4" />
            Compartilhar via...
          </Button>
        )}
      </div>
    </BottomSheet>
  )
}
