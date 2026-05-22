const MEASURE_IN_PARENS = /\((\d+(?:[.,]\d+)?\s*(?:g|ml|kg|mg))\)/i
const MEASURE_AT_END = /(\d+(?:[.,]\d+)?\s*(?:g|ml|kg|mg))\s*$/i

export interface ParsedQuantity {
  /** Grams/ml or full string when no measure is found */
  highlight: string
  /** Extra context, e.g. "2 fatias" */
  detail?: string
}

export function parseFoodQuantity(quantity: string): ParsedQuantity {
  const trimmed = quantity.trim()
  if (!trimmed) return { highlight: '—' }

  const parenMatch = trimmed.match(MEASURE_IN_PARENS)
  if (parenMatch) {
    const highlight = parenMatch[1].replace(/\s+/g, '')
    const detail = trimmed
      .replace(parenMatch[0], '')
      .trim()
      .replace(/^[-–,]\s*/, '')
    return { highlight, detail: detail || undefined }
  }

  const endMatch = trimmed.match(MEASURE_AT_END)
  if (endMatch) {
    const highlight = endMatch[1].replace(/\s+/g, '')
    const detail = trimmed.slice(0, endMatch.index).trim()
    return { highlight, detail: detail || undefined }
  }

  return { highlight: trimmed }
}
