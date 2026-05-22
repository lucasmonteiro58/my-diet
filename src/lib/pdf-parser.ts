import * as pdfjs from 'pdfjs-dist'
import type { DietPlan, FoodItem, Meal, MealPreparation, Menu, Supplement } from '../types/diet'

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString()

function extractTextFromPdf(arrayBuffer: ArrayBuffer): Promise<string> {
  return pdfjs.getDocument({ data: arrayBuffer }).promise.then(async (pdf) => {
    const pages: string[] = []
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i)
      const content = await page.getTextContent()
      const pageText = content.items
        .map((item) => ('str' in item ? item.str : ''))
        .join('\n')
      pages.push(pageText)
    }
    return pages.join('\n')
  })
}

function parseMacros(text: string): DietPlan['macros'] | null {
  const macroLine = text.match(
    /Energia\s+Carboidratos\s+Proteínas\s+Lipídios\s+Fibras\s+Peso\s*\n?\s*(\d+)\s*kcal\s+(\d+)g\s+(\d+)g\s+(\d+)g\s+(\d+)g\s+([\d,]+)\s*kg/i,
  )
  if (!macroLine) return null
  return {
    energyKcal: Number(macroLine[1]),
    carbsG: Number(macroLine[2]),
    proteinG: Number(macroLine[3]),
    lipidsG: Number(macroLine[4]),
    fiberG: Number(macroLine[5]),
    weightKg: Number(macroLine[6].replace(',', '.')),
  }
}

function parseHeader(text: string): Pick<DietPlan, 'patientName' | 'date' | 'nutritionist'> {
  const dateMatch = text.match(/Plano Alimentar\s*[–-]\s*(\d{2}\/\d{2}\/\d{4})/i)
  const patientMatch = text.match(
    /Plano Alimentar\s*[–-]\s*\d{2}\/\d{2}\/\d{4}\s*\n\s*([^\n]+)/i,
  )
  const emailMatch = text.match(/([\w.-]+@[\w.-]+\.\w+)/)
  const whatsappMatch = text.match(/WhatsApp\s*\(?([\d\s)-]+)\)?/i)

  return {
    patientName: patientMatch?.[1]?.trim() ?? 'Paciente',
    date: dateMatch?.[1] ?? new Date().toLocaleDateString('pt-BR'),
    nutritionist: {
      name: 'Nutricionista',
      whatsapp: whatsappMatch?.[1]?.trim() ?? '',
      email: emailMatch?.[1] ?? '',
    },
  }
}

function parseGeneralRecommendations(text: string): string[] {
  const section = text.split(/Recomendações Gerais/i)[1]
  if (!section) return []
  return section
    .split('\n')
    .map((line) => line.replace(/^[Øø•\-]\s*/, '').trim())
    .filter((line) => line.length > 20)
}

function parseSupplements(text: string): Supplement[] {
  const section = text.split(/Suplementação/i)[1]?.split(/Recomendações Gerais/i)[0]
  if (!section) return []

  const creatina = section.match(
    /Creatina\s+([\s\S]*?)(?=Recomendações|$)/i,
  )
  if (!creatina) return []

  return [
    {
      name: 'Creatina',
      dose: '5g (1 colher de café) por dia',
      recommendation:
        'Tomar a creatina diluída em água próximo de alguma refeição (ou logo antes ou logo depois)',
      options:
        'Creatina Monohidratada, podendo ser de diversas marcas (Growth, IntegralMédica, Max Titanium, Probiótica etc.)',
    },
  ]
}

/** Best-effort parser — complex PDF layouts may need manual review after import. */
export async function parseDietPdf(file: File): Promise<DietPlan> {
  const buffer = await file.arrayBuffer()
  const text = await extractTextFromPdf(buffer)
  const header = parseHeader(text)
  const macros = parseMacros(text)

  const plan: DietPlan = {
    id: crypto.randomUUID(),
    ...header,
    macros: macros ?? {
      energyKcal: 0,
      carbsG: 0,
      proteinG: 0,
      lipidsG: 0,
      fiberG: 0,
      weightKg: 0,
    },
    menus: parseMenusFromText(text),
    supplements: parseSupplements(text),
    generalRecommendations: parseGeneralRecommendations(text),
    createdAt: new Date().toISOString(),
  }

  return plan
}

