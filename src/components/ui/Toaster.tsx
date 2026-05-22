import { Toaster as Sonner } from 'sonner'

/** Toast host styled with My Diet tokens (brand green, stone surfaces). */
export function Toaster() {
  return (
    <Sonner
      position="top-center"
      closeButton
      richColors={false}
      offset="calc(var(--app-header-height) + 12px)"
      mobileOffset={{ top: 'calc(var(--app-header-height) + 12px)' }}
      toastOptions={{
        duration: 3500,
        classNames: {
          toast:
            'group !rounded-2xl !border !border-border !bg-surface-elevated !font-sans !text-ink !shadow-lg !shadow-stone-900/10',
          title: '!text-sm !font-semibold !text-ink',
          description: '!text-xs !text-ink-muted',
          closeButton:
            '!border-border !bg-stone-100 !text-ink-muted hover:!bg-stone-200',
          success:
            '!border-brand-200 !bg-brand-50 [&_[data-title]]:!text-brand-900',
          error: '!border-red-200 !bg-red-50 [&_[data-title]]:!text-red-900',
          info: '!border-stone-200 !bg-stone-50 [&_[data-title]]:!text-ink',
          icon: '!text-brand-600',
        },
      }}
      icons={{
        success: (
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
              aria-hidden
            >
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </span>
        ),
        error: (
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-red-600 text-white">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
              aria-hidden
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </span>
        ),
        info: (
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
              aria-hidden
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4M12 8h.01" />
            </svg>
          </span>
        ),
      }}
    />
  )
}
