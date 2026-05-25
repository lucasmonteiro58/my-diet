import { Leaf, Users } from 'lucide-react'
import { useEffect, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useSharedDiets } from '../../contexts/SharedDietsContext'
import { UserMenu } from './UserMenu'

interface AppShellProps {
  children: ReactNode
  onImportClick?: () => void
}

function ViewingBanner() {
  const { viewingPlan } = useSharedDiets()
  const visible = !!(viewingPlan && !viewingPlan.isOwn)

  useEffect(() => {
    if (visible) {
      document.documentElement.style.setProperty('--banner-height', '33px')
    } else {
      document.documentElement.style.removeProperty('--banner-height')
    }
    return () => { document.documentElement.style.removeProperty('--banner-height') }
  }, [visible])

  if (!visible) return null

  return (
    <div className="flex items-center justify-center gap-2 bg-brand-600 px-4 py-2 text-xs font-medium text-white">
      <Users className="h-3.5 w-3.5 shrink-0" />
      <span>
        Você está visualizando o plano de{' '}
        <span className="font-bold">{viewingPlan!.plan.patientName}</span>
      </span>
    </div>
  )
}

export function AppShell({ children, onImportClick }: AppShellProps) {
  return (
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col">
      <header className="sticky top-0 z-20 shrink-0 border-b border-border/80 bg-surface-elevated/90 backdrop-blur-md pt-[var(--safe-top)]">
        <div className="flex h-(--header-bar-height) items-center justify-between gap-3 px-4">
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
        <ViewingBanner />
      </header>

      <main className="flex-1 px-4 pt-4 pb-[max(2rem,var(--safe-bottom))]">
        {children}
      </main>
    </div>
  )
}

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col justify-center px-4 py-8 pt-[max(2rem,var(--safe-top))] pb-[max(2rem,var(--safe-bottom))]">
      {children}
    </div>
  )
}
