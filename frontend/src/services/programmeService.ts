import { apiRequest, getApiErrorMessage } from './api'

export type AcademicProgramme = {
  id: number
  department: number
  programme_code: string
  programme_name: string
  duration_years: number
  description: string | null
  created_at: string
  updated_at: string
}

export type NewProgramme = {
  department: number
  programme_code: string
  programme_name: string
  duration_years: number
  description: string
}

export async function getProgrammes(): Promise<AcademicProgramme[]> {
  const response = await apiRequest('/programmes/')

  if (!response.ok) {
    throw new Error(await getApiErrorMessage(response))
  }

  return response.json() as Promise<AcademicProgramme[]>
}

export async function createProgramme(
  programmeData: NewProgramme,
): Promise<AcademicProgramme> {
  const response = await apiRequest('/programmes/', {
    method: 'POST',
    body: JSON.stringify(programmeData),
  })

  if (!response.ok) {
    throw new Error(await getApiErrorMessage(response))
  }

  return response.json() as Promise<AcademicProgramme>
}

export async function updateProgramme(
  id: number,
  programmeData: NewProgramme,
): Promise<AcademicProgramme> {
  const response = await apiRequest(`/programmes/${id}/`, {
    method: 'PUT',
    body: JSON.stringify(programmeData),
  })

  if (!response.ok) {
    throw new Error(await getApiErrorMessage(response))
  }

  return response.json() as Promise<AcademicProgramme>
}

export async function deleteProgramme(id: number): Promise<void> {
  const response = await apiRequest(`/programmes/${id}/`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    throw new Error(await getApiErrorMessage(response))
  }
}