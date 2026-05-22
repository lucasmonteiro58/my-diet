import { PencilLine } from 'lucide-react'
import { useEditMode } from '../../contexts/EditModeContext'

export function EditModeToggle() {
  const { enabled, setEnabled } = useEditMode()

  return (
    <div className="px-3 py-3">
      <div className="flex items-center gap-3 rounded-2xl bg-subtle px-4 py-3.5">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700 dark:bg-brand-300/40 dark:text-brand-900">
          <PencilLine className="h-4 w-4" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-ink">Editar cardápio</p>
          <p className="mt-0.5 text-xs text-ink-muted">
            {enabled
              ? 'Toque nos alimentos para alterar ou adicionar'
              : 'Ative para editar alimentos e porções'}
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          aria-label={enabled ? 'Desativar edição do cardápio' : 'Ativar edição do cardápio'}
          onClick={() => setEnabled(!enabled)}
          className={[
            'relative h-7 w-12 shrink-0 rounded-full transition-colors',
            enabled ? 'bg-brand-600' : 'bg-active',
          ].join(' ')}
        >
          <span
            className={[
              'absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow-sm transition-transform',
              enabled ? 'translate-x-5' : 'translate-x-0',
            ].join(' ')}
          />
        </button>
      </div>
    </div>
  )
}
