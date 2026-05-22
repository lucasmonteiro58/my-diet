const GENERIC_NAMES = new Set([
  '',
  'nutricionista',
  'nutritionist',
  'nutri',
  'profissional',
  'sem nome',
  'n/a',
  'na',
])

const EMAIL_STOP_PARTS = new Set([
  'nutri',
  'nutricao',
  'nutricionista',
  'nutritionist',
  'contato',
  'contact',
  'atendimento',
  'clinica',
  'clinic',
  'info',
  'mail',
  'email',
  'whatsapp',
  'wpp',
  'com',
  'br',
])

/** Common Brazilian surnames in concatenated e-mails (e.g. gabrielpaesnutri). */
const SURNAME_ENDINGS = [
  'monteiro',
  'nascimento',
  'ferreira',
  'rodrigues',
  'almeida',
  'oliveira',
  'pereira',
  'carvalho',
  'gomes',
  'martins',
  'araujo',
  'ribeiro',
  'santos',
  'souza',
  'silva',
  'costa',
  'lima',
  'paes',
] as const

function capitalizePt(word: string): string {
  if (!word) return ''
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
}

function isGenericName(name: string): boolean {
  return GENERIC_NAMES.has(name.trim().toLowerCase())
}

function splitConcatenatedLocalPart(local: string): string | null {
  const lower = local.toLowerCase()
  for (const surname of SURNAME_ENDINGS) {
    if (lower.endsWith(surname) && lower.length > surname.length + 2) {
      const first = lower.slice(0, -surname.length)
      return `${capitalizePt(first)} ${capitalizePt(surname)}`
    }
  }
  return null
}

/**
 * Infers a display name from the professional's e-mail when the PDF/IA left name empty.
 * e.g. gabrielpaesnutri@gmail.com → Gabriel Paes
 */
export function inferNutritionistNameFromEmail(email: string): string {
  const trimmed = email.trim().toLowerCase()
  const at = trimmed.indexOf('@')
  if (at <= 0) return ''

  let local = trimmed.slice(0, at)
  local = local.replace(/^(?:dr\.?|dra\.?)\s*/i, '')
  local = local.replace(/(?:nutri(?:cionista|cao|ção)?|nutritionist)$/i, '')

  if (/[._-]/.test(local)) {
    const parts = local
      .split(/[._-]+/)
      .map((p) => p.replace(/\d+/g, ''))
      .filter((p) => p.length > 1 && !EMAIL_STOP_PARTS.has(p))
    if (parts.length >= 2) {
      return parts.map(capitalizePt).join(' ')
    }
    if (parts.length === 1) {
      const split = splitConcatenatedLocalPart(parts[0])
      if (split) return split
      return capitalizePt(parts[0])
    }
  }

  const split = splitConcatenatedLocalPart(local.replace(/\d+/g, ''))
  if (split) return split

  if (local.length >= 3) return capitalizePt(local)
  return ''
}

export function resolveNutritionistName(
  rawName: string,
  email: string,
  _whatsapp?: string,
): string {
  const name = rawName.trim()
  if (name && !isGenericName(name)) return name

  const fromEmail = inferNutritionistNameFromEmail(email)
  if (fromEmail) return fromEmail

  return name || 'Nutricionista'
}
