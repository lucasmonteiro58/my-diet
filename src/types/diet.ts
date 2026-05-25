export interface Macros {
  energyKcal: number
  carbsG: number
  proteinG: number
  lipidsG: number
  fiberG: number
  weightKg: number
}

export interface FoodItem {
  id: string
  name: string
  quantity: string
  /** Set when the user changed or added this item */
  userEdited?: boolean
  /** Short hint in the list, e.g. "quantidade", "adicionado" */
  editLabel?: string
}

export interface MealPreparation {
  name: string
  foods: FoodItem[]
}

export interface Meal {
  id: string
  name: string
  time: string
  preparations: MealPreparation[]
  notes?: string
}

export interface Menu {
  id: string
  title: string
  subtitle: string
  meals: Meal[]
}

export interface Supplement {
  name: string
  dose: string
  recommendation: string
  options: string
}

export interface DietPlan {
  id: string
  patientName: string
  date: string
  nutritionist: {
    name: string
    whatsapp: string
    email: string
  }
  macros: Macros
  menus: Menu[]
  supplements: Supplement[]
  generalRecommendations: string[]
  createdAt?: string
  updatedAt?: string
}

export interface FoodLocation {
  menuId: string
  mealId: string
  prepIndex: number
  foodId?: string
}

export interface SharedPlanEntry {
  code: string
  addedAt: string
  plan: DietPlan
}

export interface ViewingPlan {
  plan: DietPlan
  isOwn: boolean
  shareCode?: string
}
