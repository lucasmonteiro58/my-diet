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
import { toast } from '../lib/toast'
import {
  canUseShareCloud,
  deleteSharedAccess,
  fetchSharedPlan,
  getOrCreateShareCode,
  loadSharedAccessList,
  saveSharedAccess,
  subscribeToSharedPlan,
} from '../services/shareService'
import type { DietPlan, SharedPlanEntry, ViewingPlan } from '../types/diet'
import { useAuth } from './AuthContext'
import { useDiet } from './DietContext'

const LOCAL_KEY = 'my-diet-shared-plans'

interface SharedDietsContextValue {
  sharedPlans: SharedPlanEntry[]
  activePlanId: 'own' | string
  setActivePlanId: (id: 'own' | string) => void
  cycleActivePlan: () => void
  viewingPlan: ViewingPlan | null
  addByCode: (code: string) => Promise<void>
  removeSharedPlan: (code: string) => void
  shareOwnPlan: () => Promise<string>
  addingCode: boolean
  sharingPlan: boolean
}

const SharedDietsContext = createContext<SharedDietsContextValue | null>(null)

function loadLocalPlans(): SharedPlanEntry[] {
  try {
    const raw = localStorage.getItem(LOCAL_KEY)
    return raw ? (JSON.parse(raw) as SharedPlanEntry[]) : []
  } catch {
    return []
  }
}

function persistLocal(plans: SharedPlanEntry[]) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(plans))
}

function isSamePlanSnapshot(a: DietPlan, b: DietPlan): boolean {
  return a.id === b.id && a.updatedAt === b.updatedAt
}

function upsertSharedPlanEntry(
  prev: SharedPlanEntry[],
  entry: SharedPlanEntry,
): SharedPlanEntry[] {
  const index = prev.findIndex((p) => p.code === entry.code)
  if (index === -1) return [...prev, entry]

  const existing = prev[index]
  if (isSamePlanSnapshot(existing.plan, entry.plan)) return prev

  const next = [...prev]
  next[index] = { ...existing, plan: entry.plan }
  return next
}

