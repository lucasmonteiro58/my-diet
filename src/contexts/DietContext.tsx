import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { formatFirebaseError } from '../lib/firebase-errors'
import { extractDietJsonFromPdf } from '../lib/gemini'
import { parseDietPlanJson } from '../lib/import-plan'
import { toast } from '../lib/toast'
import {
  canUseCloud,
  getCurrentUserDietPlan,
  saveDietPlanAsCurrent,
} from '../services/dietService'
import { ensureFoodIds, removeFoodItem, upsertFoodItem } from '../lib/plan-food'
import type { DietPlan, FoodLocation } from '../types/diet'
import { useAuth } from './AuthContext'

const LOCAL_KEY = 'my-diet-plan'
const CLOUD_SYNC_KEY = 'my-diet-cloud-sync'

interface CloudSyncMeta {
  planId: string
  updatedAt: string
}

interface DietContextValue {
  plan: DietPlan | null
  loading: boolean
  saving: boolean
  cloudSynced: boolean
  error: string | null
  importFromJson: (json: string) => Promise<void>
  importFromPdf: (file: File) => Promise<void>
  savePlan: () => Promise<void>
  setPlan: (plan: DietPlan) => void
  saveFood: (
    location: FoodLocation,
    data: { name: string; quantity: string },
  ) => Promise<void>
  removeFood: (location: FoodLocation) => Promise<void>
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

function loadCloudSyncMeta(): CloudSyncMeta | null {
  try {
    const raw = localStorage.getItem(CLOUD_SYNC_KEY)
    return raw ? (JSON.parse(raw) as CloudSyncMeta) : null
  } catch {
    return null
  }
}

function persistCloudSyncMeta(plan: DietPlan) {
  if (!plan.updatedAt) return
  const meta: CloudSyncMeta = { planId: plan.id, updatedAt: plan.updatedAt }
  localStorage.setItem(CLOUD_SYNC_KEY, JSON.stringify(meta))
}

function clearCloudSyncMeta() {
  localStorage.removeItem(CLOUD_SYNC_KEY)
}

function isPlanCloudSynced(plan: DietPlan | null): boolean {
  if (!plan?.updatedAt) return false
  const meta = loadCloudSyncMeta()
  return meta?.planId === plan.id && meta.updatedAt === plan.updatedAt
}

export function DietProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [plan, setPlanState] = useState<DietPlan | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [cloudSynced, setCloudSynced] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const applyPlan = useCallback((next: DietPlan, synced: boolean) => {
    const withIds = ensureFoodIds(next)
    setPlanState(withIds)
    persistLocal(withIds)
    setCloudSynced(synced)
    if (synced) persistCloudSyncMeta(withIds)
    else clearCloudSyncMeta()
    setError(null)
  }, [])

  const commitPlanChange = useCallback(
    (updater: (current: DietPlan) => DietPlan) => {
      setPlanState((current) => {
        if (!current) return current
        const next = updater(current)
        persistLocal(next)
        setCloudSynced(false)
        clearCloudSyncMeta()
        setError(null)
        return next
      })
    },
    [],
  )

  const setPlan = useCallback(
    (next: DietPlan) => {
      applyPlan(next, false)
    },
    [applyPlan],
  )

  const syncToCloud = useCallback(
    async (planToSave: DietPlan): Promise<DietPlan> => {
      if (!user || !canUseCloud()) return planToSave
      setSaving(true)
      setError(null)
      try {
        const saved = await saveDietPlanAsCurrent(user.uid, planToSave)
        applyPlan(saved, true)
        toast.success('Plano salvo na nuvem', 'Sincronizado com sua conta Google.')
        return saved
      } catch (e) {
        const message = formatFirebaseError(e)
        setError(message)
        toast.error('Não foi possível salvar na nuvem', message)
        setCloudSynced(false)
        throw e
      } finally {
        setSaving(false)
      }
    },
    [user, applyPlan],
  )

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)
      try {
        if (user && canUseCloud()) {
          const cloud = await getCurrentUserDietPlan(user.uid)
          if (!cancelled && cloud) {
            applyPlan(cloud, true)
            return
          }
        }
        const local = loadLocalPlan()
        if (!cancelled) {
          setPlanState(local)
          setCloudSynced(isPlanCloudSynced(local))
        }
      } catch (e) {
        if (!cancelled) {
          const local = loadLocalPlan()
          setPlanState(local)
          setCloudSynced(isPlanCloudSynced(local))
          if (!local) setError(formatFirebaseError(e))
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [user, applyPlan])

  const importFromJson = useCallback(
    async (json: string) => {
      setError(null)
      let parsed: DietPlan
      try {
        parsed = parseDietPlanJson(json)
      } catch (e) {
        const message =
          e instanceof Error ? e.message : 'Não foi possível importar o JSON.'
        setError(message)
        toast.error('Erro ao importar', message)
        throw e
      }
      applyPlan(parsed, false)
      if (user && canUseCloud()) {
        await syncToCloud(parsed)
      } else {
        toast.success('Plano importado', 'Salvo neste dispositivo.')
      }
    },
    [user, applyPlan, syncToCloud],
  )

  const importFromPdf = useCallback(
    async (file: File) => {
      setError(null)
      let parsed: DietPlan
      try {
        const { json } = await extractDietJsonFromPdf(file)
        parsed = parseDietPlanJson(json)
      } catch (e) {
        const message =
          e instanceof Error ? e.message : 'Não foi possível processar o PDF.'
        setError(message)
        toast.error('Erro ao processar PDF', message)
        throw e
      }
      applyPlan(parsed, false)
      if (user && canUseCloud()) {
        await syncToCloud(parsed)
      } else {
        toast.success('Plano importado', 'Salvo neste dispositivo.')
      }
    },
    [user, applyPlan, syncToCloud],
  )

  const saveFood = useCallback(
    async (location: FoodLocation, data: { name: string; quantity: string }) => {
      commitPlanChange((current) => upsertFoodItem(current, location, data))
      toast.success(
        location.foodId ? 'Alimento atualizado' : 'Alimento adicionado',
        'Alteração salva neste dispositivo.',
      )
    },
    [commitPlanChange],
  )

  const removeFood = useCallback(
    async (location: FoodLocation) => {
      if (!location.foodId) return
      commitPlanChange((current) => removeFoodItem(current, location))
      toast.success('Alimento removido', 'Alteração salva neste dispositivo.')
    },
    [commitPlanChange],
  )

  const savePlan = useCallback(async () => {
    if (!plan) return
    if (user && canUseCloud()) {
      await syncToCloud(plan)
      return
    }
    persistLocal(plan)
    toast.success('Plano salvo localmente', 'Armazenado neste dispositivo.')
  }, [plan, user, syncToCloud])

  const value = useMemo(
    () => ({
      plan,
      loading,
      saving,
      cloudSynced,
      error,
      importFromJson,
      importFromPdf,
      savePlan,
      setPlan,
      saveFood,
      removeFood,
    }),
    [
      plan,
      loading,
      saving,
      cloudSynced,
      error,
      importFromJson,
      importFromPdf,
      savePlan,
      setPlan,
      saveFood,
      removeFood,
    ],
  )

  return <DietContext.Provider value={value}>{children}</DietContext.Provider>
}

export function useDiet() {
  const ctx = useContext(DietContext)
  if (!ctx) throw new Error('useDiet must be used within DietProvider')
  return ctx
}
