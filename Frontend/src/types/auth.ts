export type UserRole = 'admin' | 'employer' | 'recruiter' | 'candidate'
export type HiringRole = 'employer' | 'recruiter'

export type RecruiterProfile = {
  companyName: string
  companyWebsite?: string | null
  industry: string
  jobTitle: string
  country: string
  linkedIn?: string | null
}

export type AuthUser = {
  id: number
  name?: string
  fullName: string
  email: string
  phone?: string | null
  role: UserRole
  status?: string
  provider?: string
  recruiterProfile?: RecruiterProfile | null
}

export type AuthResponse = {
  success: boolean
  message?: string
  user?: AuthUser
  accessToken?: string
  refreshToken?: string
  errors?: { field: string; message: string }[]
}

export function isHiringRole(role: string): role is HiringRole {
  return role === 'employer' || role === 'recruiter'
}

export function homePath(role: UserRole) {
  if (role === 'admin') return '/admin'
  if (role === 'candidate') return '/candidate'
  if (role === 'recruiter') return '/employer'
  if (role === 'employer') return '/employer'
  return '/employer'
}

export function needsProfile(user: Pick<AuthUser, 'fullName' | 'role' | 'recruiterProfile'> | null) {
  if (!user) return false
  if (isHiringRole(user.role)) {
    return !user.fullName?.trim() || !user.recruiterProfile
  }
  return false
}
