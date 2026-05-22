import { ChevronDown } from 'lucide-react'
import { useState, type ReactNode } from 'react'

interface CollapsibleSectionProps {
  title: string
  summary: string
  defaultOpen?: boolean
  children: ReactNode
}

export function CollapsibleSection({
  title,
  summary,
  defaultOpen = false,
  children,
}: CollapsibleSectionProps) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <section className="space-y-3">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center gap-2 rounded-xl py-1 text-left transition hover:bg-hover/80"
      >
        <h2 className="min-w-0 flex-1 text-sm font-bold uppercase tracking-wide text-ink-muted">
          {title}
        </h2>
        {!open && (
          <span className="shrink-0 text-xs font-medium text-ink-muted">{summary}</span>
        )}
        <ChevronDown
          className={`h-5 w-5 shrink-0 text-ink-muted transition-transform ${open ? 'rotate-180' : ''}`}
          aria-hidden
        />
      </button>

      {open && children}
    </section>
  )
}
