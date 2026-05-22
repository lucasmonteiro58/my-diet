import { Leaf, LogIn } from 'lucide-react'
import { Link, Navigate } from 'react-router-dom'
import { AuthLayout } from '../components/layout/AppShell'
import { Button } from '../components/ui/Button'
import { useAuth } from '../contexts/AuthContext'

export function LoginPage() {
  const { user, loading, signInWithGoogle, isConfigured } = useAuth()

  if (!loading && user) return <Navigate to="/" replace />

  return (
    <AuthLayout>
      <div className="text-center">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-lg shadow-brand-600/30">
          <Leaf className="h-8 w-8" />
        </span>
        <h1 className="mt-6 text-2xl font-bold text-ink">Bem-vindo ao My Diet</h1>
        <p className="mt-2 text-sm leading-relaxed text-ink-muted">
          Transforme seu plano alimentar numa interface clara, bonita e fácil de
          seguir no dia a dia.
        </p>
      </div>

      <div className="mt-8 space-y-3">
        <Button
          fullWidth
          onClick={() => void signInWithGoogle()}
          disabled={loading || !isConfigured}
        >
          <LogIn className="h-5 w-5" />
          Entrar com Google
        </Button>

        {!isConfigured && (
          <p className="rounded-xl bg-amber-50 px-3 py-2 text-center text-xs text-amber-800">
            Configure as variáveis Firebase em <code>.env</code> para login e
            sincronização na nuvem. Você ainda pode usar o app em modo local.
          </p>
        )}

        <Link
          to="/"
          className="block text-center text-sm font-medium text-brand-700 hover:underline"
        >
          Continuar sem login
        </Link>
      </div>
    </AuthLayout>
  )
}
