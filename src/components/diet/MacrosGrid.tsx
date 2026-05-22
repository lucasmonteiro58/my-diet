import { Activity, Droplets, Flame, Scale, Wheat, Zap } from 'lucide-react'
import type { Macros } from '../../types/diet'

interface MacrosGridProps {
  macros: Macros
}

const items = [
  { key: 'energyKcal', label: 'Energia', unit: 'kcal', icon: Flame, color: 'text-orange-600 bg-orange-50' },
  { key: 'carbsG', label: 'Carboidratos', unit: 'g', icon: Wheat, color: 'text-amber-600 bg-amber-50' },
  { key: 'proteinG', label: 'Proteínas', unit: 'g', icon: Zap, color: 'text-blue-600 bg-blue-50' },
  { key: 'lipidsG', label: 'Lipídios', unit: 'g', icon: Droplets, color: 'text-violet-600 bg-violet-50' },
  { key: 'fiberG', label: 'Fibras', unit: 'g', icon: Activity, color: 'text-emerald-600 bg-emerald-50' },
  { key: 'weightKg', label: 'Peso', unit: 'kg', icon: Scale, color: 'text-stone-600 bg-stone-100' },
] as const

export function MacrosGrid({ macros }: MacrosGridProps) {
  return (
    <section className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {items.map(({ key, label, unit, icon: Icon, color }) => (
        <div
          key={key}
          className="rounded-2xl border border-border bg-surface-elevated p-3 shadow-sm"
        >
          <div className={`mb-2 inline-flex rounded-lg p-1.5 ${color}`}>
            <Icon className="h-4 w-4" />
          </div>
          <p className="text-xs font-medium text-ink-muted">{label}</p>
          <p className="mt-0.5 text-lg font-bold tabular-nums text-ink">
            {macros[key]}
            <span className="ml-0.5 text-xs font-normal text-ink-muted">{unit}</span>
          </p>
        </div>
      ))}
    </section>
  )
}
