import { useState } from 'react'
import type { DietPlan } from '../../types/diet'
import { DietHeader } from './DietHeader'
import { MacrosGrid } from './MacrosGrid'
import { MealCard } from './MealCard'
import { MenuTabs } from './MenuTabs'
import { RecommendationsSection } from './RecommendationsSection'
import { SupplementsSection } from './SupplementsSection'

interface PlanFullViewProps {
  plan: DietPlan
}

export function PlanFullView({ plan }: PlanFullViewProps) {
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null)

  const activeMenu =
    plan.menus.find((m) => m.id === (activeMenuId ?? plan.menus[0]?.id)) ??
    plan.menus[0]

  return (
    <div className="space-y-6">
      <DietHeader plan={plan} isOwn={false} />

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
            />
          ))}
        </div>
        <MacrosGrid macros={plan.macros} />
      </section>

      <SupplementsSection supplements={plan.supplements} />
      <RecommendationsSection items={plan.generalRecommendations} />
    </div>
  )
}