function parseMenusFromText(text: string): Menu[] {
  const menuBlocks = text.split(/CARDÁPIO\s+(\d+)\s*\(([^)]+)\)/i).slice(1)
  const menus: Menu[] = []

  for (let i = 0; i < menuBlocks.length; i += 3) {
    const num = menuBlocks[i]
    const subtitle = menuBlocks[i + 1]
    const body = menuBlocks[i + 2] ?? ''
    if (!num || !body) continue

    menus.push({
      id: `menu-${num}`,
      title: `Cardápio ${num}`,
      subtitle: subtitle.trim(),
      meals: parseMealsFromBlock(body),
    })
  }

  return menus
}

const MEAL_NAMES = [
  'DESJEJUM',
  'LANCHE',
  'ALMOÇO',
  'JANTAR',
] as const

function parseMealsFromBlock(block: string): Meal[] {
  const meals: Meal[] = []
  const lines = block.split('\n').map((l) => l.trim()).filter(Boolean)

  let currentMeal: Partial<Meal> | null = null
  let currentPrep: MealPreparation | null = null
  let notesBuffer: string[] = []

  const flushMeal = () => {
    if (!currentMeal?.name) return
    if (notesBuffer.length) currentMeal.notes = notesBuffer.join(' ')
    if (currentPrep && currentPrep.foods.length) {
      currentMeal.preparations = [...(currentMeal.preparations ?? []), currentPrep]
    }
    meals.push({
      id: crypto.randomUUID(),
      name: formatMealName(currentMeal.name),
      time: currentMeal.time ?? '',
      preparations: currentMeal.preparations ?? [],
      notes: currentMeal.notes,
    })
    currentMeal = null
    currentPrep = null
    notesBuffer = []
  }

  for (const line of lines) {
    if (/^Observações:/i.test(line)) {
      notesBuffer.push(line.replace(/^Observações:\s*/i, ''))
      continue
    }
    if (notesBuffer.length && !isMealHeader(line)) {
      notesBuffer.push(line)
      continue
    }

    const mealHeader = matchMealHeader(line)
    if (mealHeader) {
      flushMeal()
      currentMeal = {
        name: mealHeader.name,
        time: mealHeader.time,
        preparations: [],
      }
      continue
    }

    if (/^REFEIÇÃO|^PREPARAÇÕES|^ALIMENTOS|^QUANTIDADES/i.test(line)) continue
    if (/WhatsApp|gabrielpaesnutri/i.test(line)) continue

    if (currentMeal && looksLikeQuantity(line)) {
      if (currentPrep?.foods.length) {
        const last = currentPrep.foods[currentPrep.foods.length - 1]
        last.quantity = [last.quantity, line].filter(Boolean).join(' ')
      }
      continue
    }

    if (currentMeal && line.length > 2) {
      if (!currentPrep || currentPrep.foods.length >= 4) {
        if (currentPrep?.foods.length) {
          currentMeal.preparations = [...(currentMeal.preparations ?? []), currentPrep]
        }
        currentPrep = { name: line, foods: [] }
      } else if (currentPrep.foods.length === 0 && !looksLikeFood(line)) {
        currentPrep.name = [currentPrep.name, line].join(' ')
      } else {
        const food: FoodItem = { name: line, quantity: '' }
        currentPrep.foods.push(food)
      }
    }
  }

  flushMeal()
  return meals
}

function formatMealName(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .replace(/(\d+)/, ' $1')
    .trim()
}

function isMealHeader(line: string): boolean {
  return Boolean(matchMealHeader(line))
}

function matchMealHeader(line: string): { name: string; time: string } | null {
  const upper = line.toUpperCase()
  for (const meal of MEAL_NAMES) {
    if (upper.startsWith(meal)) {
      const timeMatch = line.match(/(\d{1,2}:\d{2}(?:\s*[–-]\s*\d{1,2}:\d{2})?)/)
      const name = line.replace(timeMatch?.[0] ?? '', '').trim() || meal
      return { name, time: timeMatch?.[0] ?? '' }
    }
  }
  const numberedLanche = line.match(/^(LANCHE\s*\d*)\s*(\d{1,2}:\d{2})?/i)
  if (numberedLanche) {
    return {
      name: numberedLanche[1],
      time: numberedLanche[2] ?? '',
    }
  }
  return null
}

function looksLikeQuantity(line: string): boolean {
  return (
    /\(.*\)/.test(line) ||
    /à vontade/i.test(line) ||
    /colher|fatia|unidade|copo|xícara|medidor|potinho|gramas?|\d+g\b/i.test(line)
  )
}

function looksLikeFood(line: string): boolean {
  return !looksLikeQuantity(line) && line.length < 60
}
