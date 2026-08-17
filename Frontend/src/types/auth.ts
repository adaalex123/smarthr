export type UserRole = 'admin' | 'employer' | 'recruiter'

export type AuthUser = {
  id: number
  name?: string
  fullName: string
  email: string
  phone?: string | null
  role: UserRole
  status?: string
  provider?: string
}

export type AuthResponse = {
  success: boolean
  message?: string
  user?: AuthUser
  accessToken?: string
  refreshToken?: string
  errors?: { field: string; message: string }[]
}

export function homePath(role: UserRole) {
  if (role === 'admin') return '/admin'
  if (role === 'recruiter') return '/recruiter'
  return '/employer'
}

export function needsProfile(user: AuthUser | null) {
  return !user?.fullName?.trim()
}
