import { Leaf } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { UserMenu } from './UserMenu'

interface AppShellProps {
  children: ReactNode
  onImportClick?: () => void
}

export function AppShell({ children, onImportClick }: AppShellProps) {
  const location = useLocation()

  return (
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col">
      <header className="sticky top-0 z-20 border-b border-border/80 bg-surface-elevated/90 px-4 py-3 backdrop-blur-md">
        <div className="flex items-center justify-between gap-3">
          <Link to="/" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white shadow-sm">
              <Leaf className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-bold leading-tight text-ink">My Diet</p>
              <p className="text-xs text-ink-muted">Plano alimentar</p>
            </div>
          </Link>

          <UserMenu onImportClick={onImportClick} />
        </div>
      </header>

      <main className="flex-1 px-4 pb-28 pt-4">{children}</main>

      {location.pathname === '/' && (
        <nav className="fixed bottom-0 left-0 right-0 z-20 mx-auto max-w-lg border-t border-border bg-surface-elevated/95 px-6 py-3 backdrop-blur-md">
          <div className="flex justify-around text-xs font-medium text-ink-muted">
            <Link to="/" className="flex flex-col items-center gap-1 text-brand-700">
              <Leaf className="h-5 w-5" />
              Plano
            </Link>
          </div>
        </nav>
      )}
    </div>
  )
}

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col justify-center px-4 py-8">
      {children}
    </div>
  )
}
