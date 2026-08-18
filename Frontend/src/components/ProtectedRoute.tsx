import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../AuthContext'
import { homePath, needsProfile, type AuthUser } from '../types/auth'

export default function ProtectedRoute({
  role,
  roles,
  children,
}: {
  role?: AuthUser['role']
  roles?: AuthUser['role'][]
  children: ReactNode
}) {
  const { accessToken, user } = useAuth()
  const allowed = roles ?? (role ? [role] : [])
  if (!accessToken) return <Navigate to="/login" replace />
  if (user && needsProfile(user)) return <Navigate to="/complete-profile" replace />
  if (user && allowed.length && !allowed.includes(user.role)) {
    return <Navigate to={homePath(user.role)} replace />
  }
  return children
}
