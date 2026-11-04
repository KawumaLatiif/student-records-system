
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

const API_BASE_URL = 'http://127.0.0.1:8000/api'

async function getErrorMessage(response: Response): Promise<string> {
  const data = await response.json().catch(() => null)

  if (data && typeof data === 'object') {
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

export async function getProgrammes(): Promise<AcademicProgramme[]> {
  const response = await fetch(`${API_BASE_URL}/programmes/`)

  if (!response.ok) {
    throw new Error(await getErrorMessage(response))
  }

  return response.json() as Promise<AcademicProgramme[]>
}

export async function createProgramme(
  programmeData: NewProgramme,
): Promise<AcademicProgramme> {
  const response = await fetch(`${API_BASE_URL}/programmes/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(programmeData),
  })

  if (!response.ok) {
    throw new Error(await getErrorMessage(response))
  }

  return response.json() as Promise<AcademicProgramme>
}

export async function updateProgramme(
  id: number,
  programmeData: NewProgramme,
): Promise<AcademicProgramme> {
  const response = await fetch(`${API_BASE_URL}/programmes/${id}/`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(programmeData),
  })

  if (!response.ok) {
    throw new Error(await getErrorMessage(response))
  }

  return response.json() as Promise<AcademicProgramme>
}

export async function deleteProgramme(id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/programmes/${id}/`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    throw new Error(await getErrorMessage(response))
  }
}
