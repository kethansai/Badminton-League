import { ref } from 'vue'

export const adminUser = ref(null)
let csrfToken = ''

export class ApiError extends Error {
  constructor(message, status = 0, issues = []) {
    super(message)
    this.status = status
    this.issues = issues
  }
}

const apiBaseUrl = import.meta.env.VITE_API_URL || ''

export async function apiRequest(path, { method = 'GET', body } = {}) {
  const multipart = body instanceof FormData
  const headers = {}
  if (body && !multipart) headers['Content-Type'] = 'application/json'
  if (method !== 'GET' && csrfToken) headers['X-CSRF-Token'] = csrfToken
  let response
  try {
    response = await fetch(`${apiBaseUrl}/api${path}`, {
      method, headers, credentials: 'include',
      body: body ? multipart ? body : JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(20000),
    })
  } catch {
    throw new ApiError('Cannot reach the server. Check your connection and try again.')
  }
  if (response.status === 204) return null
  let result
  try {
    result = await response.json()
  } catch {
    throw new ApiError('The server returned an unexpected response. Please try again.', response.status)
  }
  if (!response.ok) throw new ApiError(result.error || 'The request failed.', response.status, result.issues || [])
  return result
}

function acceptSession(result) {
  adminUser.value = { username: result.username }
  csrfToken = result.csrfToken
  return adminUser.value
}

export function clearSession() {
  adminUser.value = null
  csrfToken = ''
}

export async function checkSession() {
  try {
    return acceptSession(await apiRequest('/admin/session'))
  } catch (error) {
    clearSession()
    if (error.status === 401) return null
    throw error
  }
}

export async function signIn(username, password) {
  return acceptSession(await apiRequest('/admin/login', { method: 'POST', body: { username, password } }))
}

export async function signOut() {
  await apiRequest('/admin/logout', { method: 'POST' })
  clearSession()
}

export async function uploadImage(file) {
  const body = new FormData()
  body.append('image', file)
  return (await apiRequest('/admin/images', { method: 'POST', body })).url
}