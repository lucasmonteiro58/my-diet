import { buildGeminiExtractionPrompt } from './ai-prompt'

const GEMINI_MODEL = 'gemini-2.0-flash'
const MAX_PDF_BYTES = 20 * 1024 * 1024

export function isGeminiConfigured(): boolean {
  return Boolean(import.meta.env.VITE_GEMINI_API_KEY?.trim())
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

function parseGeminiError(body: unknown, status: number): string {
  const err = body as { error?: { message?: string } }
  const msg = err?.error?.message
  if (msg) return msg
  if (status === 429) return 'Limite da API atingido. Tente novamente em alguns minutos.'
  if (status === 403) return 'Chave da API inválida ou sem permissão. Verifique o .env.'
  return `Erro na API Gemini (${status}).`
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

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(apiKey)}`,
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
    throw new Error(parseGeminiError(body, response.status))
  }

  const text = body.candidates?.[0]?.content?.parts?.[0]?.text?.trim()
  if (!text) {
    throw new Error('O Gemini não retornou dados. Tente novamente ou use o modo manual.')
  }

  return text
}
