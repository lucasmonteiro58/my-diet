import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  setDoc,
  where,
  writeBatch,
} from 'firebase/firestore'
import { stripUndefinedDeep } from '../lib/firestore-data'
import { db, isFirebaseConfigured } from '../lib/firebase'
import type { DietPlan } from '../types/diet'

const PLANS = 'dietPlans'

export interface StoredDietPlan extends DietPlan {
  userId: string
  current: boolean
}

function planDocId(userId: string, planId: string): string {
  return `${userId}_${planId}`
}

function docToPlan(data: Record<string, unknown>): DietPlan {
  const { userId: _userId, current: _current, ...plan } = data
  return plan as unknown as DietPlan
}

function sortPlansNewestFirst(plans: DietPlan[]): DietPlan[] {
  return [...plans].sort((a, b) => {
    const aTime = a.createdAt ?? a.updatedAt ?? ''
    const bTime = b.createdAt ?? b.updatedAt ?? ''
    return bTime.localeCompare(aTime)
  })
}

function withTimestamps(plan: DietPlan): DietPlan {
  const now = new Date().toISOString()
  return {
    ...plan,
    createdAt: plan.createdAt ?? now,
    updatedAt: now,
  }
}

async function clearOtherCurrentPlans(
  userId: string,
  exceptDocId: string,
): Promise<void> {
  if (!db) return
  const snap = await getDocs(
    query(
      collection(db, PLANS),
      where('userId', '==', userId),
      where('current', '==', true),
    ),
  )
  const batch = writeBatch(db)
  let hasWrites = false
  for (const d of snap.docs) {
    if (d.id === exceptDocId) continue
    batch.update(d.ref, { current: false })
    hasWrites = true
  }
  if (hasWrites) await batch.commit()
}

/** Saves plan to Firestore, marks it current, keeps older plans (current=false). */
export async function saveDietPlanAsCurrent(
  userId: string,
  plan: DietPlan,
): Promise<DietPlan> {
  if (!db) throw new Error('Firebase not configured')

  const stamped = withTimestamps(plan)
  const docId = planDocId(userId, stamped.id)
  const ref = doc(db, PLANS, docId)

  await clearOtherCurrentPlans(userId, docId)

  await setDoc(
    ref,
    stripUndefinedDeep({
      ...stamped,
      userId,
      current: true,
    }),
    { merge: true },
  )

  return stamped
}

/** Current plan if flagged; otherwise the most recently created. */
export async function getCurrentUserDietPlan(userId: string): Promise<DietPlan | null> {
  if (!db) return null

  const currentSnap = await getDocs(
    query(
      collection(db, PLANS),
      where('userId', '==', userId),
      where('current', '==', true),
      limit(1),
    ),
  )
  if (!currentSnap.empty) {
    return docToPlan(currentSnap.docs[0].data() as Record<string, unknown>)
  }

  const allSnap = await getDocs(
    query(collection(db, PLANS), where('userId', '==', userId)),
  )
  if (allSnap.empty) return null
  const plans = sortPlansNewestFirst(
    allSnap.docs.map((d) => docToPlan(d.data() as Record<string, unknown>)),
  )
  return plans[0] ?? null
}

/** All saved plans for the user, newest first. */
export async function getUserDietPlanHistory(userId: string): Promise<DietPlan[]> {
  if (!db) return []

  const snap = await getDocs(
    query(collection(db, PLANS), where('userId', '==', userId)),
  )

  const plans = snap.docs.map((d) => docToPlan(d.data() as Record<string, unknown>))
  return sortPlansNewestFirst(plans)
}

export interface DeleteDietPlanResult {
  deletedWasCurrent: boolean
  newCurrentPlan: DietPlan | null
}

/** Removes a plan from history. Promotes the next newest plan if the current one was deleted. */
export async function deleteUserDietPlan(
  userId: string,
  planId: string,
): Promise<DeleteDietPlanResult> {
  if (!db) throw new Error('Firebase not configured')

  const docId = planDocId(userId, planId)
  const ref = doc(db, PLANS, docId)
  const snap = await getDoc(ref)

  if (!snap.exists()) {
    return { deletedWasCurrent: false, newCurrentPlan: null }
  }

  const wasCurrent = snap.data().current === true
  await deleteDoc(ref)

  if (!wasCurrent) {
    return { deletedWasCurrent: false, newCurrentPlan: null }
  }

  const remaining = await getUserDietPlanHistory(userId)
  const next = remaining[0] ?? null

  if (next) {
    const nextRef = doc(db, PLANS, planDocId(userId, next.id))
    await setDoc(nextRef, { current: true }, { merge: true })
  }

  return { deletedWasCurrent: true, newCurrentPlan: next }
}

export function canUseCloud(): boolean {
  return isFirebaseConfigured
}
