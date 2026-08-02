/**
 * api.js — Thin fetch wrapper for the Stratify Express backend.
 *
 * All methods:
 *  - Automatically attach the JWT Bearer token from localStorage.
 *  - Throw the parsed JSON error body on non-2xx responses so callers
 *    can catch { message } without extra parsing.
 *
 * Usage:
 *   import { api } from '../lib/api'
 *   const { data } = await api.get('/goals?sheet_id=xxx')
 *   await api.post('/auth/login', { email, password })
 */

const BASE_URL = import.meta.env.VITE_API_URL

const getToken = () => localStorage.getItem('stratify_token')

const headers = () => ({
  'Authorization': `Bearer ${getToken()}`,
  'Content-Type': 'application/json',
})

export const api = {
  get: async (path) => {
    const res = await fetch(`${BASE_URL}${path}`, { headers: headers() })
    if (!res.ok) throw await res.json()
    return res.json()
  },

  post: async (path, body) => {
    const res = await fetch(`${BASE_URL}${path}`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(body),
    })
    if (!res.ok) throw await res.json()
    return res.json()
  },

  patch: async (path, body) => {
    const res = await fetch(`${BASE_URL}${path}`, {
      method: 'PATCH',
      headers: headers(),
      body: JSON.stringify(body),
    })
    if (!res.ok) throw await res.json()
    return res.json()
  },

  delete: async (path) => {
    const res = await fetch(`${BASE_URL}${path}`, {
      method: 'DELETE',
      headers: headers(),
    })
    if (!res.ok) throw await res.json()
    return res.json()
  },
}
