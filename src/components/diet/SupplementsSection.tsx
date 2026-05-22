import { Pill } from 'lucide-react'
import type { Supplement } from '../../types/diet'
import { CollapsibleSection } from '../ui/CollapsibleSection'

interface SupplementsSectionProps {
  supplements: Supplement[]
}

function supplementSummary(count: number): string {
  return count === 1 ? '1 suplemento' : `${count} suplementos`
}

export function SupplementsSection({ supplements }: SupplementsSectionProps) {
  if (!supplements.length) return null

  return (
    <CollapsibleSection
      title="Suplementação"
      summary={supplementSummary(supplements.length)}
    >
      <div className="space-y-3">
      {supplements.map((sup) => (
        <div
          key={sup.name}
          className="rounded-2xl border border-border bg-surface-elevated p-4 shadow-sm"
        >
          <div className="flex items-center gap-2">
            <span className="rounded-lg bg-violet-50 p-2 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300">
              <Pill className="h-4 w-4" />
            </span>
            <h3 className="font-semibold text-ink">{sup.name}</h3>
          </div>
          <dl className="mt-3 space-y-2 text-sm">
            <div>
              <dt className="text-xs font-medium text-ink-muted">Dose</dt>
              <dd className="text-ink">{sup.dose}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-ink-muted">Recomendação</dt>
              <dd className="leading-relaxed text-ink">{sup.recommendation}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-ink-muted">Opções</dt>
              <dd className="leading-relaxed text-ink-muted">{sup.options}</dd>
            </div>
          </dl>
        </div>
      ))}
      </div>
    </CollapsibleSection>
  )
}
