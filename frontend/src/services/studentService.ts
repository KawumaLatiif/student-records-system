
// Student API service

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

const API_BASE_URL = 'http://127.0.0.1:8000/api'

// Retrieve all student records
export async function getStudents(): Promise<Student[]> {
  const response = await fetch(`${API_BASE_URL}/students/`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
    credentials: 'include',
  })

  if (!response.ok) {
    throw new Error(`Failed to retrieve students: HTTP ${response.status}`)
  }

  return response.json() as Promise<Student[]>
}

export async function getStudent(id: number): Promise<Student> {
  const response = await fetch(`${API_BASE_URL}/students/${id}/`, {
    method: 'GET',
    headers: { Accept: 'application/json' },
    credentials: 'include',
  })

  if (!response.ok) {
    throw new Error(`Failed to retrieve student: HTTP ${response.status}`)
  }

  return response.json() as Promise<Student>
}


// Register a new student
export async function createStudent(
  studentData: NewStudent,
): Promise<Student> {
  const response = await fetch(`${API_BASE_URL}/students/`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(studentData),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(JSON.stringify(errorData))
  }

  return response.json() as Promise<Student>
}

// Update an existing student record
export async function updateStudent(
  id: number,
  studentData: NewStudent,
): Promise<Student> {
  const response = await fetch(`${API_BASE_URL}/students/${id}/`, {
    method: 'PUT',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(studentData),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(JSON.stringify(errorData))
  }

  return response.json() as Promise<Student>
}

// Delete an existing student record
export async function deleteStudent(id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/students/${id}/`, {
    method: 'DELETE',
    headers: {
      Accept: 'application/json',
    },
    credentials: 'include',
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(
      errorData.detail || 'Unable to delete student record.',
    )
  }
}
