export type ThemePreference = 'system' | 'light' | 'dark'
export type ResolvedTheme = 'light' | 'dark'

export const THEME_STORAGE_KEY = 'my-diet-theme'

const VALID: ThemePreference[] = ['system', 'light', 'dark']

export function getStoredThemePreference(): ThemePreference {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY)
    if (stored && VALID.includes(stored as ThemePreference)) {
      return stored as ThemePreference
    }
  } catch {
    /* ignore */
  }
  return 'system'
}

export function persistThemePreference(preference: ThemePreference): void {
  localStorage.setItem(THEME_STORAGE_KEY, preference)
}

export function resolveTheme(preference: ThemePreference): ResolvedTheme {
  if (preference === 'light') return 'light'
  if (preference === 'dark') return 'dark'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function applyResolvedTheme(resolved: ResolvedTheme): void {
  const root = document.documentElement
  root.classList.toggle('dark', resolved === 'dark')
  root.style.colorScheme = resolved
  const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')
  if (meta) {
    meta.content = resolved === 'dark' ? '#0c0a09' : '#16a34a'
  }
}

export function initThemeFromStorage(): ResolvedTheme {
  const preference = getStoredThemePreference()
  const resolved = resolveTheme(preference)
  applyResolvedTheme(resolved)
  return resolved
}
