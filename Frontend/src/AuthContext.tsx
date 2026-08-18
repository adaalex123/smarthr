import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import { apiRequest } from './api/client'
import { signInWithGoogle, signOutGoogle } from './lib/firebase'
import type { RecruiterProfileInput } from './constants/recruiterSignup'
import type { AuthResponse, AuthUser, UserRole } from './types/auth'

type SignupPayload = {
  email: string
  password: string
  role: UserRole
  fullName?: string
  phone?: string
  country?: string
  recruiterProfile?: RecruiterProfileInput
}

type CompleteProfilePayload = {
  fullName: string
  phone?: string
  recruiterProfile?: RecruiterProfileInput
}

type AuthContextValue = {
  accessToken: string | null
  user: AuthUser | null
  role: UserRole | null
  login: (email: string, password: string) => Promise<AuthUser>
  signup: (payload: SignupPayload) => Promise<AuthUser>
  googleAuth: (role?: UserRole) => Promise<AuthUser>
  completeProfile: (payload: CompleteProfilePayload) => Promise<AuthUser>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

function persist(data: AuthResponse) {
  if (data.accessToken) localStorage.setItem('accessToken', data.accessToken)
  if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken)
  if (data.user) localStorage.setItem('user', JSON.stringify(data.user))
}

function sessionUser(data: AuthResponse): AuthUser {
  if (!data.user || !data.accessToken || !data.refreshToken) {
    throw new Error(data.message || 'Authentication failed')
  }
  persist(data)
  return data.user
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(() => localStorage.getItem('accessToken'))
  const [user, setUser] = useState<AuthUser | null>(() => {
    const raw = localStorage.getItem('user')
    return raw ? (JSON.parse(raw) as AuthUser) : null
  })

  const value = useMemo<AuthContextValue>(() => ({
    accessToken,
    user,
    role: user?.role ?? null,
    async login(email, password) {
      const data = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      })
      const nextUser = sessionUser(data)
      setAccessToken(data.accessToken!)
      setUser(nextUser)
      return nextUser
    },
    async signup(payload) {
      const data = await apiRequest('/auth/signup', {
        method: 'POST',
        body: JSON.stringify(payload),
      })
      const nextUser = sessionUser(data)
      setAccessToken(data.accessToken!)
      setUser(nextUser)
      return nextUser
    },
    async googleAuth(role) {
      const idToken = await signInWithGoogle()
      const data = await apiRequest('/auth/oauth', {
        method: 'POST',
        body: JSON.stringify({ idToken, role }),
      })
      const nextUser = sessionUser(data)
      setAccessToken(data.accessToken!)
      setUser(nextUser)
      return nextUser
    },
    async completeProfile(payload) {
      const data = await apiRequest('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(payload),
      })
      if (!data.user) throw new Error('Could not save profile')
      localStorage.setItem('user', JSON.stringify(data.user))
      setUser(data.user)
      return data.user
    },
    async logout() {
      const refreshToken = localStorage.getItem('refreshToken')
      try {
        await apiRequest('/auth/logout', {
          method: 'POST',
          body: JSON.stringify({ refreshToken }),
        })
      } catch {
        // still clear local session
      }
      try {
        await signOutGoogle()
      } catch {
        // local logout should still succeed even if Google session cleanup fails
      }
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('user')
      localStorage.removeItem('token')
      localStorage.removeItem('role')
      setAccessToken(null)
      setUser(null)
    },
  }), [accessToken, user])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
