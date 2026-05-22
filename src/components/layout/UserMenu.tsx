import { LogIn, LogOut, Settings, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { EditModeToggle } from '../settings/EditModeToggle'
import { ThemeSelector } from '../theme/ThemeSelector'
import { BottomSheet } from '../ui/BottomSheet'

interface UserMenuProps {
  onImportClick?: () => void
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}

export function UserMenu({ onImportClick }: UserMenuProps) {
  const { user, signOut, isConfigured } = useAuth()
  const [open, setOpen] = useState(false)

  if (!user) {
    return (
      <>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-50 text-brand-700 transition hover:bg-brand-100 dark:bg-brand-300/40 dark:text-brand-900 dark:hover:bg-brand-300/60"
          aria-expanded={open}
          aria-haspopup="dialog"
          aria-label="Configurações"
        >
          <Settings className="h-5 w-5" />
        </button>

        <BottomSheet open={open} onClose={() => setOpen(false)} ariaLabel="Configurações">
          <div className="flex flex-col px-2 pb-2">
            <ThemeSelector />
            <EditModeToggle />
            <Link
              to="/login"
              onClick={() => setOpen(false)}
              className="mx-1 flex items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-medium text-ink transition hover:bg-hover active:bg-active"
            >
              <LogIn className="h-5 w-5 text-brand-600 dark:text-brand-800" />
              Entrar
            </Link>
          </div>
        </BottomSheet>
      </>
    )
  }

  const displayName = user.displayName ?? 'Usuário'
  const email = user.email ?? ''

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-full p-0.5 transition hover:bg-hover"
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label="Menu da conta"
      >
        {user.photoURL ? (
          <img
            src={user.photoURL}
            alt=""
            className="h-9 w-9 rounded-full object-cover ring-2 ring-brand-100"
          />
        ) : (
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-600 text-sm font-semibold text-white">
            {getInitials(displayName)}
          </span>
        )}
      </button>

      <BottomSheet
        open={open}
        onClose={() => setOpen(false)}
        ariaLabel="Menu da conta"
      >
        <div className="flex flex-col px-2 pb-2">
          <div className="flex items-center gap-4 border-b border-border px-3 py-4">
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt=""
                className="h-14 w-14 rounded-full object-cover ring-2 ring-brand-100"
              />
            ) : (
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-600 text-lg font-semibold text-white">
                {getInitials(displayName)}
              </span>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-base font-semibold text-ink">{displayName}</p>
              {email && (
                <p className="mt-0.5 truncate text-sm text-ink-muted">{email}</p>
              )}
              {!isConfigured && (
                <p className="mt-1 text-xs text-warning-icon">Modo local (sem nuvem)</p>
              )}
            </div>
          </div>

          <ThemeSelector />
          <EditModeToggle />

          {onImportClick && (
            <button
              type="button"
              onClick={() => {
                onImportClick()
                setOpen(false)
              }}
              className="flex w-full items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-medium text-ink transition hover:bg-hover active:bg-active"
            >
              <Sparkles className="h-5 w-5 text-brand-600 dark:text-brand-800" />
              Importar plano
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              void signOut()
              setOpen(false)
            }}
            className="flex w-full items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-medium text-danger transition hover:bg-danger-subtle active:bg-danger-subtle/80"
          >
            <LogOut className="h-5 w-5" />
            Sair
          </button>
        </div>
      </BottomSheet>
    </>
  )
}
