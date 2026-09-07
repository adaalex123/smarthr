import type { AuthResponse } from '../types/auth'

const API_BASE = import.meta.env.VITE_API_BASE || 'https://smarthr-8x2b.onrender.com/api/v1'

export type ApiFieldError = { field: string; message: string }

export type ApiErrorPayload = {
  success?: boolean
  message?: string
  errors?: ApiFieldError[]
  field?: string
  status?: number
}

export class ApiError extends Error {
  status: number
  data: ApiErrorPayload | null
  fieldErrors: ApiFieldError[]
  path: string
  method: string
  timestamp: string

  constructor(
    message: string,
    opts: { status: number; data: ApiErrorPayload | null; path: string; method: string },
  ) {
    super(message)
    this.name = 'ApiError'
    this.status = opts.status
    this.data = opts.data
    this.fieldErrors = opts.data?.errors ?? []
    this.path = opts.path
    this.method = opts.method
    this.timestamp = new Date().toISOString()
  }
}

function buildLogPrefix(method: string, path: string, status: number) {
  return `[API ERROR] ${method.toUpperCase()} ${path} → ${status}`
}

export function logApiError(error: ApiError) {
  const prefix = buildLogPrefix(error.method, error.path, error.status)
  // Always print detailed error for developer visibility
  console.groupCollapsed(`%c${prefix} %c${error.message}`, 'color:#b85448;font-weight:900', 'color:#5f736f;font-weight:600')
  console.error('Message:', error.message)
  console.error('Status:', error.status)
  console.error('Path:', error.path)
  console.error('Method:', error.method)
  console.error('Timestamp:', error.timestamp)
  if (error.fieldErrors.length) {
    console.error('Field errors:', error.fieldErrors)
    console.table(error.fieldErrors)
  }
  console.error('Raw payload:', error.data)
  console.error('Full error object:', error)
  console.groupEnd()

  // Also single-line fallback for environments where groupCollapsed is not visible
  console.error(prefix, {
    message: error.message,
    status: error.status,
    path: error.path,
    method: error.method,
    errors: error.fieldErrors,
    data: error.data,
  })
}

function logNetworkError(path: string, method: string, err: unknown) {
  console.groupCollapsed(`%c[API NETWORK ERROR] %c${method.toUpperCase()} ${path}`, 'color:#b85448;font-weight:900', 'color:#5f736f')
  console.error('Network / parsing failure - no response from server')
  console.error('Path:', path)
  console.error('Method:', method)
  console.error('Error:', err)
  console.groupEnd()
}

async function refreshSession(): Promise<boolean> {
  const refreshToken = localStorage.getItem('refreshToken')
  if (!refreshToken) return false

  try {
    const res = await fetch(`${API_BASE}/auth/refresh-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ refreshToken }),
    })
    if (!res.ok) {
      console.warn('[API] refresh-token failed:', res.status, res.statusText)
      return false
    }
    const data = (await res.json()) as AuthResponse
    if (!data.accessToken || !data.refreshToken) return false
    localStorage.setItem('accessToken', data.accessToken)
    localStorage.setItem('refreshToken', data.refreshToken)
    if (data.user) localStorage.setItem('user', JSON.stringify(data.user))
    return true
  } catch (err) {
    console.warn('[API] refresh-token network error', err)
    return false
  }
}

export async function apiRequest<T = AuthResponse>(
  path: string,
  options: RequestInit = {},
  retried = false,
): Promise<T> {
  const accessToken = localStorage.getItem('accessToken')
  const headers = new Headers(options.headers)
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData
  const method = (options.method || 'GET').toUpperCase()
  if (isFormData) {
    headers.delete('Content-Type')
  } else {
    headers.set('Content-Type', 'application/json')
  }
  if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`)

  let res: Response
  try {
    res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers,
      credentials: 'include',
    })
  } catch (networkErr) {
    logNetworkError(path, method, networkErr)
    const apiErr = new ApiError('Network error - could not reach server. Check your connection or API base URL.', {
      status: 0,
      data: { message: 'Network error - could not reach server', errors: [] },
      path,
      method,
    })
    logApiError(apiErr)
    throw apiErr
  }

  if (res.status === 401 && !retried && path !== '/auth/refresh-token' && path !== '/auth/login') {
    const refreshed = await refreshSession()
    if (refreshed) return apiRequest<T>(path, options, true)
  }

  let data: ApiErrorPayload & T
  try {
    data = (await res.json()) as ApiErrorPayload & T
  } catch {
    data = {} as ApiErrorPayload & T
  }

  if (!res.ok) {
    const message = apiErrorMessage(data as ApiErrorPayload, `Request failed (${res.status})`)
    const payload: ApiErrorPayload = {
      message,
      errors: (data as ApiErrorPayload).errors,
      success: (data as ApiErrorPayload).success,
    }
    // Include field if backend sent single field error (e.g. P2002)
    if ((data as ApiErrorPayload).field) payload.field = (data as ApiErrorPayload).field

    const apiErr = new ApiError(message, {
      status: res.status,
      data: { ...(data as ApiErrorPayload), message, errors: payload.errors },
      path,
      method,
    })
    logApiError(apiErr)
    throw apiErr
  }

  // Success logging at debug level (visible when needed, not noisy)
  if (import.meta.env.DEV) {
    console.debug(`[API OK] ${method} ${path} → ${res.status}`)
  }

  return data
}

export function apiErrorMessage(data: ApiErrorPayload | undefined, fallback = 'Request failed') {
  const details = data?.errors?.map((item) => item.message).filter(Boolean) ?? []
  if (details.length) return details.join(' · ')
  if (data?.message) return data.message
  return fallback
}

export function apiErrorFields(error: unknown): Record<string, string> {
  const data = error instanceof ApiError ? error.data : error instanceof Error ? (error as Error & { data?: ApiErrorPayload }).data : undefined
  const fields: Record<string, string> = {}
  for (const item of data?.errors ?? []) {
    const key = item.field.split('.').pop() || item.field
    fields[key] = item.message
  }
  // Handle single field error from Prisma P2002
  if (data?.field && !fields[data.field]) {
    fields[data.field] = data.message || 'Already exists'
  }
  return fields
}

export function getApiErrorDetails(error: unknown): {
  status: number | null
  message: string
  errors: ApiFieldError[]
  raw: ApiErrorPayload | null
  path: string | null
  isNetwork: boolean
} {
  if (error instanceof ApiError) {
    return {
      status: error.status,
      message: error.message,
      errors: error.fieldErrors,
      raw: error.data,
      path: error.path,
      isNetwork: error.status === 0,
    }
  }
  if (error instanceof Error) {
    const maybe = error as Error & { status?: number; data?: ApiErrorPayload; path?: string }
    return {
      status: maybe.status ?? null,
      message: error.message || 'Unknown error',
      errors: maybe.data?.errors ?? [],
      raw: maybe.data ?? null,
      path: maybe.path ?? null,
      isNetwork: false,
    }
  }
  return {
    status: null,
    message: typeof error === 'string' ? error : 'Unknown error',
    errors: [],
    raw: null,
    path: null,
    isNetwork: false,
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError
}

export function formatApiError(error: unknown): string {
  const d = getApiErrorDetails(error)
  const statusPart = d.status ? `[${d.status}] ` : ''
  const fieldPart = d.errors.length ? ` (${d.errors.map((e) => `${e.field}: ${e.message}`).join(' · ')})` : ''
  return `${statusPart}${d.message}${fieldPart}`
}
