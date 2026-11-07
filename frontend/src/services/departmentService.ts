import { apiRequest, getApiErrorMessage } from './api'

export type Department = {
  id: number
  department_code: string
  department_name: string
  description: string | null
  created_at: string
  updated_at: string
}

export type NewDepartment = {
  department_code: string
  department_name: string
  description: string
}

export async function getDepartments(): Promise<Department[]> {
  const response = await apiRequest('/departments/')

  if (!response.ok) {
    throw new Error(await getApiErrorMessage(response))
  }

  return response.json() as Promise<Department[]>
}

export async function createDepartment(
  departmentData: NewDepartment,
): Promise<Department> {
  const response = await apiRequest('/departments/', {
    method: 'POST',
    body: JSON.stringify(departmentData),
  })

  if (!response.ok) {
    throw new Error(await getApiErrorMessage(response))
  }

  return response.json() as Promise<Department>
}

export async function updateDepartment(
  id: number,
  departmentData: NewDepartment,
): Promise<Department> {
  const response = await apiRequest(`/departments/${id}/`, {
    method: 'PUT',
    body: JSON.stringify(departmentData),
  })

  if (!response.ok) {
    throw new Error(await getApiErrorMessage(response))
  }

  return response.json() as Promise<Department>
}

export async function deleteDepartment(id: number): Promise<void> {
  const response = await apiRequest(`/departments/${id}/`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    throw new Error(await getApiErrorMessage(response))
  }
}