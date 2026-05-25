import { collection, deleteDoc, doc, getDocs, getDoc, query, setDoc, where } from 'firebase/firestore'
import { stripUndefinedDeep } from '../lib/firestore-data'
import { db, isFirebaseConfigured } from '../lib/firebase'
import type { DietPlan } from '../types/diet'

const SHARED = 'sharedPlans'
const ACCESS = 'sharedAccess'
const CACHE_KEY = 'my-diet-share-code-cache'

interface ShareCodeCache {
  planId: string
  code: string
}

interface SharedPlanDoc {
  ownerId: string
  patientName: string
  planData: DietPlan
  createdAt: string
}

function generateCode(): string {
  return Math.random().toString(36).slice(2, 8).toUpperCase()
}

function loadShareCodeCache(): ShareCodeCache | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    return raw ? (JSON.parse(raw) as ShareCodeCache) : null
  } catch {
    return null
  }
}

function persistShareCodeCache(planId: string, code: string) {
  localStorage.setItem(CACHE_KEY, JSON.stringify({ planId, code }))
}

export async function getOrCreateShareCode(
  ownerId: string,
  plan: DietPlan,
): Promise<string> {
  if (!db || !isFirebaseConfigured) throw new Error('Firebase não configurado')

  const cached = loadShareCodeCache()
  if (cached?.planId === plan.id && cached.code) {
    try {
      const existing = await getDoc(doc(db, SHARED, cached.code))
      if (existing.exists()) return cached.code
    } catch {
      // fall through to create a new code
    }
  }

  const code = generateCode()
  const ref = doc(db, SHARED, code)

  const data: SharedPlanDoc = {
    ownerId,
    patientName: plan.patientName,
    planData: plan,
    createdAt: new Date().toISOString(),
  }

  await setDoc(ref, stripUndefinedDeep(data))
  persistShareCodeCache(plan.id, code)

  return code
}

/** Silently updates the shared plan snapshot if a code is already cached for this plan. */
export async function syncSharedPlanIfExists(
  ownerId: string,
  plan: DietPlan,
): Promise<void> {
  if (!db || !isFirebaseConfigured) return

  const cached = loadShareCodeCache()
  if (!cached || cached.planId !== plan.id) return

  try {
    const ref = doc(db, SHARED, cached.code)
    const existing = await getDoc(ref)
    if (!existing.exists()) return

    await setDoc(
      ref,
      stripUndefinedDeep({
        ownerId,
        patientName: plan.patientName,
        planData: plan,
      }),
      { merge: true },
    )
  } catch {
    // Non-critical — don't surface errors for background sync
  }
}

export interface SharedAccessDoc {
  userId: string
  code: string
  addedAt: string
  planData: DietPlan
}

function accessDocId(userId: string, code: string): string {
  return `${userId}_${code}`
}

export async function saveSharedAccess(
  userId: string,
  code: string,
  plan: DietPlan,
  addedAt: string,
): Promise<void> {
  if (!db || !isFirebaseConfigured) return
  const ref = doc(db, ACCESS, accessDocId(userId, code))
  await setDoc(ref, stripUndefinedDeep({ userId, code, addedAt, planData: plan }))
}

export async function loadSharedAccessList(userId: string): Promise<SharedAccessDoc[]> {
  if (!db || !isFirebaseConfigured) return []
  const snap = await getDocs(
    query(collection(db, ACCESS), where('userId', '==', userId)),
  )
  return snap.docs.map((d) => d.data() as SharedAccessDoc)
}

export async function deleteSharedAccess(userId: string, code: string): Promise<void> {
  if (!db || !isFirebaseConfigured) return
  await deleteDoc(doc(db, ACCESS, accessDocId(userId, code)))
}

export async function fetchSharedPlan(
  code: string,
): Promise<{ plan: DietPlan; ownerId: string } | null> {
  if (!db || !isFirebaseConfigured) return null

  const snap = await getDoc(doc(db, SHARED, code.toUpperCase()))
  if (!snap.exists()) return null

  const data = snap.data() as SharedPlanDoc
  return { plan: data.planData, ownerId: data.ownerId }
}
