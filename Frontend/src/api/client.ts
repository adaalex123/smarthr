import type { AuthResponse } from '../types/auth'

const API_BASE = import.meta.env.VITE_API_BASE || 'https://smarthr-8x2b.onrender.com/api/v1'

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
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData
  if (isFormData) {
    headers.delete('Content-Type')
  } else {
    headers.set('Content-Type', 'application/json')
  }
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
    throw Object.assign(new Error(apiErrorMessage(data)), { status: res.status, data })
  }
  return data
}

export function apiErrorMessage(data: Pick<AuthResponse, 'message' | 'errors'> | undefined, fallback = 'Request failed') {
  const details = data?.errors?.map((item) => item.message).filter(Boolean) ?? []
  if (details.length) return details.join(' · ')
  return data?.message || fallback
}

export function apiErrorFields(error: unknown): Record<string, string> {
  const data = error instanceof Error ? (error as Error & { data?: AuthResponse }).data : undefined
  const fields: Record<string, string> = {}
  for (const item of data?.errors ?? []) {
    const key = item.field.split('.').pop() || item.field
    fields[key] = item.message
  }
  return fields
}