export function SharedDietsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const { plan: ownPlan } = useDiet()
  const [sharedPlans, setSharedPlansState] = useState<SharedPlanEntry[]>(loadLocalPlans)
  const [activePlanId, setActivePlanId] = useState<'own' | string>('own')
  const [addingCode, setAddingCode] = useState(false)
  const [sharingPlan, setSharingPlan] = useState(false)

  const sharedCodesKey = useMemo(
    () => sharedPlans.map((p) => p.code).sort().join(','),
    [sharedPlans],
  )

  const updateSharedPlan = useCallback(
    (code: string, plan: DietPlan) => {
      setSharedPlansState((prev) => {
        const entry = prev.find((p) => p.code === code)
        if (!entry || isSamePlanSnapshot(entry.plan, plan)) return prev

        const next = prev.map((p) => (p.code === code ? { ...p, plan } : p))
        persistLocal(next)

        if (user) {
          void saveSharedAccess(user.uid, code, plan, entry.addedAt)
        }

        return next
      })
    },
    [user],
  )

  // Refresh from Firestore on login — always fetch the latest shared snapshot.
  useEffect(() => {
    if (!user || !canUseShareCloud()) return
    let cancelled = false

    async function syncFromCloud() {
      try {
        const docs = await loadSharedAccessList(user!.uid)
        if (cancelled || docs.length === 0) return

        const refreshed = await Promise.all(
          docs.map(async (d) => {
            const live = await fetchSharedPlan(d.code)
            return {
              code: d.code,
              addedAt: d.addedAt,
              plan: live?.plan ?? d.planData,
            } satisfies SharedPlanEntry
          }),
        )

        if (cancelled) return

        setSharedPlansState((prev) => {
          const map = new Map(prev.map((p) => [p.code, p]))
          for (const entry of refreshed) {
            map.set(entry.code, entry)
          }
          const merged = Array.from(map.values())
          persistLocal(merged)
          return merged
        })
      } catch {
        // Non-critical — local cache is the fallback
      }
    }

    void syncFromCloud()
    return () => {
      cancelled = true
    }
  }, [user])

  // Live updates from the owner's shared plan document.
  useEffect(() => {
    if (!canUseShareCloud() || !sharedCodesKey) return

    const codes = sharedCodesKey.split(',').filter(Boolean)
    const unsubscribers = codes.map((code) =>
      subscribeToSharedPlan(code, (plan) => {
        if (!plan) return
        updateSharedPlan(code, plan)
      }),
    )

    return () => {
      unsubscribers.forEach((unsubscribe) => unsubscribe())
    }
  }, [sharedCodesKey, updateSharedPlan])

  // Fall back to own plan if the active shared plan is removed
  const effectiveActivePlanId = useMemo(() => {
    if (activePlanId === 'own') return 'own'
    const still = sharedPlans.find((p) => p.code === activePlanId)
    return still ? activePlanId : 'own'
  }, [activePlanId, sharedPlans])

  const viewingPlan = useMemo((): ViewingPlan | null => {
    if (effectiveActivePlanId === 'own') {
      return ownPlan ? { plan: ownPlan, isOwn: true } : null
    }
    const entry = sharedPlans.find((p) => p.code === effectiveActivePlanId)
    return entry ? { plan: entry.plan, isOwn: false, shareCode: entry.code } : null
  }, [effectiveActivePlanId, ownPlan, sharedPlans])

  const addByCode = useCallback(
    async (code: string) => {
      const upper = code.trim().toUpperCase()
      if (!upper) return

      setAddingCode(true)
      try {
        const result = await fetchSharedPlan(upper)
        if (!result) {
          toast.error('Código inválido', 'Nenhum plano encontrado para este código.')
          return
        }

        const existing = sharedPlans.find((p) => p.code === upper)
        const addedAt = existing?.addedAt ?? new Date().toISOString()
        const entry: SharedPlanEntry = { code: upper, addedAt, plan: result.plan }

        setSharedPlansState((prev) => {
          const next = upsertSharedPlanEntry(prev, entry)
          persistLocal(next)
          return next
        })
        setActivePlanId(upper)

        if (user) {
          void saveSharedAccess(user.uid, upper, result.plan, addedAt)
        }

        toast.success(
          existing ? 'Dieta atualizada' : 'Dieta adicionada',
          existing
            ? `Plano de ${result.plan.patientName} sincronizado com a versão mais recente.`
            : `Plano de ${result.plan.patientName} adicionado com sucesso.`,
        )
      } catch (e) {
        toast.error('Erro ao buscar plano', formatFirebaseError(e))
      } finally {
        setAddingCode(false)
      }
    },
    [sharedPlans, user],
  )

  const removeSharedPlan = useCallback(
    (code: string) => {
      setSharedPlansState((prev) => {
        const next = prev.filter((p) => p.code !== code)
        persistLocal(next)
        return next
      })
      if (user) {
        void deleteSharedAccess(user.uid, code)
      }
    },
    [user],
  )

  const shareOwnPlan = useCallback(async (): Promise<string> => {
    if (!user) throw new Error('Você precisa estar logado para compartilhar.')
    if (!ownPlan) throw new Error('Nenhum plano para compartilhar.')

    setSharingPlan(true)
    try {
      return await getOrCreateShareCode(user.uid, ownPlan)
    } catch (e) {
      toast.error('Erro ao compartilhar', formatFirebaseError(e))
      throw e
    } finally {
      setSharingPlan(false)
    }
  }, [user, ownPlan])

  const cycleActivePlan = useCallback(() => {
    const ids: ('own' | string)[] = []
    if (ownPlan) ids.push('own')
    ids.push(...sharedPlans.map((p) => p.code))
    if (ids.length < 2) return

    const current = effectiveActivePlanId
    const index = ids.indexOf(current)
    const next = ids[(index + 1) % ids.length]
    setActivePlanId(next)
  }, [ownPlan, sharedPlans, effectiveActivePlanId])

  const value = useMemo(
    () => ({
      sharedPlans,
      activePlanId: effectiveActivePlanId,
      setActivePlanId,
      cycleActivePlan,
      viewingPlan,
      addByCode,
      removeSharedPlan,
      shareOwnPlan,
      addingCode,
      sharingPlan,
    }),
    [
      sharedPlans,
      effectiveActivePlanId,
      viewingPlan,
      addByCode,
      cycleActivePlan,
      removeSharedPlan,
      shareOwnPlan,
      addingCode,
      sharingPlan,
    ],
  )

  return (
    <SharedDietsContext.Provider value={value}>{children}</SharedDietsContext.Provider>
  )
}

export function useSharedDiets(): SharedDietsContextValue {
  const ctx = useContext(SharedDietsContext)
  if (!ctx) throw new Error('useSharedDiets must be used within SharedDietsProvider')
  return ctx
}
