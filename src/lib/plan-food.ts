import type { DietPlan, FoodItem, FoodLocation } from '../types/diet'

export function ensureFoodIds(plan: DietPlan): DietPlan {
  let changed = false
  const menus = plan.menus.map((menu) => ({
    ...menu,
    meals: menu.meals.map((meal) => ({
      ...meal,
      preparations: meal.preparations.map((prep, pi) => ({
        ...prep,
        foods: prep.foods.map((food, fi) => {
          if (food.id) return food
          changed = true
          return {
            ...food,
            id: `food-${menu.id}-${meal.id}-${pi}-${fi}`,
          }
        }),
      })),
    })),
  }))
  return changed ? { ...plan, menus } : plan
}

function buildEditLabel(
  prev: Pick<FoodItem, 'name' | 'quantity'> | null,
  next: Pick<FoodItem, 'name' | 'quantity'>,
): string {
  if (!prev) return 'adicionado'
  const nameChanged = prev.name.trim() !== next.name.trim()
  const qtyChanged = prev.quantity.trim() !== next.quantity.trim()
  if (nameChanged && qtyChanged) return 'nome e quantidade'
  if (nameChanged) return 'nome'
  if (qtyChanged) return 'quantidade'
  return 'editado'
}

function touchPlan(plan: DietPlan): DietPlan {
  return { ...plan, updatedAt: new Date().toISOString() }
}

function mapFoodAt(
  plan: DietPlan,
  loc: FoodLocation,
  mapper: (foods: FoodItem[], prepIndex: number) => FoodItem[],
): DietPlan {
  const menus = plan.menus.map((menu) => {
    if (menu.id !== loc.menuId) return menu
    return {
      ...menu,
      meals: menu.meals.map((meal) => {
        if (meal.id !== loc.mealId) return meal
        return {
          ...meal,
          preparations: meal.preparations.map((prep, prepIndex) => {
            if (prepIndex !== loc.prepIndex) return prep
            return { ...prep, foods: mapper(prep.foods, prepIndex) }
          }),
        }
      }),
    }
  })
  return touchPlan({ ...plan, menus })
}

export function upsertFoodItem(
  plan: DietPlan,
  loc: FoodLocation,
  data: { name: string; quantity: string },
): DietPlan {
  const name = data.name.trim()
  const quantity = data.quantity.trim()
  if (!name || !quantity) {
    throw new Error('Informe o nome e a quantidade do alimento.')
  }

  return mapFoodAt(plan, loc, (foods) => {
    const existing = loc.foodId ? foods.find((f) => f.id === loc.foodId) : undefined

    if (existing) {
      return foods.map((f) => {
        if (f.id !== loc.foodId) return f
        const editLabel = buildEditLabel(existing, { name, quantity })
        return {
          ...f,
          name,
          quantity,
          userEdited: true,
          editLabel,
        }
      })
    }

    const item: FoodItem = {
      id: crypto.randomUUID(),
      name,
      quantity,
      userEdited: true,
      editLabel: 'adicionado',
    }
    return [...foods, item]
  })
}

export function removeFoodItem(plan: DietPlan, loc: FoodLocation): DietPlan {
  if (!loc.foodId) return plan
  return mapFoodAt(plan, loc, (foods) => foods.filter((f) => f.id !== loc.foodId))
}

export function findFoodItem(
  plan: DietPlan,
  loc: FoodLocation,
): FoodItem | undefined {
  const menu = plan.menus.find((m) => m.id === loc.menuId)
  const meal = menu?.meals.find((m) => m.id === loc.mealId)
  const prep = meal?.preparations[loc.prepIndex]
  return loc.foodId ? prep?.foods.find((f) => f.id === loc.foodId) : undefined
}
