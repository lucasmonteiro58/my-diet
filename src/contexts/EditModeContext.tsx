import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { getStoredEditMode, persistEditMode } from '../lib/edit-mode'

interface EditModeContextValue {
  enabled: boolean
  setEnabled: (enabled: boolean) => void
  toggle: () => void
}

const EditModeContext = createContext<EditModeContextValue | null>(null)

export function EditModeProvider({ children }: { children: ReactNode }) {
  const [enabled, setEnabledState] = useState(getStoredEditMode)

  const setEnabled = useCallback((next: boolean) => {
    setEnabledState(next)
    persistEditMode(next)
  }, [])

  const toggle = useCallback(() => {
    setEnabledState((prev) => {
      const next = !prev
      persistEditMode(next)
      return next
    })
  }, [])

  const value = useMemo(
    () => ({ enabled, setEnabled, toggle }),
    [enabled, setEnabled, toggle],
  )

  return (
    <EditModeContext.Provider value={value}>{children}</EditModeContext.Provider>
  )
}

export function useEditMode(): EditModeContextValue {
  const ctx = useContext(EditModeContext)
  if (!ctx) throw new Error('useEditMode must be used within EditModeProvider')
  return ctx
}
