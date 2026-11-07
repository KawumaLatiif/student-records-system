export const API_BASE_URL = 'http://127.0.0.1:8000/api'

const TOKEN_KEY = 'student_records_token'

// Retrieve the saved authentication token
export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

// Save the authentication token
export function setAuthToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

// Remove the authentication token
export function clearAuthToken(): void {
  localStorage.removeItem(TOKEN_KEY)
}

// Send requests to Django with authentication when available
export async function apiRequest(
  path: string,
  options: RequestInit = {},
  requiresAuth = true,
): Promise<Response> {
  const headers = new Headers(options.headers)

  headers.set('Accept', 'application/json')

  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  const token = getAuthToken()

  if (requiresAuth && token) {
    headers.set('Authorization', `Token ${token}`)
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  })

  if (response.status === 401) {
    clearAuthToken()
  }

  return response
}

// Convert Django validation errors into readable messages
export async function getApiErrorMessage(
  response: Response,
): Promise<string> {
  const data = await response.json().catch(() => null)

  if (data && typeof data === 'object') {
    if ('detail' in data) {
      return String(data.detail)
    }

    return Object.entries(data)
      .map(([field, message]) => {
        const detail = Array.isArray(message)
          ? message.join(', ')
          : String(message)

        return `${field}: ${detail}`
      })
      .join('\n')
  }

  return `Request failed with status ${response.status}.`
}