import { Calendar, Check, Plus, Trash2, User, Users } from 'lucide-react'
import { useSharedDiets } from '../../contexts/SharedDietsContext'
import { useDiet } from '../../contexts/DietContext'
import { BottomSheet } from '../ui/BottomSheet'

interface DietSwitcherSheetProps {
  open: boolean
  onClose: () => void
  onAddNew: () => void
}

export function DietSwitcherSheet({ open, onClose, onAddNew }: DietSwitcherSheetProps) {
  const { plan: ownPlan } = useDiet()
  const { sharedPlans, activePlanId, setActivePlanId, removeSharedPlan } = useSharedDiets()

  function handleSelect(id: 'own' | string) {
    setActivePlanId(id)
    onClose()
  }

  function handleRemove(e: React.MouseEvent, code: string) {
    e.stopPropagation()
    removeSharedPlan(code)
  }

  return (
    <BottomSheet open={open} onClose={onClose} title="Selecionar dieta">
      <div className="space-y-2 px-5 pb-4">
        {ownPlan && (
          <button
            type="button"
            onClick={() => handleSelect('own')}
            className={[
              'group relative w-full rounded-2xl border p-4 text-left transition',
              activePlanId === 'own'
                ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/30'
                : 'border-border bg-surface-elevated hover:bg-hover',
            ].join(' ')}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium uppercase tracking-wider text-ink-muted">
                  Meu plano
                </p>
                <p className="mt-0.5 flex items-center gap-1.5 truncate font-bold text-ink">
                  <User className="h-4 w-4 shrink-0 text-brand-600 dark:text-brand-400" />
                  {ownPlan.patientName}
                </p>
                <p className="mt-1 flex items-center gap-1 text-xs text-ink-muted">
                  <Calendar className="h-3.5 w-3.5" />
                  {ownPlan.date}
                </p>
              </div>
              {activePlanId === 'own' && (
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-600 dark:bg-brand-500">
                  <Check className="h-3 w-3 text-white" />
                </span>
              )}
            </div>
          </button>
        )}

        {sharedPlans.length > 0 && (
          <p className="pt-1 text-xs font-semibold uppercase tracking-wider text-ink-muted">
            Dietas compartilhadas
          </p>
        )}

        {sharedPlans.map((entry) => (
          <button
            key={entry.code}
            type="button"
            onClick={() => handleSelect(entry.code)}
            className={[
              'group relative w-full rounded-2xl border p-4 text-left transition',
              activePlanId === entry.code
                ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/30'
                : 'border-border bg-surface-elevated hover:bg-hover',
            ].join(' ')}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1 text-xs font-medium uppercase tracking-wider text-ink-muted">
                  <Users className="h-3.5 w-3.5" />
                  Código {entry.code}
                </p>
                <p className="mt-0.5 truncate font-bold text-ink">
                  {entry.plan.patientName}
                </p>
                <p className="mt-1 flex items-center gap-1 text-xs text-ink-muted">
                  <Calendar className="h-3.5 w-3.5" />
                  {entry.plan.date}
                </p>
              </div>
              <div className="mt-0.5 flex shrink-0 items-center gap-2">
                {activePlanId === entry.code && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-600 dark:bg-brand-500">
                    <Check className="h-3 w-3 text-white" />
                  </span>
                )}
                <button
                  type="button"
                  aria-label="Remover dieta"
                  onClick={(e) => handleRemove(e, entry.code)}
                  className="rounded-lg p-1 text-ink-muted transition hover:bg-danger-subtle hover:text-danger"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </button>
        ))}

        <button
          type="button"
          onClick={onAddNew}
          className="flex w-full items-center gap-3 rounded-2xl border border-dashed border-border px-4 py-4 text-left transition hover:bg-hover"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-100 dark:bg-brand-950/40">
            <Plus className="h-4 w-4 text-brand-600 dark:text-brand-400" />
          </span>
          <div>
            <p className="text-sm font-semibold text-ink">Adicionar dieta de outra pessoa</p>
            <p className="text-xs text-ink-muted">Use um código de compartilhamento</p>
          </div>
        </button>
      </div>
    </BottomSheet>
  )
}
