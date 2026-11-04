
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

export async function getLecturers(): Promise<Lecturer[]> {
  const response = await fetch(`${API_BASE_URL}/lecturers/`)

  if (!response.ok) {
    throw new Error(await getErrorMessage(response))
  }

  return response.json() as Promise<Lecturer[]>
}

export async function createLecturer(
  lecturerData: NewLecturer,
): Promise<Lecturer> {
  const response = await fetch(`${API_BASE_URL}/lecturers/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(lecturerData),
  })

  if (!response.ok) {
    throw new Error(await getErrorMessage(response))
  }

  return response.json() as Promise<Lecturer>
}

export async function updateLecturer(
  id: number,
  lecturerData: NewLecturer,
): Promise<Lecturer> {
  const response = await fetch(`${API_BASE_URL}/lecturers/${id}/`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(lecturerData),
  })

  if (!response.ok) {
    throw new Error(await getErrorMessage(response))
  }

  return response.json() as Promise<Lecturer>
}

export async function deleteLecturer(id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/lecturers/${id}/`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    throw new Error(await getErrorMessage(response))
  }
}
