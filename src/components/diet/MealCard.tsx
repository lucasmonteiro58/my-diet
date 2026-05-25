import { ChevronDown, Clock, Info, Pencil, Plus, UtensilsCrossed } from 'lucide-react'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { useEditMode } from '../../contexts/EditModeContext'
import { parseFoodQuantity } from '../../lib/format-quantity'
import type { FoodEditTarget } from './FoodEditSheet'
import type { FoodItem, Meal } from '../../types/diet'

interface MealCardProps {
  meal: Meal
  menuId: string
  defaultOpen?: boolean
  onEditFood?: (target: FoodEditTarget) => void
}

function editLabelText(label: string): string {
  const map: Record<string, string> = {
    adicionado: 'Adicionado por você',
    nome: 'Nome alterado',
    quantidade: 'Quantidade alterada',
    'nome e quantidade': 'Nome e quantidade alterados',
    editado: 'Editado por você',
  }
  return map[label] ?? 'Editado por você'
}

function FoodRowContent({ food }: { food: FoodItem }) {
  const { highlight, detail } = parseFoodQuantity(food.quantity)

  return (
    <>
      <div className="min-w-0 flex-1">
        <span className="block text-sm leading-snug text-ink">{food.name}</span>
        {food.userEdited && food.editLabel && (
          <span className="mt-1 flex items-center gap-1.5 text-[10px] text-ink-muted">
            <span
              className="h-1 w-1 shrink-0 rounded-full bg-brand-600/70 dark:bg-brand-800/80"
              aria-hidden
            />
            {editLabelText(food.editLabel)}
          </span>
        )}
      </div>
      <div className="flex shrink-0 flex-col items-end gap-0.5 pl-2">
        <span className="rounded-lg border border-brand-200 bg-brand-50 px-2.5 py-1 text-base font-bold leading-none tabular-nums tracking-tight text-brand-800 dark:border-brand-500/50 dark:bg-brand-300/40 dark:text-brand-900">
          {highlight}
        </span>
        {detail && (
          <span className="max-w-32 truncate text-right text-[10px] leading-tight text-ink-muted">
            {detail}
          </span>
        )}
      </div>
    </>
  )
}

export function MealCard({ meal, menuId, defaultOpen = false, onEditFood }: MealCardProps) {
  const [open, setOpen] = useState(defaultOpen)
  const { enabled: editMode } = useEditMode()

  const transition = { duration: 0.35, ease: [0.4, 0, 0.2, 1] } as const

  return (
    <article className="overflow-hidden rounded-2xl border border-border bg-surface-elevated shadow-sm">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-3 p-4 text-left"
      >
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700 dark:bg-brand-300/40 dark:text-brand-900">
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
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={transition}
        >
          <ChevronDown className="h-5 w-5 shrink-0 text-ink-muted" />
        </motion.div>
      </button>

      {/* Always rendered — framer-motion can measure height reliably */}
      <motion.div
        initial={false}
        animate={open ? { height: 'auto', opacity: 1 } : { height: 0, opacity: 0 }}
        transition={transition}
        style={{ overflow: 'hidden' }}
      >
        <div className="space-y-4 border-t border-border px-4 pb-4 pt-3">
          {meal.preparations.map((prep, prepIndex) => (
            <div key={`${prep.name}-${prepIndex}`}>
              {prep.name && (
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-brand-700 dark:text-brand-900">
                  {prep.name}
                </p>
              )}
              {prep.foods.length > 0 ? (
                <ul className="space-y-2">
                  {prep.foods.map((food) => {
                    const rowClass = [
                      'flex w-full items-center justify-between gap-3 rounded-xl px-3 py-3',
                      'bg-subtle',
                      food.userEdited
                        ? 'border border-brand-300/30 dark:border-brand-500/25'
                        : 'border border-transparent',
                    ].join(' ')

                    if (!editMode) {
                      return (
                        <li key={food.id} className={rowClass}>
                          <FoodRowContent food={food} />
                        </li>
                      )
                    }

                    return (
                      <li key={food.id}>
                        <button
                          type="button"
                          onClick={() =>
                            onEditFood?.({
                              location: {
                                menuId,
                                mealId: meal.id,
                                prepIndex,
                                foodId: food.id,
                              },
                              preparationName: prep.name,
                              mealName: meal.name,
                              food,
                            })
                          }
                          className={[
                            rowClass,
                            'group text-left transition hover:bg-hover active:bg-active',
                          ].join(' ')}
                        >
                          <FoodRowContent food={food} />
                          <Pencil
                            className="ml-1 h-4 w-4 shrink-0 text-ink-muted/50 transition group-hover:text-ink-muted"
                            aria-hidden
                          />
                        </button>
                      </li>
                    )
                  })}
                </ul>
              ) : null}

              {editMode && (
                <button
                  type="button"
                  onClick={() =>
                    onEditFood?.({
                      location: { menuId, mealId: meal.id, prepIndex },
                      preparationName: prep.name,
                      mealName: meal.name,
                    })
                  }
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border py-2.5 text-sm font-medium text-ink-muted transition hover:border-brand-300 hover:bg-hover hover:text-ink"
                >
                  <Plus className="h-4 w-4" />
                  Adicionar alimento
                </button>
              )}
            </div>
          ))}

          {meal.notes && (
            <div className="flex gap-2 rounded-xl border border-warning-border bg-warning-subtle/80 p-3">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-warning-icon" />
              <p className="text-xs leading-relaxed text-warning-text">{meal.notes}</p>
            </div>
          )}
        </div>
      </motion.div>
    </article>
  )
}
