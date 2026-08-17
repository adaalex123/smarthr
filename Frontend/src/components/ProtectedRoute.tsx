import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../AuthContext'
import { needsProfile, type AuthUser } from '../types/auth'

export default function ProtectedRoute({
  role,
  children,
}: {
  role: AuthUser['role']
  children: ReactNode
}) {
  const { accessToken, user } = useAuth()
  if (!accessToken) return <Navigate to="/login" replace />
  if (user && needsProfile(user)) return <Navigate to="/complete-profile" replace />
  if (user && user.role !== role) return <Navigate to="/" replace />
  return children
}
