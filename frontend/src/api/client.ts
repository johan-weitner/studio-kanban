import createClient from 'openapi-fetch'
import type { paths } from './schema.d.ts'

export const BASE_URL = '/api'

/** Typed openapi-fetch client — use for new code */
export const apiClient = createClient<paths>({ baseUrl: '' })

/** Legacy fetch helper used by existing hooks */
export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...init?.headers },
    credentials: 'include',
    ...init,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error((err as { error?: string }).error ?? 'Request failed')
  }
  if (res.status === 204 || res.headers.get('content-length') === '0') {
    return undefined as T
  }
  return res.json() as Promise<T>
}
