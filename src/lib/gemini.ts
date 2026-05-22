import { buildGeminiExtractionPrompt } from './ai-prompt'
import { parseDietPlanJson } from './import-plan'

const MAX_PDF_BYTES = 20 * 1024 * 1024

/**
 * Models with free-tier quota on AI Studio (see https://aistudio.google.com/rate-limit).
 * Order: more capable first, then higher daily limits, then lite fallback.
 */
export const GEMINI_MODEL_CHAIN = [
  'gemini-3.1-flash-lite-preview',
  'gemini-3.1-flash-lite',
  'gemini-2.5-flash',
  'gemini-3-flash-preview',
  'gemini-2.5-flash-lite',
] as const

export const DEFAULT_GEMINI_MODEL = GEMINI_MODEL_CHAIN[0]

export function isGeminiConfigured(): boolean {
  return Boolean(import.meta.env.VITE_GEMINI_API_KEY?.trim())
}

function getModelsToTry(): string[] {
  const custom = import.meta.env.VITE_GEMINI_MODEL?.trim()
  const chain = [...GEMINI_MODEL_CHAIN]
  if (custom) {
    return [custom, ...chain.filter((m) => m !== custom)]
  }
  return chain
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result
      if (typeof result !== 'string') {
        reject(new Error('Não foi possível ler o PDF.'))
        return
      }
      const base64 = result.split(',')[1]
      if (!base64) {
        reject(new Error('Arquivo PDF inválido.'))
        return
      }
      resolve(base64)
    }
    reader.onerror = () => reject(new Error('Não foi possível ler o PDF.'))
    reader.readAsDataURL(file)
  })
}

function isRetryableError(message: string, status: number): boolean {
  return (
    status === 429 ||
    status === 404 ||
    status === 503 ||
    /quota|rate.?limit|resource exhausted|limit:\s*0|not found|unavailable/i.test(
      message,
    )
  )
}

function isWeakPlan(json: string): boolean {
  try {
    const plan = parseDietPlanJson(json)
    const mealCount = plan.menus.reduce((n, m) => n + m.meals.length, 0)
    const foodCount = plan.menus.reduce(
      (n, m) =>
        n +
        m.meals.reduce(
          (s, meal) =>
            s + meal.preparations.reduce((p, prep) => p + prep.foods.length, 0),
          0,
        ),
      0,
    )
    return plan.menus.length === 0 || mealCount < 2 || foodCount < 3
  } catch {
    return true
  }
}

function formatGeminiError(message: string, status: number, model: string): string {
  if (status === 429 || /quota|limit:\s*0/i.test(message)) {
    return `Cota esgotada para ${model}. Próximo modelo será tentado automaticamente.`
  }
  if (status === 404) return `Modelo ${model} não disponível na API.`
  if (status === 403) return 'Chave da API inválida. Verifique VITE_GEMINI_API_KEY no .env.'
  return message || `Erro Gemini (${status}).`
}

async function requestGemini(
  apiKey: string,
  model: string,
  base64: string,
  prompt: string,
): Promise<{ ok: true; text: string } | { ok: false; status: number; message: string }> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { inline_data: { mime_type: 'application/pdf', data: base64 } },
              { text: prompt },
            ],
          },
        ],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0,
        },
      }),
    },
  )

  const body = (await response.json().catch(() => ({}))) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[]
    error?: { message?: string }
  }

  if (!response.ok) {
    const message = body.error?.message ?? ''
    return {
      ok: false,
      status: response.status,
      message: formatGeminiError(message, response.status, model),
    }
  }

  const text = body.candidates?.[0]?.content?.parts?.[0]?.text?.trim()
  if (!text) {
    return {
      ok: false,
      status: 500,
      message: 'Resposta vazia do modelo.',
    }
  }

  return { ok: true, text }
}

export interface ExtractPdfResult {
  json: string
  modelUsed: string
}

export async function extractDietJsonFromPdf(file: File): Promise<ExtractPdfResult> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY?.trim()
  if (!apiKey) {
    throw new Error('Configure VITE_GEMINI_API_KEY no arquivo .env e reinicie o servidor.')
  }

  if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
    throw new Error('Selecione um arquivo PDF.')
  }

  if (file.size > MAX_PDF_BYTES) {
    throw new Error('PDF muito grande. O limite é 20 MB.')
  }

  const base64 = await fileToBase64(file)
  const prompt = buildGeminiExtractionPrompt()
  const models = getModelsToTry()
  const errors: string[] = []

  for (const model of models) {
    const result = await requestGemini(apiKey, model, base64, prompt)

    if (!result.ok) {
      errors.push(`[${model}] ${result.message}`)
      if (isRetryableError(result.message, result.status)) continue
      throw new Error(result.message)
    }

    if (isWeakPlan(result.text)) {
      errors.push(`[${model}] Plano incompleto — tentando outro modelo.`)
      continue
    }

    try {
      parseDietPlanJson(result.text)
      return { json: result.text, modelUsed: model }
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'JSON inválido'
      errors.push(`[${model}] ${msg}`)
      continue
    }
  }

  throw new Error(
    errors.length > 0
      ? `${errors.join(' ')} Use a aba Manual ou tente mais tarde.`
      : 'Nenhum modelo disponível. Use a aba Manual.',
  )
}
