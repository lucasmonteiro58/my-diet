import { ChevronDown, Clock, Info, UtensilsCrossed } from 'lucide-react'
import { useState } from 'react'
import type { Meal } from '../../types/diet'

interface MealCardProps {
  meal: Meal
  defaultOpen?: boolean
}

export function MealCard({ meal, defaultOpen = false }: MealCardProps) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <article className="overflow-hidden rounded-2xl border border-border bg-surface-elevated shadow-sm">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-3 p-4 text-left"
      >
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
          <UtensilsCrossed className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-ink">{meal.name}</h3>
          {meal.time && (
            <p className="mt-0.5 flex items-center gap-1 text-xs text-ink-muted">
              <Clock className="h-3 w-3" />
              {meal.time}
            </p>
          )}
        </div>
        <ChevronDown
          className={`h-5 w-5 shrink-0 text-ink-muted transition ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="space-y-4 border-t border-border px-4 pb-4 pt-3">
          {meal.preparations.map((prep, idx) => (
            <div key={`${prep.name}-${idx}`}>
              {prep.name && prep.foods.length > 0 && (
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-brand-700">
                  {prep.name}
                </p>
              )}
              {prep.foods.length > 0 ? (
                <ul className="space-y-2">
                  {prep.foods.map((food, foodIdx) => (
                    <li
                      key={`${food.name}-${foodIdx}`}
                      className="flex items-start justify-between gap-3 rounded-xl bg-subtle px-3 py-2.5"
                    >
                      <span className="text-sm font-medium text-ink">{food.name}</span>
                      <span className="shrink-0 text-right text-xs text-ink-muted">
                        {food.quantity}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          ))}

          {meal.notes && (
            <div className="flex gap-2 rounded-xl border border-warning-border bg-warning-subtle/80 p-3">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-warning-icon" />
              <p className="text-xs leading-relaxed text-warning-text">{meal.notes}</p>
            </div>
          )}
        </div>
      )}
    </article>
  )
}
