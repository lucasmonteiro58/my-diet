import { Monitor, Moon, Sun } from 'lucide-react'
import { useTheme } from '../../contexts/ThemeContext'
import type { ThemePreference } from '../../lib/theme'

const OPTIONS: {
  value: ThemePreference
  label: string
  icon: typeof Sun
}[] = [
  { value: 'system', label: 'Automático', icon: Monitor },
  { value: 'light', label: 'Claro', icon: Sun },
  { value: 'dark', label: 'Escuro', icon: Moon },
]

export function ThemeSelector() {
  const { preference, setPreference } = useTheme()

  return (
    <div className="px-3 py-3">
      <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-ink-muted">
        Aparência
      </p>
      <div
        className="flex gap-1 rounded-xl bg-inset p-1"
        role="radiogroup"
        aria-label="Tema do aplicativo"
      >
        {OPTIONS.map(({ value, label, icon: Icon }) => {
          const active = preference === value
          return (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => setPreference(value)}
              className={[
                'flex flex-1 flex-col items-center gap-1 rounded-lg px-2 py-2.5 text-xs font-medium transition',
                active
                  ? 'bg-surface-elevated text-ink shadow-sm'
                  : 'text-ink-muted hover:text-ink',
              ].join(' ')}
            >
              <Icon className="h-4 w-4" aria-hidden />
              {label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
