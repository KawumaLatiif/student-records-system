import { apiRequest, getApiErrorMessage } from './api'

export type Student = {
  id: number
  student_id: string
  first_name: string
  last_name: string
  email: string
  phone_number: string
  date_of_birth: string
  gender: string
  address: string
  admission_date: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export type NewStudent = {
  student_id: string
  first_name: string
  last_name: string
  email: string
  phone_number: string
  date_of_birth: string
  gender: string
  address: string
  admission_date: string
  is_active: boolean
}

export async function getStudents(): Promise<Student[]> {
  const response = await apiRequest('/students/')

  if (!response.ok) {
    throw new Error(await getApiErrorMessage(response))
  }

  return response.json() as Promise<Student[]>
}

export async function getStudent(id: number): Promise<Student> {
  const response = await apiRequest(`/students/${id}/`)

  if (!response.ok) {
    throw new Error(await getApiErrorMessage(response))
  }

  return response.json() as Promise<Student>
}

export async function createStudent(
  studentData: NewStudent,
): Promise<Student> {
  const response = await apiRequest('/students/', {
    method: 'POST',
    body: JSON.stringify(studentData),
  })

  if (!response.ok) {
    throw new Error(await getApiErrorMessage(response))
  }

  return response.json() as Promise<Student>
}

export async function updateStudent(
  id: number,
  studentData: NewStudent,
): Promise<Student> {
  const response = await apiRequest(`/students/${id}/`, {
    method: 'PUT',
    body: JSON.stringify(studentData),
  })

  if (!response.ok) {
    throw new Error(await getApiErrorMessage(response))
  }

  return response.json() as Promise<Student>
}

export async function deleteStudent(id: number): Promise<void> {
  const response = await apiRequest(`/students/${id}/`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    throw new Error(await getApiErrorMessage(response))
  }
}