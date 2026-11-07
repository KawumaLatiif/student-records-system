import { apiRequest, getApiErrorMessage } from './api'
import { getStudents } from './studentService'
import type { Student } from './studentService'

export type AcademicProgramme = {
  id: number
  department: number
  programme_code: string
  programme_name: string
  duration_years: number
  description: string | null
}

export type Enrolment = {
  id: number
  student: number
  programme: number
  academic_year: string
  semester: number
  year_of_study: number
  enrolment_date: string
  status: 'ACTIVE' | 'COMPLETED' | 'SUSPENDED' | 'WITHDRAWN'
  created_at: string
  updated_at: string
}

export type NewEnrolment = {
  student: number
  programme: number
  academic_year: string
  semester: number
  year_of_study: number
  enrolment_date: string
  status: 'ACTIVE' | 'COMPLETED' | 'SUSPENDED' | 'WITHDRAWN'
}

export { getStudents }
export type { Student }

export async function getProgrammes(): Promise<AcademicProgramme[]> {
  const response = await apiRequest('/programmes/')

  if (!response.ok) {
    throw new Error(await getApiErrorMessage(response))
  }

  return response.json() as Promise<AcademicProgramme[]>
}

export async function getEnrolments(
  studentId?: number,
): Promise<Enrolment[]> {
  const url = studentId
    ? `/enrolments/?student=${studentId}`
    : '/enrolments/'

  const response = await apiRequest(url)

  if (!response.ok) {
    throw new Error(await getApiErrorMessage(response))
  }

  return response.json() as Promise<Enrolment[]>
}

export async function createEnrolment(
  enrolmentData: NewEnrolment,
): Promise<Enrolment> {
  const response = await apiRequest('/enrolments/', {
    method: 'POST',
    body: JSON.stringify(enrolmentData),
  })

  if (!response.ok) {
    throw new Error(await getApiErrorMessage(response))
  }

  return response.json() as Promise<Enrolment>
}

export async function updateEnrolment(
  id: number,
  enrolmentData: NewEnrolment,
): Promise<Enrolment> {
  const response = await apiRequest(`/enrolments/${id}/`, {
    method: 'PUT',
    body: JSON.stringify(enrolmentData),
  })

  if (!response.ok) {
    throw new Error(await getApiErrorMessage(response))
  }

  return response.json() as Promise<Enrolment>
}

export async function deleteEnrolment(id: number): Promise<void> {
  const response = await apiRequest(`/enrolments/${id}/`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    throw new Error(await getApiErrorMessage(response))
  }
}