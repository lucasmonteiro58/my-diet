import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  query,
  setDoc,
  where,
} from 'firebase/firestore'
import { stripUndefinedDeep } from '../lib/firestore-data'
import { db, isFirebaseConfigured } from '../lib/firebase'
import type { DietPlan } from '../types/diet'

const SHARED = 'sharedPlans'
const ACCESS = 'sharedAccess'
const CACHE_KEY = 'my-diet-share-code-cache'

interface ShareCodeCache {
  ownerId: string
  code: string
}

interface SharedPlanDoc {
  ownerId: string
  patientName: string
  planData: DietPlan
  createdAt: string
  updatedAt?: string
}

function generateCode(): string {
  return Math.random().toString(36).slice(2, 8).toUpperCase()
}

function loadShareCodeCache(): ShareCodeCache | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as ShareCodeCache & { planId?: string }
    if (parsed.ownerId && parsed.code) return parsed
    return null
  } catch {
    return null
  }
}

function persistShareCodeCache(ownerId: string, code: string) {
  localStorage.setItem(CACHE_KEY, JSON.stringify({ ownerId, code }))
}

function sharedPlanPayload(ownerId: string, plan: DietPlan) {
  const now = new Date().toISOString()
  const stampedPlan: DietPlan = { ...plan, updatedAt: now }

  return stripUndefinedDeep({
    ownerId,
    patientName: plan.patientName,
    planData: stampedPlan,
    updatedAt: now,
  })
}

/** Finds the owner's existing share code from cache or Firestore. */
export async function findExistingShareCode(ownerId: string): Promise<string | null> {
  if (!db || !isFirebaseConfigured) return null

  const cached = loadShareCodeCache()
  if (cached?.ownerId === ownerId && cached.code) {
    try {
      const existing = await getDoc(doc(db, SHARED, cached.code))
      if (existing.exists() && existing.data().ownerId === ownerId) {
        return cached.code
      }
    } catch {
      // fall through to Firestore query
    }
  }

  const snap = await getDocs(
    query(collection(db, SHARED), where('ownerId', '==', ownerId), limit(1)),
  )
  if (snap.empty) return null

  const code = snap.docs[0].id
  persistShareCodeCache(ownerId, code)
  return code
}

/** Returns the owner's share code, reusing it and updating planData with the current diet. */
export async function getOrCreateShareCode(
  ownerId: string,
  plan: DietPlan,
): Promise<string> {
  if (!db || !isFirebaseConfigured) throw new Error('Firebase não configurado')

  const existingCode = await findExistingShareCode(ownerId)
  if (existingCode) {
    await setDoc(doc(db, SHARED, existingCode), sharedPlanPayload(ownerId, plan), {
      merge: true,
    })
    persistShareCodeCache(ownerId, existingCode)
    return existingCode
  }

  const code = generateCode()
  const data: SharedPlanDoc = {
    ownerId,
    patientName: plan.patientName,
    planData: plan,
    createdAt: new Date().toISOString(),
    updatedAt: plan.updatedAt ?? new Date().toISOString(),
  }

  await setDoc(doc(db, SHARED, code), stripUndefinedDeep(data))
  persistShareCodeCache(ownerId, code)

  return code
}

/** Updates the owner's shared plan snapshot when they already have a share code. */
export async function syncSharedPlan(ownerId: string, plan: DietPlan): Promise<void> {
  if (!db || !isFirebaseConfigured) return

  try {
    const code = await findExistingShareCode(ownerId)
    if (!code) return

    await setDoc(doc(db, SHARED, code), sharedPlanPayload(ownerId, plan), { merge: true })
  } catch {
    // Non-critical — don't surface errors for background sync
  }
}

/** Live updates for recipients viewing a shared plan by code. */
export function subscribeToSharedPlan(
  code: string,
  onUpdate: (plan: DietPlan | null) => void,
): () => void {
  if (!db || !isFirebaseConfigured) {
    onUpdate(null)
    return () => {}
  }

  const upper = code.toUpperCase()
  return onSnapshot(
    doc(db, SHARED, upper),
    (snap) => {
      if (!snap.exists()) {
        onUpdate(null)
        return
      }
      const data = snap.data() as SharedPlanDoc
      onUpdate(data.planData)
    },
    () => onUpdate(null),
  )
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

export function canUseShareCloud(): boolean {
  return isFirebaseConfigured
}
