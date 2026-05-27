import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
  type User,
} from 'firebase/auth'
import {
  clearAuthProfile,
  loadCachedAuthProfile,
  persistAuthProfile,
  type AuthProfile,
} from '../lib/auth-cache'
import { auth, googleProvider, isFirebaseConfigured } from '../lib/firebase'
import { toast } from '../lib/toast'

export type { AuthProfile }

interface AuthContextValue {
  user: AuthProfile | null
  loading: boolean
  isConfigured: boolean
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

function toAuthProfile(user: User): AuthProfile {
  return {
    uid: user.uid,
    displayName: user.displayName,
    email: user.email,
    photoURL: user.photoURL,
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthProfile | null>(loadCachedAuthProfile)
  const [loading, setLoading] = useState(!!auth)

  useEffect(() => {
    if (!auth) {
      setLoading(false)
      return
    }
    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      if (nextUser) {
        const profile = toAuthProfile(nextUser)
        setUser(profile)
        persistAuthProfile(profile)
      } else {
        setUser(null)
        clearAuthProfile()
      }
      setLoading(false)
    })
    return unsubscribe
  }, [])

  const signInWithGoogle = useCallback(async () => {
    if (!auth) throw new Error('Configure Firebase no arquivo .env')
    try {
      await signInWithPopup(auth, googleProvider)
      toast.success('Login realizado', 'Seu plano será sincronizado na nuvem.')
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Não foi possível entrar.'
      toast.error('Erro ao entrar', message)
      throw e
    }
  }, [])

  const signOut = useCallback(async () => {
    if (!auth) return
    await firebaseSignOut(auth)
    toast.info('Sessão encerrada', 'O plano local neste dispositivo foi mantido.')
  }, [])

  const value = useMemo(
    () => ({
      user,
      loading,
      isConfigured: isFirebaseConfigured,
      signInWithGoogle,
      signOut,
    }),
    [user, loading, signInWithGoogle, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
