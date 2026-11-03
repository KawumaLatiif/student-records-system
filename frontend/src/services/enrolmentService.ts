import { getStudents } from './studentService'
import type { Student } from './studentService'

// Academic programme returned by Django
export type AcademicProgramme = {
  id: number
  department: number
  programme_code: string
  programme_name: string
  duration_years: number
  description: string | null
}

// Existing enrolment returned by Django
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

// Data required when creating or updating an enrolment
export type NewEnrolment = {
  student: number
  programme: number
  academic_year: string
  semester: number
  year_of_study: number
  enrolment_date: string
  status: 'ACTIVE' | 'COMPLETED' | 'SUSPENDED' | 'WITHDRAWN'
}

const API_BASE_URL = 'http://127.0.0.1:8000/api'

export { getStudents }
export type { Student }

export async function getProgrammes(): Promise<AcademicProgramme[]> {
  const response = await fetch(`${API_BASE_URL}/programmes/`, {
    headers: { Accept: 'application/json' },
    credentials: 'include',
  })

  if (!response.ok) {
    throw new Error(`Failed to retrieve programmes: HTTP ${response.status}`)
  }

  return response.json() as Promise<AcademicProgramme[]>
}

export async function getEnrolments(): Promise<Enrolment[]> {
  const response = await fetch(`${API_BASE_URL}/enrolments/`, {
    headers: { Accept: 'application/json' },
    credentials: 'include',
  })

  if (!response.ok) {
    throw new Error(`Failed to retrieve enrolments: HTTP ${response.status}`)
  }

  return response.json() as Promise<Enrolment[]>
}

export async function createEnrolment(
  enrolmentData: NewEnrolment,
): Promise<Enrolment> {
  const response = await fetch(`${API_BASE_URL}/enrolments/`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(enrolmentData),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(JSON.stringify(errorData))
  }

  return response.json() as Promise<Enrolment>
}

export async function updateEnrolment(
  id: number,
  enrolmentData: NewEnrolment,
): Promise<Enrolment> {
  const response = await fetch(`${API_BASE_URL}/enrolments/${id}/`, {
    method: 'PUT',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(enrolmentData),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(JSON.stringify(errorData))
  }

  return response.json() as Promise<Enrolment>
}