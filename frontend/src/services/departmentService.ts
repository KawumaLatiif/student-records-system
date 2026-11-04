
// Department record returned by Django
export type Department = {
  id: number
  department_code: string
  department_name: string
  description: string | null
  created_at: string
  updated_at: string
}

// Data required when creating or updating a department
export type NewDepartment = {
  department_code: string
  department_name: string
  description: string
}

const API_BASE_URL = 'http://127.0.0.1:8000/api'

// Retrieve all departments
export async function getDepartments(): Promise<Department[]> {
  const response = await fetch(`${API_BASE_URL}/departments/`, {
    headers: { Accept: 'application/json' },
    credentials: 'include',
  })

  if (!response.ok) {
    throw new Error(`Failed to retrieve departments: HTTP ${response.status}`)
  }

  return response.json() as Promise<Department[]>
}

// Create a new department
export async function createDepartment(
  departmentData: NewDepartment,
): Promise<Department> {
  const response = await fetch(`${API_BASE_URL}/departments/`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(departmentData),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(JSON.stringify(errorData))
  }

  return response.json() as Promise<Department>
}

// Update an existing department
export async function updateDepartment(
  id: number,
  departmentData: NewDepartment,
): Promise<Department> {
  const response = await fetch(`${API_BASE_URL}/departments/${id}/`, {
    method: 'PUT',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(departmentData),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(JSON.stringify(errorData))
  }

  return response.json() as Promise<Department>
}

// Delete a department
export async function deleteDepartment(id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/departments/${id}/`, {
    method: 'DELETE',
    credentials: 'include',
  })

  if (!response.ok) {
    let errorMessage = `Failed to delete department: HTTP ${response.status}`

    try {
      const errorData = await response.json()
      errorMessage = JSON.stringify(errorData)
    } catch {
      // Retain the HTTP error message if the response has no JSON body.
    }

    throw new Error(errorMessage)
  }
}
