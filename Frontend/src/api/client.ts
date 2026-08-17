import type { AuthResponse } from '../types/auth'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api/v1'

async function refreshSession(): Promise<boolean> {
  const refreshToken = localStorage.getItem('refreshToken')
  if (!refreshToken) return false

  const res = await fetch(`${API_BASE}/auth/refresh-token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ refreshToken }),
  })

  if (!res.ok) return false
  const data = (await res.json()) as AuthResponse
  if (!data.accessToken || !data.refreshToken) return false
  localStorage.setItem('accessToken', data.accessToken)
  localStorage.setItem('refreshToken', data.refreshToken)
  if (data.user) localStorage.setItem('user', JSON.stringify(data.user))
  return true
}

export async function apiRequest<T = AuthResponse>(
  path: string,
  options: RequestInit = {},
  retried = false
): Promise<T> {
  const accessToken = localStorage.getItem('accessToken')
  const headers = new Headers(options.headers)
  headers.set('Content-Type', 'application/json')
  if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`)

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    credentials: 'include',
  })

  if (res.status === 401 && !retried && path !== '/auth/refresh-token' && path !== '/auth/login') {
    const refreshed = await refreshSession()
    if (refreshed) return apiRequest<T>(path, options, true)
  }

  const data = (await res.json().catch(() => ({}))) as T & AuthResponse
  if (!res.ok) {
    const message = data.message || 'Request failed'
    throw Object.assign(new Error(message), { status: res.status, data })
  }
  return data
}
