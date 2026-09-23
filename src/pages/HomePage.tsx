import { Check, CloudUpload, Loader2, Users } from 'lucide-react'
import { useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import { AddSharedPlanSheet } from '../components/diet/AddSharedPlanSheet'
import { DietHeader } from '../components/diet/DietHeader'
import { DietSwitcherFab } from '../components/diet/DietSwitcherFab'
import { DietSwitcherSheet } from '../components/diet/DietSwitcherSheet'
import { MacrosGrid } from '../components/diet/MacrosGrid'
import { FoodEditSheet, type FoodEditTarget } from '../components/diet/FoodEditSheet'
import { MealCard } from '../components/diet/MealCard'
import { MenuTabs } from '../components/diet/MenuTabs'
import { ImportPlanModal } from '../components/diet/ImportPlanModal'
import { RecommendationsSection } from '../components/diet/RecommendationsSection'
import { SharePlanSheet } from '../components/diet/SharePlanSheet'
import { SupplementsSection } from '../components/diet/SupplementsSection'
import { AppShell } from '../components/layout/AppShell'
import { Button } from '../components/ui/Button'
import { useAuth } from '../contexts/AuthContext'
import { useDiet } from '../contexts/DietContext'
import { useEditMode } from '../contexts/EditModeContext'
import { useSharedDiets } from '../contexts/SharedDietsContext'
import type { FoodLocation } from '../types/diet'

export function HomePage() {
  const { user } = useAuth()
  const {
    plan: ownPlan,
    loading,
    saving,
    cloudSynced,
    error,
    savePlan,
    saveFood,
    removeFood,
  } = useDiet()
  const {
    viewingPlan,
    sharedPlans,
    cycleActivePlan,
    saveSharedFood,
    removeSharedFood,
  } = useSharedDiets()

  const [uploadOpen, setUploadOpen] = useState(false)
  const [switcherOpen, setSwitcherOpen] = useState(false)
  const [addSharedOpen, setAddSharedOpen] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null)
  const [foodEdit, setFoodEdit] = useState<FoodEditTarget | null>(null)
  const { enabled: editMode } = useEditMode()

  const isOwn = viewingPlan?.isOwn ?? true
  const plan = viewingPlan?.plan ?? null

  const handleSaveFood = useCallback(
    async (location: FoodLocation, data: { name: string; quantity: string }) => {
      if (isOwn) {
        await saveFood(location, data)
      } else if (viewingPlan?.shareCode) {
        await saveSharedFood(viewingPlan.shareCode, location, data)
      }
    },
    [isOwn, viewingPlan, saveFood, saveSharedFood],
  )

  const handleRemoveFood = useCallback(
    async (location: FoodLocation) => {
      if (isOwn) {
        await removeFood(location)
      } else if (viewingPlan?.shareCode) {
        await removeSharedFood(viewingPlan.shareCode, location)
      }
    },
    [isOwn, viewingPlan, removeFood, removeSharedFood],
  )

  const [prevEditMode, setPrevEditMode] = useState(editMode)
  if (prevEditMode !== editMode) {
    setPrevEditMode(editMode)
    if (!editMode) setFoodEdit(null)
  }

  // Reset menu tab when the active plan changes
  const shareCode = viewingPlan?.shareCode
  const [prevShareCode, setPrevShareCode] = useState(shareCode)
  if (prevShareCode !== shareCode) {
    setPrevShareCode(shareCode)
    setActiveMenuId(null)
  }

  const activeMenu =
    plan?.menus.find((m) => m.id === (activeMenuId ?? plan.menus[0]?.id)) ??
    plan?.menus[0]

  const canSwitchDiets = (ownPlan ? 1 : 0) + sharedPlans.length >= 2

  if (loading && !ownPlan) {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center gap-3 py-24">
          <Loader2 className="h-8 w-8 animate-spin text-brand-600 dark:text-brand-800" />
          <p className="text-sm text-ink-muted">Carregando seu plano...</p>
        </div>
      </AppShell>
    )
  }

  if (!ownPlan) {
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

  if (!plan) return null

  return (
    <AppShell onImportClick={() => setUploadOpen(true)}>
      <div className="space-y-6">
        <DietHeader
          plan={plan}
          isOwn={isOwn}
          onSwitchPlan={() => setSwitcherOpen(true)}
          onShare={user && isOwn ? () => setShareOpen(true) : undefined}
        />

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
          <p className="rounded-xl bg-danger-subtle px-3 py-2 text-sm text-danger-text">
            {error}
          </p>
        )}

        {!isOwn && (
          <div className="flex items-center justify-center gap-2 rounded-2xl border border-brand-500/20 bg-brand-50/60 p-3 text-xs font-medium text-brand-700 dark:bg-brand-950/20 dark:text-brand-300">
            <Users className="h-4 w-4 shrink-0" />
            <span>Plano compartilhado · Edições sincronizam em tempo real</span>
          </div>
        )}

        {isOwn && (
          user && cloudSynced && !saving ? (
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
          )
        )}
      </div>

      <ImportPlanModal open={uploadOpen} onClose={() => setUploadOpen(false)} />
      <FoodEditSheet
        target={foodEdit}
        onClose={() => setFoodEdit(null)}
        onSave={handleSaveFood}
        onRemove={handleRemoveFood}
      />

      <DietSwitcherSheet
        open={switcherOpen}
        onClose={() => setSwitcherOpen(false)}
        onAddNew={() => {
          setSwitcherOpen(false)
          setAddSharedOpen(true)
        }}
      />

      <AddSharedPlanSheet
        open={addSharedOpen}
        onClose={() => setAddSharedOpen(false)}
      />

      <SharePlanSheet open={shareOpen} onClose={() => setShareOpen(false)} />

      <DietSwitcherFab
        patientName={plan.patientName}
        enabled={canSwitchDiets}
        onCycle={cycleActivePlan}
        onLongPress={() => setSwitcherOpen(true)}
      />
    </AppShell>
  )
}
