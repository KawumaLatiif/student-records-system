import { apiRequest, getApiErrorMessage } from './api'

export type Lecturer = {
  id: number
  lecturer_id: string
  first_name: string
  last_name: string
  email: string
  phone_number: string
  department: number
  designation: string
  date_joined: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export type NewLecturer = {
  lecturer_id: string
  first_name: string
  last_name: string
  email: string
  phone_number: string
  department: number
  designation: string
  date_joined: string
  is_active: boolean
}

export async function getLecturers(): Promise<Lecturer[]> {
  const response = await apiRequest('/lecturers/')

  if (!response.ok) {
    throw new Error(await getApiErrorMessage(response))
  }

  return response.json() as Promise<Lecturer[]>
}

export async function createLecturer(
  lecturerData: NewLecturer,
): Promise<Lecturer> {
  const response = await apiRequest('/lecturers/', {
    method: 'POST',
    body: JSON.stringify(lecturerData),
  })

  if (!response.ok) {
    throw new Error(await getApiErrorMessage(response))
  }

  return response.json() as Promise<Lecturer>
}

export async function updateLecturer(
  id: number,
  lecturerData: NewLecturer,
): Promise<Lecturer> {
  const response = await apiRequest(`/lecturers/${id}/`, {
    method: 'PUT',
    body: JSON.stringify(lecturerData),
  })

  if (!response.ok) {
    throw new Error(await getApiErrorMessage(response))
  }

  return response.json() as Promise<Lecturer>
}

export async function deleteLecturer(id: number): Promise<void> {
  const response = await apiRequest(`/lecturers/${id}/`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    throw new Error(await getApiErrorMessage(response))
  }
}