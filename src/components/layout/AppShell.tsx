import { Leaf } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { UserMenu } from './UserMenu'

interface AppShellProps {
  children: ReactNode
  onImportClick?: () => void
}

export function AppShell({ children, onImportClick }: AppShellProps) {
  return (
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col [--app-header-height:3.75rem]">
      <header className="sticky top-0 z-20 h-(--app-header-height) shrink-0 border-b border-border/80 bg-surface-elevated/90 px-4 py-3 backdrop-blur-md">
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

      <main className="flex-1 px-4 pb-8 pt-4">{children}</main>
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
