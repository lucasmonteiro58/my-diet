import { LogIn, LogOut, Sparkles } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

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
  const menuId = useId()
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return

    const onPointerDown = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }

    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  if (!user) {
    return (
      <Link
        to="/login"
        className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-50 text-brand-700 transition hover:bg-brand-100"
        aria-label="Entrar"
      >
        <LogIn className="h-5 w-5" />
      </Link>
    )
  }

  const displayName = user.displayName ?? 'Usuário'
  const email = user.email ?? ''

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="rounded-full p-0.5 transition hover:bg-stone-100"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={menuId}
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

      {open && (
        <div
          id={menuId}
          role="menu"
          className="absolute right-0 top-full z-30 mt-2 w-56 overflow-hidden rounded-2xl border border-border bg-surface-elevated py-1 shadow-lg shadow-stone-900/10"
        >
          <div className="border-b border-border px-4 py-3">
            <p className="truncate text-sm font-semibold text-ink">{displayName}</p>
            {email && (
              <p className="mt-0.5 truncate text-xs text-ink-muted">{email}</p>
            )}
            {!isConfigured && (
              <p className="mt-1 text-xs text-amber-700">Modo local (sem nuvem)</p>
            )}
          </div>

          {onImportClick && (
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                onImportClick()
                setOpen(false)
              }}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-ink transition hover:bg-stone-50"
            >
              <Sparkles className="h-4 w-4 text-brand-600" />
              Importar plano
            </button>
          )}

          <button
            type="button"
            role="menuitem"
            onClick={() => {
              void signOut()
              setOpen(false)
            }}
            className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-600 transition hover:bg-red-50"
          >
            <LogOut className="h-4 w-4" />
            Sair
          </button>
        </div>
      )}
    </div>
  )
}
