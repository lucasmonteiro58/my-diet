import { buildGeminiExtractionPrompt } from './ai-prompt'

const MAX_PDF_BYTES = 20 * 1024 * 1024

/**
 * Default model for free tier (see https://aistudio.google.com/rate-limit).
 * Gemini 2.5 Flash Lite: ~10 RPM, 250K TPM, 20 RPD on free tier.
 */
export const DEFAULT_GEMINI_MODEL = 'gemini-2.5-flash-lite'

const MODEL_FALLBACK_CHAIN = [
  DEFAULT_GEMINI_MODEL,
  'gemini-3.1-flash-lite-preview',
  'gemini-2.5-flash',
] as const

export function isGeminiConfigured(): boolean {
  return Boolean(import.meta.env.VITE_GEMINI_API_KEY?.trim())
}

function getModelsToTry(): string[] {
  const custom = import.meta.env.VITE_GEMINI_MODEL?.trim()
  if (custom) return [custom, ...MODEL_FALLBACK_CHAIN.filter((m) => m !== custom)]
  return [...MODEL_FALLBACK_CHAIN]
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

function isQuotaError(message: string, status: number): boolean {
  return (
    status === 429 ||
    /quota|rate.?limit|resource exhausted|limit:\s*0/i.test(message)
  )
}

function formatGeminiError(message: string, status: number, model: string): string {
  if (isQuotaError(message, status)) {
    return [
      `Cota esgotada para ${model} (plano gratuito: ~20 PDFs/dia no 2.5 Flash Lite).`,
      'Aguarde 1 minuto ou use a aba Manual.',
      'Confira limites em aistudio.google.com/rate-limit',
    ].join(' ')
  }
  if (status === 403) return 'Chave da API inválida ou sem permissão. Verifique o .env.'
  if (status === 404) return `Modelo "${model}" não encontrado. Ajuste VITE_GEMINI_MODEL no .env.`
  return message || `Erro na API Gemini (${status}).`
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
          temperature: 0.1,
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
      message: 'O Gemini não retornou dados. Tente novamente ou use o modo manual.',
    }
  }

  return { ok: true, text }
}

export async function extractDietJsonFromPdf(file: File): Promise<string> {
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
    if (result.ok) return result.text

    errors.push(`[${model}] ${result.message}`)

    if (!isQuotaError(result.message, result.status)) {
      throw new Error(result.message)
    }
  }

  throw new Error(
    errors.length > 0
      ? errors[errors.length - 1]
      : 'Nenhum modelo Gemini disponível. Use a aba Manual.',
  )
}
