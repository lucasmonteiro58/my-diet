const CACHE_KEY = 'my-diet-auth-profile'

export interface AuthProfile {
  uid: string
  displayName: string | null
  email: string | null
  photoURL: string | null
}

export function loadCachedAuthProfile(): AuthProfile | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    return raw ? (JSON.parse(raw) as AuthProfile) : null
  } catch {
    return null
  }
}

export function persistAuthProfile(profile: AuthProfile) {
  localStorage.setItem(CACHE_KEY, JSON.stringify(profile))
}

export function clearAuthProfile() {
  localStorage.removeItem(CACHE_KEY)
}
