import { resolveNutritionistName } from './nutritionist'
import type { DietPlan, Meal, Menu } from '../types/diet'

function stripJsonFences(text: string): string {
  const trimmed = text.trim()
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)```$/i)
  if (fenced) return fenced[1].trim()
  const start = trimmed.indexOf('{')
  const end = trimmed.lastIndexOf('}')
  if (start >= 0 && end > start) return trimmed.slice(start, end + 1)
  return trimmed
}

function asString(value: unknown, fallback = ''): string {
  if (typeof value === 'string') return value.trim()
  if (typeof value === 'number') return String(value)
  return fallback
}

function asNumber(value: unknown, fallback = 0): number {
  if (typeof value === 'number' && !Number.isNaN(value)) return value
  if (typeof value === 'string') {
    const n = Number(value.replace(',', '.').replace(/[^\d.]/g, ''))
    return Number.isNaN(n) ? fallback : n
  }
  return fallback
}

function normalizeMeals(raw: unknown, menuIndex: number): Meal[] {
  if (!Array.isArray(raw)) return []
  return raw.map((item, mealIndex) => {
    const meal = item as Record<string, unknown>
    const preparations = Array.isArray(meal.preparations)
      ? meal.preparations.map((prep, prepIndex) => {
          const p = prep as Record<string, unknown>
          const mealId = asString(meal.id, `meal-${menuIndex + 1}-${mealIndex + 1}`)
          const menuId = `menu-${menuIndex + 1}`
          const foods = Array.isArray(p.foods)
            ? p.foods.map((food, foodIndex) => {
                const f = food as Record<string, unknown>
                return {
                  id: asString(
                    f.id,
                    `food-${menuId}-${mealId}-${prepIndex}-${foodIndex}`,
                  ),
                  name: asString(f.name),
                  quantity: asString(f.quantity),
                  ...(f.userEdited === true
                    ? {
                        userEdited: true,
                        editLabel: asString(f.editLabel, 'editado'),
                      }
                    : {}),
                }
              })
            : []
          return { name: asString(p.name), foods }
        })
      : []

    const notes = asString(meal.notes)
    return {
      id: asString(meal.id, `meal-${menuIndex + 1}-${mealIndex + 1}`),
      name: asString(meal.name, 'Refeição'),
      time: asString(meal.time),
      preparations,
      ...(notes ? { notes } : {}),
    }
  })
}

function normalizeMenus(raw: unknown): Menu[] {
  if (!Array.isArray(raw)) return []
  return raw.map((item, index) => {
    const menu = item as Record<string, unknown>
    return {
      id: asString(menu.id, `menu-${index + 1}`),
      title: asString(menu.title, `Cardápio ${index + 1}`),
      subtitle: asString(menu.subtitle),
      meals: normalizeMeals(menu.meals, index),
    }
  })
}

export function parseDietPlanJson(input: string): DietPlan {
  let parsed: unknown
  try {
    parsed = JSON.parse(stripJsonFences(input))
  } catch {
    throw new Error('JSON inválido. Cole apenas o objeto retornado pela IA.')
  }

  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Formato inválido: esperado um objeto JSON.')
  }

  const data = parsed as Record<string, unknown>
  const macrosRaw = (data.macros ?? {}) as Record<string, unknown>
  const nutritionistRaw = (data.nutritionist ?? {}) as Record<string, unknown>
  const nutritionistEmail = asString(nutritionistRaw.email)
  const nutritionistWhatsapp = asString(nutritionistRaw.whatsapp)

  const plan: DietPlan = {
    id: crypto.randomUUID(),
    patientName: asString(data.patientName, 'Paciente'),
    date: asString(data.date, new Date().toLocaleDateString('pt-BR')),
    nutritionist: {
      name: resolveNutritionistName(
        asString(nutritionistRaw.name),
        nutritionistEmail,
      ),
      whatsapp: nutritionistWhatsapp,
      email: nutritionistEmail,
    },
    macros: {
      energyKcal: asNumber(macrosRaw.energyKcal),
      carbsG: asNumber(macrosRaw.carbsG),
      proteinG: asNumber(macrosRaw.proteinG),
      lipidsG: asNumber(macrosRaw.lipidsG),
      fiberG: asNumber(macrosRaw.fiberG),
      weightKg: asNumber(macrosRaw.weightKg),
    },
    menus: normalizeMenus(data.menus),
    supplements: Array.isArray(data.supplements)
      ? data.supplements.map((s) => {
          const sup = s as Record<string, unknown>
          return {
            name: asString(sup.name),
            dose: asString(sup.dose),
            recommendation: asString(sup.recommendation),
            options: asString(sup.options),
          }
        })
      : [],
    generalRecommendations: Array.isArray(data.generalRecommendations)
      ? data.generalRecommendations.map((r) => asString(r)).filter(Boolean)
      : [],
    createdAt: new Date().toISOString(),
  }

  if (plan.menus.length === 0) {
    throw new Error('O JSON não contém cardápios (menus). Verifique a resposta da IA.')
  }

  if (plan.menus.every((m) => m.meals.length === 0)) {
    throw new Error('Nenhuma refeição encontrada nos cardápios.')
  }

  return plan
}
