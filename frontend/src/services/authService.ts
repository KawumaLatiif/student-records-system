import {
  apiRequest,
  getApiErrorMessage,
  setAuthToken,
  clearAuthToken,
} from './api'

export type User = {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  is_staff: boolean
  is_superuser: boolean
}

type LoginResponse = {
  token: string
  user: User
}

// Authenticate a user
export async function login(
  username: string,
  password: string,
): Promise<User> {
  const response = await apiRequest(
    '/accounts/login/',
    {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    },
    false,
  )

  if (!response.ok) {
    throw new Error(await getApiErrorMessage(response))
  }

  const data = (await response.json()) as LoginResponse

  setAuthToken(data.token)

  return data.user
}

// Retrieve the authenticated user's details
export async function getCurrentUser(): Promise<User> {
  const response = await apiRequest('/accounts/me/')

  if (!response.ok) {
    throw new Error(await getApiErrorMessage(response))
  }

  return response.json() as Promise<User>
}

// Log out the current user
export async function logout(): Promise<void> {
  try {
    const response = await apiRequest('/accounts/logout/', {
      method: 'POST',
    })

    if (!response.ok) {
      throw new Error(await getApiErrorMessage(response))
    }
  } finally {
    clearAuthToken()
  }
}