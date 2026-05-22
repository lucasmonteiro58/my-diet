import type { InputHTMLAttributes } from 'react'

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  hint?: string
}

export function TextField({ label, hint, id, className = '', ...props }: TextFieldProps) {
  const fieldId = id ?? label.toLowerCase().replace(/\s+/g, '-')

  return (
    <label htmlFor={fieldId} className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink">{label}</span>
      <input
        id={fieldId}
        className={[
          'w-full rounded-2xl border border-border bg-surface-elevated px-4 py-3 text-sm text-ink outline-none transition',
          'placeholder:text-ink-muted/60 focus:border-brand-400 focus:ring-2 focus:ring-brand-100',
          className,
        ].join(' ')}
        {...props}
      />
      {hint && <span className="mt-1 block text-xs text-ink-muted">{hint}</span>}
    </label>
  )
}
