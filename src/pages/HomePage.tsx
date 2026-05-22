import { CloudUpload, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { DietHeader } from '../components/diet/DietHeader'
import { MacrosGrid } from '../components/diet/MacrosGrid'
import { MealCard } from '../components/diet/MealCard'
import { MenuTabs } from '../components/diet/MenuTabs'
import { ImportPlanModal } from '../components/diet/ImportPlanModal'
import { RecommendationsSection } from '../components/diet/RecommendationsSection'
import { SupplementsSection } from '../components/diet/SupplementsSection'
import { AppShell } from '../components/layout/AppShell'
import { Button } from '../components/ui/Button'
import { useAuth } from '../contexts/AuthContext'
import { useDiet } from '../contexts/DietContext'

export function HomePage() {
  const { user } = useAuth()
  const { plan, loading, saving, error, savePlan } = useDiet()
  const [uploadOpen, setUploadOpen] = useState(false)
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null)

  const activeMenu =
    plan?.menus.find((m) => m.id === (activeMenuId ?? plan.menus[0]?.id)) ??
    plan?.menus[0]

  if (loading) {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center gap-3 py-24">
          <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
          <p className="text-sm text-ink-muted">Carregando seu plano...</p>
        </div>
      </AppShell>
    )
  }

  if (!plan) {
    return (
      <AppShell onImportClick={() => setUploadOpen(true)}>
        <div className="flex flex-col items-center py-16 text-center">
          <div className="rounded-3xl bg-brand-50 p-6">
            <CloudUpload className="mx-auto h-12 w-12 text-brand-600" />
          </div>
          <h2 className="mt-6 text-xl font-bold text-ink">Nenhum plano ainda</h2>
          <p className="mt-2 max-w-xs text-sm text-ink-muted">
            Use o prompt com Gemini (ou outra IA), cole o JSON aqui, ou carregue o
            plano de demonstração.
          </p>
          <Button className="mt-6" fullWidth onClick={() => setUploadOpen(true)}>
            Importar plano
          </Button>
          {!user && (
            <Link
              to="/login"
              className="mt-4 text-sm font-medium text-brand-700 hover:underline"
            >
              Entrar com Google para salvar na nuvem
            </Link>
          )}
        </div>
        <ImportPlanModal open={uploadOpen} onClose={() => setUploadOpen(false)} />
      </AppShell>
    )
  }

  return (
    <AppShell onImportClick={() => setUploadOpen(true)}>
      <div className="space-y-6">
        <DietHeader plan={plan} />
        <MacrosGrid macros={plan.macros} />

        <section className="space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wide text-ink-muted">
            Cardápios
          </h2>
          <MenuTabs
            menus={plan.menus}
            activeId={activeMenu?.id ?? plan.menus[0].id}
            onChange={setActiveMenuId}
          />
          <div className="space-y-3">
            {activeMenu?.meals.map((meal, idx) => (
              <MealCard key={meal.id} meal={meal} defaultOpen={idx === 0} />
            ))}
          </div>
        </section>

        <SupplementsSection supplements={plan.supplements} />
        <RecommendationsSection items={plan.generalRecommendations} />

        {error && (
          <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
        )}

        <Button
          fullWidth
          variant="outline"
          disabled={saving}
          onClick={() => void savePlan()}
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <CloudUpload className="h-4 w-4" />
              {user ? 'Salvar na nuvem' : 'Salvar localmente'}
            </>
          )}
        </Button>
      </div>

      <ImportPlanModal open={uploadOpen} onClose={() => setUploadOpen(false)} />
    </AppShell>
  )
}
