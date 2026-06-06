import { ArrowLeft, Calendar, History, Loader2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AppShell } from '../components/layout/AppShell'
import { PlanCompareView } from '../components/diet/PlanCompareView'
import { useAuth } from '../contexts/AuthContext'
import { useDiet } from '../contexts/DietContext'
import { formatFirebaseError } from '../lib/firebase-errors'
import {
  formatPlanTimestamp,
  formatPlanVersionLabel,
  uniquePlansByDate,
} from '../lib/plan-diff'
import { canUseCloud, getUserDietPlanHistory } from '../services/dietService'
import type { DietPlan } from '../types/diet'

function PlanSelector({
  id,
  label,
  value,
  plans,
  currentPlanId,
  onChange,
}: {
  id: string
  label: string
  value: string
  plans: DietPlan[]
  currentPlanId: string | null
  onChange: (planId: string) => void
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none rounded-2xl border border-border bg-surface-elevated py-3 pl-4 pr-10 text-sm font-medium text-ink shadow-sm transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
        >
          {plans.map((plan) => (
            <option key={plan.id} value={plan.id}>
              {formatPlanVersionLabel(plan, plan.id === currentPlanId)}
            </option>
          ))}
        </select>
        <Calendar className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
      </div>
      {value && (
        <p className="px-1 text-xs text-ink-muted">
          {formatPlanTimestamp(plans.find((p) => p.id === value)!)}
        </p>
      )}
    </div>
  )
}

export function DietHistoryPage() {
  const { user, isConfigured } = useAuth()
  const { plan: currentPlan } = useDiet()
  const [history, setHistory] = useState<DietPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [planAId, setPlanAId] = useState<string>('')
  const [planBId, setPlanBId] = useState<string>('')

  useEffect(() => {
    if (!user || !canUseCloud()) {
      setLoading(false)
      return
    }

    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)
      try {
        const plans = uniquePlansByDate(await getUserDietPlanHistory(user!.uid))
        if (cancelled) return
        setHistory(plans)

        if (plans.length >= 2) {
          setPlanAId(plans[1].id)
          setPlanBId(plans[0].id)
        } else if (plans.length === 1) {
          setPlanAId(plans[0].id)
          setPlanBId(plans[0].id)
        }
      } catch (e) {
        if (!cancelled) setError(formatFirebaseError(e))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [user])

  const planA = useMemo(
    () => history.find((p) => p.id === planAId) ?? null,
    [history, planAId],
  )
  const planB = useMemo(
    () => history.find((p) => p.id === planBId) ?? null,
    [history, planBId],
  )

  const currentPlanId = currentPlan?.id ?? history[0]?.id ?? null

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-start gap-3">
          <Link
            to="/"
            className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border bg-surface-elevated text-ink-muted transition hover:bg-hover"
            aria-label="Voltar"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-ink">Histórico de dietas</h1>
            <p className="mt-1 text-sm text-ink-muted">
              Compare versões anteriores do seu plano alimentar.
            </p>
          </div>
        </div>

        {!user && (
          <div className="rounded-2xl border border-border bg-subtle px-4 py-8 text-center">
            <History className="mx-auto h-10 w-10 text-ink-muted" />
            <p className="mt-4 text-sm font-medium text-ink">Entre para ver o histórico</p>
            <p className="mt-1 text-sm text-ink-muted">
              Versões anteriores ficam salvas na nuvem quando você importa um novo plano.
            </p>
            <Link
              to="/login"
              className="mt-4 inline-block text-sm font-medium text-brand-700 hover:underline dark:text-brand-800"
            >
              Entrar com Google
            </Link>
          </div>
        )}

        {user && !isConfigured && (
          <p className="rounded-xl bg-warning-subtle px-3 py-2 text-sm text-warning-text">
            Configure o Firebase para sincronizar e guardar versões anteriores na nuvem.
          </p>
        )}

        {user && isConfigured && loading && (
          <div className="flex flex-col items-center gap-3 py-16">
            <Loader2 className="h-8 w-8 animate-spin text-brand-600 dark:text-brand-800" />
            <p className="text-sm text-ink-muted">Carregando histórico...</p>
          </div>
        )}

        {error && (
          <p className="rounded-xl bg-danger-subtle px-3 py-2 text-sm text-danger-text">
            {error}
          </p>
        )}

        {user && isConfigured && !loading && history.length === 0 && (
          <div className="rounded-2xl border border-border bg-subtle px-4 py-8 text-center">
            <History className="mx-auto h-10 w-10 text-ink-muted" />
            <p className="mt-4 text-sm font-medium text-ink">Nenhuma versão salva ainda</p>
            <p className="mt-1 text-sm text-ink-muted">
              Importe um plano para começar. Ao importar um novo plano, a versão anterior
              permanece no histórico.
            </p>
          </div>
        )}

        {user && isConfigured && !loading && history.length === 1 && (
          <div className="rounded-2xl border border-border bg-subtle px-4 py-8 text-center">
            <History className="mx-auto h-10 w-10 text-ink-muted" />
            <p className="mt-4 text-sm font-medium text-ink">Apenas uma versão disponível</p>
            <p className="mt-1 text-sm text-ink-muted">
              Importe um novo plano para comparar com esta versão.
            </p>
          </div>
        )}

        {user && isConfigured && !loading && history.length >= 2 && planA && planB && (
          <>
            <section className="space-y-3 rounded-2xl border border-border bg-surface-elevated p-4 shadow-sm">
              <h2 className="text-sm font-bold uppercase tracking-wide text-ink-muted">
                Selecionar versões
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <PlanSelector
                  id="plan-a"
                  label="Versão anterior"
                  value={planAId}
                  plans={history}
                  currentPlanId={currentPlanId}
                  onChange={setPlanAId}
                />
                <PlanSelector
                  id="plan-b"
                  label="Versão mais recente"
                  value={planBId}
                  plans={history}
                  currentPlanId={currentPlanId}
                  onChange={setPlanBId}
                />
              </div>
            </section>

            <PlanCompareView
              planA={planA}
              planB={planB}
              labelA={formatPlanVersionLabel(planA, planA.id === currentPlanId)}
              labelB={formatPlanVersionLabel(planB, planB.id === currentPlanId)}
            />
          </>
        )}
      </div>
    </AppShell>
  )
}
