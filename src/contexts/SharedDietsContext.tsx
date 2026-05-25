import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { formatFirebaseError } from '../lib/firebase-errors'
import { toast } from '../lib/toast'
import { fetchSharedPlan, getOrCreateShareCode } from '../services/shareService'
import type { SharedPlanEntry, ViewingPlan } from '../types/diet'
import { useAuth } from './AuthContext'
import { useDiet } from './DietContext'

export type { SharedPlanEntry, ViewingPlan }

const LOCAL_KEY = 'my-diet-shared-plans'

interface SharedDietsContextValue {
  sharedPlans: SharedPlanEntry[]
  activePlanId: 'own' | string
  setActivePlanId: (id: 'own' | string) => void
  viewingPlan: ViewingPlan | null
  addByCode: (code: string) => Promise<void>
  removeSharedPlan: (code: string) => void
  shareOwnPlan: () => Promise<string>
  addingCode: boolean
  sharingPlan: boolean
}

const SharedDietsContext = createContext<SharedDietsContextValue | null>(null)

function loadSharedPlans(): SharedPlanEntry[] {
  try {
    const raw = localStorage.getItem(LOCAL_KEY)
    return raw ? (JSON.parse(raw) as SharedPlanEntry[]) : []
  } catch {
    return []
  }
}

function persistSharedPlans(plans: SharedPlanEntry[]) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(plans))
}

export function SharedDietsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const { plan: ownPlan } = useDiet()
  const [sharedPlans, setSharedPlansState] = useState<SharedPlanEntry[]>(loadSharedPlans)
  const [activePlanId, setActivePlanId] = useState<'own' | string>('own')
  const [addingCode, setAddingCode] = useState(false)
  const [sharingPlan, setSharingPlan] = useState(false)

  // Compute the effective active ID — fall back to 'own' if the shared plan was removed
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

      if (sharedPlans.some((p) => p.code === upper)) {
        toast.info('Dieta já adicionada', 'Este código já está na sua lista.')
        return
      }

      setAddingCode(true)
      try {
        const result = await fetchSharedPlan(upper)
        if (!result) {
          toast.error('Código inválido', 'Nenhum plano encontrado para este código.')
          return
        }
        const entry: SharedPlanEntry = {
          code: upper,
          addedAt: new Date().toISOString(),
          plan: result.plan,
        }
        setSharedPlansState((prev) => {
          const next = [...prev, entry]
          persistSharedPlans(next)
          return next
        })
        setActivePlanId(upper)
        toast.success(
          'Dieta adicionada',
          `Plano de ${result.plan.patientName} adicionado com sucesso.`,
        )
      } catch (e) {
        toast.error('Erro ao buscar plano', formatFirebaseError(e))
      } finally {
        setAddingCode(false)
      }
    },
    [sharedPlans],
  )

  const removeSharedPlan = useCallback((code: string) => {
    setSharedPlansState((prev) => {
      const next = prev.filter((p) => p.code !== code)
      persistSharedPlans(next)
      return next
    })
  }, [])

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

  const value = useMemo(
    () => ({
      sharedPlans,
      activePlanId: effectiveActivePlanId,
      setActivePlanId,
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
