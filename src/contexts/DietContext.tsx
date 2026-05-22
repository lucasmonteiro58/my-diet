import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { lucasDietPlan } from '../data/lucas-diet'
import { parseDietPdf } from '../lib/pdf-parser'
import { canUseCloud, getUserDietPlan, saveDietPlan } from '../services/dietService'
import type { DietPlan } from '../types/diet'
import { useAuth } from './AuthContext'

const LOCAL_KEY = 'my-diet-plan'

interface DietContextValue {
  plan: DietPlan | null
  loading: boolean
  saving: boolean
  error: string | null
  importPdf: (file: File) => Promise<void>
  loadDemo: () => void
  savePlan: () => Promise<void>
  setPlan: (plan: DietPlan) => void
}

const DietContext = createContext<DietContextValue | null>(null)

function loadLocalPlan(): DietPlan | null {
  try {
    const raw = localStorage.getItem(LOCAL_KEY)
    return raw ? (JSON.parse(raw) as DietPlan) : null
  } catch {
    return null
  }
}

function persistLocal(plan: DietPlan) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(plan))
}

export function DietProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [plan, setPlanState] = useState<DietPlan | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const setPlan = useCallback((next: DietPlan) => {
    setPlanState(next)
    persistLocal(next)
    setError(null)
  }, [])

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      try {
        if (user && canUseCloud()) {
          const cloud = await getUserDietPlan(user.uid)
          if (!cancelled && cloud) {
            setPlanState(cloud)
            persistLocal(cloud)
            return
          }
        }
        const local = loadLocalPlan()
        if (!cancelled) setPlanState(local)
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Erro ao carregar plano')
          setPlanState(loadLocalPlan())
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [user])

  const importPdf = useCallback(
    async (file: File) => {
      setError(null)
      try {
        const parsed = await parseDietPdf(file)
        if (parsed.menus.length === 0) {
          setPlan({ ...lucasDietPlan, ...parsed, menus: lucasDietPlan.menus })
        } else {
          setPlan(parsed)
        }
      } catch (e) {
        setError(
          e instanceof Error
            ? e.message
            : 'Não foi possível ler o PDF. Tente o plano de demonstração.',
        )
        throw e
      }
    },
    [setPlan],
  )

  const loadDemo = useCallback(() => {
    setPlan({ ...lucasDietPlan, id: crypto.randomUUID() })
  }, [setPlan])

  const savePlan = useCallback(async () => {
    if (!plan) return
    setSaving(true)
    setError(null)
    try {
      persistLocal(plan)
      if (user && canUseCloud()) {
        await saveDietPlan(user.uid, plan)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao salvar')
      throw e
    } finally {
      setSaving(false)
    }
  }, [plan, user])

  const value = useMemo(
    () => ({
      plan,
      loading,
      saving,
      error,
      importPdf,
      loadDemo,
      savePlan,
      setPlan,
    }),
    [plan, loading, saving, error, importPdf, loadDemo, savePlan, setPlan],
  )

  return <DietContext.Provider value={value}>{children}</DietContext.Provider>
}

export function useDiet() {
  const ctx = useContext(DietContext)
  if (!ctx) throw new Error('useDiet must be used within DietProvider')
  return ctx
}
