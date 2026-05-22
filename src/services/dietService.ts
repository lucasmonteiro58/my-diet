import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  setDoc,
  where,
} from 'firebase/firestore'
import { db, isFirebaseConfigured } from '../lib/firebase'
import type { DietPlan } from '../types/diet'

const PLANS = 'dietPlans'

export async function saveDietPlan(userId: string, plan: DietPlan): Promise<void> {
  if (!db) throw new Error('Firebase not configured')
  const ref = doc(db, PLANS, `${userId}_${plan.id}`)
  await setDoc(
    ref,
    {
      ...plan,
      userId,
      updatedAt: new Date().toISOString(),
      createdAt: plan.createdAt ?? new Date().toISOString(),
    },
    { merge: true },
  )
}

export async function getUserDietPlan(userId: string): Promise<DietPlan | null> {
  if (!db) return null
  const q = query(
    collection(db, PLANS),
    where('userId', '==', userId),
    orderBy('updatedAt', 'desc'),
    limit(1),
  )
  const snap = await getDocs(q)
  if (snap.empty) return null
  const data = snap.docs[0].data()
  const { userId: _, ...plan } = data
  return plan as DietPlan
}

export async function getDietPlanById(
  userId: string,
  planId: string,
): Promise<DietPlan | null> {
  if (!db) return null
  const ref = doc(db, PLANS, `${userId}_${planId}`)
  const snap = await getDoc(ref)
  if (!snap.exists()) return null
  const data = snap.data()
  const { userId: _, ...plan } = data
  return plan as DietPlan
}

export function canUseCloud(): boolean {
  return isFirebaseConfigured
}
