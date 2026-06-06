import type { DietPlan, FoodItem, Macros } from '../types/diet'

export interface MacroDelta {
  key: keyof Macros
  a: number
  b: number
  delta: number
}

export interface FoodChange {
  type: 'added' | 'removed' | 'changed'
  menuTitle: string
  mealName: string
  prepName: string
  name: string
  quantityA?: string
  quantityB?: string
}

export interface PlanDiff {
  macroDeltas: MacroDelta[]
  foodChanges: FoodChange[]
  supplementsAdded: string[]
  supplementsRemoved: string[]
  recommendationsAdded: string[]
  recommendationsRemoved: string[]
  metadataChanges: { field: string; a: string; b: string }[]
}

const MACRO_KEYS: (keyof Macros)[] = [
  'energyKcal',
  'carbsG',
  'proteinG',
  'lipidsG',
  'fiberG',
  'weightKg',
]

function normalizeName(name: string): string {
  return name.trim().toLowerCase()
}

interface FoodRef {
  menuTitle: string
  mealName: string
  prepName: string
  food: FoodItem
}

function collectFoods(plan: DietPlan): Map<string, FoodRef> {
  const map = new Map<string, FoodRef>()
  for (const menu of plan.menus) {
    for (const meal of menu.meals) {
      meal.preparations.forEach((prep, prepIndex) => {
        for (const food of prep.foods) {
          const key = `${menu.id}|${meal.id}|${prepIndex}|${normalizeName(food.name)}`
          map.set(key, {
            menuTitle: menu.title,
            mealName: meal.name,
            prepName: prep.name,
            food,
          })
        }
      })
    }
  }
  return map
}

function diffStringLists(a: string[], b: string[]): { added: string[]; removed: string[] } {
  const setA = new Set(a)
  const setB = new Set(b)
  return {
    added: b.filter((item) => !setA.has(item)),
    removed: a.filter((item) => !setB.has(item)),
  }
}

function diffMetadata(a: DietPlan, b: DietPlan): PlanDiff['metadataChanges'] {
  const changes: PlanDiff['metadataChanges'] = []
  if (a.date !== b.date) {
    changes.push({ field: 'Data do plano', a: a.date, b: b.date })
  }
  if (a.patientName !== b.patientName) {
    changes.push({ field: 'Paciente', a: a.patientName, b: b.patientName })
  }
  if (a.nutritionist.name !== b.nutritionist.name) {
    changes.push({
      field: 'Nutricionista',
      a: a.nutritionist.name,
      b: b.nutritionist.name,
    })
  }
  return changes
}

export function diffDietPlans(a: DietPlan, b: DietPlan): PlanDiff {
  const macroDeltas: MacroDelta[] = MACRO_KEYS.map((key) => ({
    key,
    a: a.macros[key],
    b: b.macros[key],
    delta: b.macros[key] - a.macros[key],
  }))

  const foodsA = collectFoods(a)
  const foodsB = collectFoods(b)
  const foodChanges: FoodChange[] = []

  for (const [key, refA] of foodsA) {
    const refB = foodsB.get(key)
    if (!refB) {
      foodChanges.push({
        type: 'removed',
        menuTitle: refA.menuTitle,
        mealName: refA.mealName,
        prepName: refA.prepName,
        name: refA.food.name,
        quantityA: refA.food.quantity,
      })
      continue
    }
    if (refA.food.quantity !== refB.food.quantity) {
      foodChanges.push({
        type: 'changed',
        menuTitle: refA.menuTitle,
        mealName: refA.mealName,
        prepName: refA.prepName,
        name: refA.food.name,
        quantityA: refA.food.quantity,
        quantityB: refB.food.quantity,
      })
    }
  }

  for (const [key, refB] of foodsB) {
    if (!foodsA.has(key)) {
      foodChanges.push({
        type: 'added',
        menuTitle: refB.menuTitle,
        mealName: refB.mealName,
        prepName: refB.prepName,
        name: refB.food.name,
        quantityB: refB.food.quantity,
      })
    }
  }

  const supplementsA = a.supplements.map((s) => s.name)
  const supplementsB = b.supplements.map((s) => s.name)
  const { added: supplementsAdded, removed: supplementsRemoved } = diffStringLists(
    supplementsA,
    supplementsB,
  )

  const { added: recommendationsAdded, removed: recommendationsRemoved } = diffStringLists(
    a.generalRecommendations,
    b.generalRecommendations,
  )

  return {
    macroDeltas,
    foodChanges,
    supplementsAdded,
    supplementsRemoved,
    recommendationsAdded,
    recommendationsRemoved,
    metadataChanges: diffMetadata(a, b),
  }
}

export function formatPlanVersionLabel(plan: DietPlan, isCurrent?: boolean): string {
  const datePart = plan.date || formatIsoDate(plan.createdAt)
  return isCurrent ? `${datePart} (atual)` : datePart
}

function planDateKey(plan: DietPlan): string {
  if (plan.date?.trim()) return plan.date.trim()
  const iso = plan.updatedAt ?? plan.createdAt
  if (!iso) return plan.id
  try {
    return new Date(iso).toLocaleDateString('pt-BR')
  } catch {
    return plan.id
  }
}

/** Keeps the newest plan per calendar date (plan.date). */
export function uniquePlansByDate(plans: DietPlan[]): DietPlan[] {
  const seen = new Set<string>()
  return plans.filter((plan) => {
    const key = planDateKey(plan)
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function formatIsoDate(iso?: string): string {
  if (!iso) return 'Sem data'
  try {
    return new Date(iso).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return iso
  }
}

export function formatPlanTimestamp(plan: DietPlan): string {
  const iso = plan.updatedAt ?? plan.createdAt
  if (!iso) return plan.date
  try {
    return new Date(iso).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return plan.date
  }
}
