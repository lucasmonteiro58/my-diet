import { Activity, Droplets, Flame, Minus, Scale, TrendingDown, TrendingUp, Wheat, Zap } from 'lucide-react'
import type { MacroDelta } from '../../lib/plan-diff'
import type { Macros } from '../../types/diet'

const items = [
  {
    key: 'energyKcal' as const,
    label: 'Energia',
    unit: 'kcal',
    icon: Flame,
    color:
      'text-orange-600 bg-orange-50 dark:text-orange-300 dark:bg-orange-950/60',
  },
  {
    key: 'carbsG' as const,
    label: 'Carboidratos',
    unit: 'g',
    icon: Wheat,
    color: 'text-amber-600 bg-amber-50 dark:text-amber-300 dark:bg-amber-950/60',
  },
  {
    key: 'proteinG' as const,
    label: 'Proteínas',
    unit: 'g',
    icon: Zap,
    color: 'text-blue-600 bg-blue-50 dark:text-blue-300 dark:bg-blue-950/60',
  },
  {
    key: 'lipidsG' as const,
    label: 'Lipídios',
    unit: 'g',
    icon: Droplets,
    color: 'text-violet-600 bg-violet-50 dark:text-violet-300 dark:bg-violet-950/60',
  },
  {
    key: 'fiberG' as const,
    label: 'Fibras',
    unit: 'g',
    icon: Activity,
    color:
      'text-emerald-600 bg-emerald-50 dark:text-emerald-300 dark:bg-emerald-950/60',
  },
  {
    key: 'weightKg' as const,
    label: 'Peso',
    unit: 'kg',
    icon: Scale,
    color: 'text-ink-muted bg-subtle',
  },
]

interface MacrosCompareGridProps {
  deltas: MacroDelta[]
  labelA: string
  labelB: string
}

function formatDelta(delta: number, unit: string): string {
  if (delta === 0) return '0'
  const sign = delta > 0 ? '+' : ''
  return `${sign}${delta}${unit === 'kcal' ? '' : ''}`
}

function DeltaBadge({ delta, unit }: { delta: number; unit: string }) {
  if (delta === 0) {
    return (
      <span className="inline-flex items-center gap-0.5 rounded-full bg-subtle px-2 py-0.5 text-xs font-medium text-ink-muted">
        <Minus className="h-3 w-3" />
        igual
      </span>
    )
  }

  const increased = delta > 0
  return (
    <span
      className={[
        'inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums',
        increased
          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'
          : 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300',
      ].join(' ')}
    >
      {increased ? (
        <TrendingUp className="h-3 w-3" />
      ) : (
        <TrendingDown className="h-3 w-3" />
      )}
      {formatDelta(delta, unit)}
      <span className="font-normal opacity-80">{unit}</span>
    </span>
  )
}

export function MacrosCompareGrid({ deltas, labelA, labelB }: MacrosCompareGridProps) {
  const deltaMap = new Map<keyof Macros, MacroDelta>(
    deltas.map((d) => [d.key, d]),
  )

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-2 text-xs text-ink-muted">
        <span className="truncate font-medium">{labelA}</span>
        <span className="shrink-0">→</span>
        <span className="truncate text-right font-medium">{labelB}</span>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {items.map(({ key, label, unit, icon: Icon, color }) => {
          const delta = deltaMap.get(key)
          if (!delta) return null

          return (
            <div
              key={key}
              className="rounded-2xl border border-border bg-surface-elevated p-3 shadow-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <div className={`inline-flex rounded-lg p-1.5 ${color}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <DeltaBadge delta={delta.delta} unit={unit} />
              </div>
              <p className="mt-2 text-xs font-medium text-ink-muted">{label}</p>
              <div className="mt-1 flex items-baseline gap-2 tabular-nums">
                <span className="text-base font-semibold text-ink-muted">
                  {delta.a}
                  <span className="ml-0.5 text-xs font-normal">{unit}</span>
                </span>
                <span className="text-xs text-ink-muted">→</span>
                <span className="text-lg font-bold text-ink">
                  {delta.b}
                  <span className="ml-0.5 text-xs font-normal text-ink-muted">
                    {unit}
                  </span>
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
