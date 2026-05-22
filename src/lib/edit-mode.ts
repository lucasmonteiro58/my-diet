export const EDIT_MODE_STORAGE_KEY = 'my-diet-edit-mode'

export function getStoredEditMode(): boolean {
  try {
    return localStorage.getItem(EDIT_MODE_STORAGE_KEY) === 'true'
  } catch {
    return false
  }
}

export function persistEditMode(enabled: boolean): void {
  localStorage.setItem(EDIT_MODE_STORAGE_KEY, enabled ? 'true' : 'false')
}
