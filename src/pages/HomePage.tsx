import { Check, CloudUpload, Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { DietHeader } from '../components/diet/DietHeader'
import { MacrosGrid } from '../components/diet/MacrosGrid'
import { FoodEditSheet, type FoodEditTarget } from '../components/diet/FoodEditSheet'
import { MealCard } from '../components/diet/MealCard'
import { MenuTabs } from '../components/diet/MenuTabs'
import { ImportPlanModal } from '../components/diet/ImportPlanModal'
import { RecommendationsSection } from '../components/diet/RecommendationsSection'
import { SupplementsSection } from '../components/diet/SupplementsSection'
import { AppShell } from '../components/layout/AppShell'
import { Button } from '../components/ui/Button'
import { useAuth } from '../contexts/AuthContext'
import { useDiet } from '../contexts/DietContext'
import { useEditMode } from '../contexts/EditModeContext'

export function HomePage() {
  const { user } = useAuth()
  const { plan, loading, saving, cloudSynced, error, savePlan } = useDiet()
  const [uploadOpen, setUploadOpen] = useState(false)
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null)
  const [foodEdit, setFoodEdit] = useState<FoodEditTarget | null>(null)
  const { enabled: editMode } = useEditMode()

  useEffect(() => {
    if (!editMode) setFoodEdit(null)
  }, [editMode])

  const activeMenu =
    plan?.menus.find((m) => m.id === (activeMenuId ?? plan.menus[0]?.id)) ??
    plan?.menus[0]

  if (loading) {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center gap-3 py-24">
          <Loader2 className="h-8 w-8 animate-spin text-brand-600 dark:text-brand-800" />
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
            <CloudUpload className="mx-auto h-12 w-12 text-brand-600 dark:text-brand-800" />
          </div>
          <h2 className="mt-6 text-xl font-bold text-ink">Nenhum plano ainda</h2>
          <p className="mt-2 max-w-xs text-sm text-ink-muted">
            Envie o PDF do plano ou importe um JSON manualmente.
          </p>
          <Button className="mt-6" fullWidth onClick={() => setUploadOpen(true)}>
            Importar plano
          </Button>
          {!user && (
            <Link
              to="/login"
              className="mt-4 text-sm font-medium text-brand-700 hover:underline dark:text-brand-800"
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
              <MealCard
                key={meal.id}
                meal={meal}
                menuId={activeMenu.id}
                defaultOpen={idx === 0}
                onEditFood={setFoodEdit}
              />
            ))}
          </div>
          <MacrosGrid macros={plan.macros} />
        </section>

        <SupplementsSection supplements={plan.supplements} />
        <RecommendationsSection items={plan.generalRecommendations} />

        {error && (
          <p className="rounded-xl bg-danger-subtle px-3 py-2 text-sm text-danger-text">{error}</p>
        )}

        {user && cloudSynced && !saving ? (
          <Button fullWidth variant="secondary" disabled className="cursor-default">
            <Check className="h-4 w-4" />
            Salvo na nuvem
          </Button>
        ) : (
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
        )}
      </div>

      <ImportPlanModal open={uploadOpen} onClose={() => setUploadOpen(false)} />
      <FoodEditSheet target={foodEdit} onClose={() => setFoodEdit(null)} />
    </AppShell>
  )
}
