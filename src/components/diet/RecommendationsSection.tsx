import { CheckCircle2 } from 'lucide-react'

interface RecommendationsSectionProps {
  items: string[]
}

export function RecommendationsSection({ items }: RecommendationsSectionProps) {
  if (!items.length) return null

  return (
    <section className="space-y-3">
      <h2 className="text-sm font-bold uppercase tracking-wide text-ink-muted">
        Recomendações gerais
      </h2>
      <ul className="space-y-2 rounded-2xl border border-border bg-surface-elevated p-4 shadow-sm">
        {items.map((item, idx) => (
          <li key={idx} className="flex gap-2.5 text-sm leading-relaxed text-ink">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-600 dark:text-brand-800" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}
