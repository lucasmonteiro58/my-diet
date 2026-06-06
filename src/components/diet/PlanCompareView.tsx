import { ArrowRight, Minus, Plus } from 'lucide-react'
import { diffDietPlans, type FoodChange } from '../../lib/plan-diff'
import type { DietPlan } from '../../types/diet'
import { CollapsibleSection } from '../ui/CollapsibleSection'
import { MacrosCompareGrid } from './MacrosCompareGrid'

interface PlanCompareViewProps {
  planA: DietPlan
  planB: DietPlan
  labelA: string
  labelB: string
}

function foodChangeSummary(changes: FoodChange[]): string {
  if (changes.length === 0) return 'Sem alterações'
  const added = changes.filter((c) => c.type === 'added').length
  const removed = changes.filter((c) => c.type === 'removed').length
  const changed = changes.filter((c) => c.type === 'changed').length
  const parts: string[] = []
  if (added) parts.push(`${added} adicionado${added > 1 ? 's' : ''}`)
  if (removed) parts.push(`${removed} removido${removed > 1 ? 's' : ''}`)
  if (changed) parts.push(`${changed} alterado${changed > 1 ? 's' : ''}`)
  return parts.join(', ')
}

function FoodChangeRow({ change }: { change: FoodChange }) {
  const badge =
    change.type === 'added'
      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'
      : change.type === 'removed'
        ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300'
        : 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300'

  const Icon =
    change.type === 'added' ? Plus : change.type === 'removed' ? Minus : ArrowRight

  return (
    <li className="rounded-xl border border-border bg-surface px-3 py-2.5 text-sm">
      <div className="flex items-start gap-2">
        <span className={`mt-0.5 inline-flex rounded-md p-1 ${badge}`}>
          <Icon className="h-3.5 w-3.5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-medium text-ink">{change.name}</p>
          <p className="mt-0.5 text-xs text-ink-muted">
            {change.menuTitle} · {change.mealName}
            {change.prepName ? ` · ${change.prepName}` : ''}
          </p>
          {change.type === 'changed' && (
            <p className="mt-1 tabular-nums text-xs text-ink-muted">
              {change.quantityA} →{' '}
              <span className="font-medium text-ink">{change.quantityB}</span>
            </p>
          )}
          {change.type === 'added' && change.quantityB && (
            <p className="mt-1 text-xs text-ink-muted">{change.quantityB}</p>
          )}
          {change.type === 'removed' && change.quantityA && (
            <p className="mt-1 text-xs text-ink-muted line-through opacity-70">
              {change.quantityA}
            </p>
          )}
        </div>
      </div>
    </li>
  )
}

function StringListDiff({
  title,
  added,
  removed,
}: {
  title: string
  added: string[]
  removed: string[]
}) {
  if (added.length === 0 && removed.length === 0) return null

  const summary = [
    added.length ? `+${added.length}` : '',
    removed.length ? `-${removed.length}` : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <CollapsibleSection title={title} summary={summary || 'Alterações'}>
      <ul className="space-y-2">
        {added.map((item) => (
          <li
            key={`add-${item}`}
            className="flex items-start gap-2 rounded-xl border border-emerald-200/60 bg-emerald-50/50 px-3 py-2 text-sm dark:border-emerald-900/40 dark:bg-emerald-950/20"
          >
            <Plus className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <span className="text-ink">{item}</span>
          </li>
        ))}
        {removed.map((item) => (
          <li
            key={`rem-${item}`}
            className="flex items-start gap-2 rounded-xl border border-rose-200/60 bg-rose-50/50 px-3 py-2 text-sm dark:border-rose-900/40 dark:bg-rose-950/20"
          >
            <Minus className="mt-0.5 h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
            <span className="text-ink line-through opacity-80">{item}</span>
          </li>
        ))}
      </ul>
    </CollapsibleSection>
  )
}

export function PlanCompareView({ planA, planB, labelA, labelB }: PlanCompareViewProps) {
  const diff = diffDietPlans(planA, planB)
  const samePlan = planA.id === planB.id

  if (samePlan) {
    return (
      <p className="rounded-2xl border border-border bg-subtle px-4 py-6 text-center text-sm text-ink-muted">
        Selecione duas versões diferentes para comparar.
      </p>
    )
  }

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wide text-ink-muted">
          Macronutrientes
        </h2>
        <MacrosCompareGrid deltas={diff.macroDeltas} labelA={labelA} labelB={labelB} />
      </section>

      {diff.metadataChanges.length > 0 && (
        <CollapsibleSection
          title="Informações gerais"
          summary={`${diff.metadataChanges.length} alteração${diff.metadataChanges.length > 1 ? 'ões' : ''}`}
        >
          <ul className="space-y-2">
            {diff.metadataChanges.map((change) => (
              <li
                key={change.field}
                className="rounded-xl border border-border bg-surface px-3 py-2.5 text-sm"
              >
                <p className="text-xs font-medium text-ink-muted">{change.field}</p>
                <p className="mt-0.5 tabular-nums text-ink">
                  {change.a} → <span className="font-semibold">{change.b}</span>
                </p>
              </li>
            ))}
          </ul>
        </CollapsibleSection>
      )}

      {diff.foodChanges.length > 0 && (
        <CollapsibleSection
          title="Alimentos"
          summary={foodChangeSummary(diff.foodChanges)}
        >
          <ul className="space-y-2">
            {diff.foodChanges.map((change, idx) => (
              <FoodChangeRow key={`${change.type}-${change.name}-${idx}`} change={change} />
            ))}
          </ul>
        </CollapsibleSection>
      )}

      <StringListDiff
        title="Suplementação"
        added={diff.supplementsAdded}
        removed={diff.supplementsRemoved}
      />

      <StringListDiff
        title="Recomendações"
        added={diff.recommendationsAdded}
        removed={diff.recommendationsRemoved}
      />

      {diff.foodChanges.length === 0 &&
        diff.supplementsAdded.length === 0 &&
        diff.supplementsRemoved.length === 0 &&
        diff.recommendationsAdded.length === 0 &&
        diff.recommendationsRemoved.length === 0 &&
        diff.metadataChanges.length === 0 &&
        diff.macroDeltas.every((d) => d.delta === 0) && (
          <p className="rounded-2xl border border-border bg-subtle px-4 py-6 text-center text-sm text-ink-muted">
            As duas versões são idênticas nos macronutrientes e conteúdo comparado.
          </p>
        )}
    </div>
  )
}
