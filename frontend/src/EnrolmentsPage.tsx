import { useEffect, useState } from 'react'
import {
  createEnrolment,
  getEnrolments,
  getProgrammes,
  getStudents,
  updateEnrolment,
  type AcademicProgramme,
  type Enrolment,
  type NewEnrolment,
  type Student,
} from './services/enrolmentService'

function getToday(): string {
  const today = new Date()
  const localDate = new Date(
    today.getTime() - today.getTimezoneOffset() * 60000,
  )
  return localDate.toISOString().slice(0, 10)
}

const emptyForm: NewEnrolment = {
  student: 0,
  programme: 0,
  academic_year: '2026/2027',
  semester: 1,
  year_of_study: 1,
  enrolment_date: getToday(),
  status: 'ACTIVE',
}

function EnrolmentsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [programmes, setProgrammes] = useState<AcademicProgramme[]>([])
  const [enrolments, setEnrolments] = useState<Enrolment[]>([])
  const [form, setForm] = useState<NewEnrolment>({ ...emptyForm })

  const [editingId, setEditingId] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    async function loadData() {
      try {
        const [studentData, programmeData, enrolmentData] =
          await Promise.all([
            getStudents(),
            getProgrammes(),
            getEnrolments(),
          ])

        setStudents(studentData)
        setProgrammes(programmeData)
        setEnrolments(enrolmentData)
      } catch (error) {
        console.error('Error loading enrolment data:', error)
        setError('Unable to load enrolment information. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  function handleChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) {
    const { name, value } = event.target

    setForm((previousForm) => ({
      ...previousForm,
      [name]:
        name === 'student' ||
        name === 'programme' ||
        name === 'semester' ||
        name === 'year_of_study'
          ? Number(value)
          : value,
    }))

    setError('')
    setSuccess('')
  }

  function getErrorMessage(error: unknown): string {
    if (!(error instanceof Error)) {
      return 'Something went wrong. Please try again.'
    }

    try {
      const details = JSON.parse(error.message)

      if (details.non_field_errors?.length) {
        return details.non_field_errors[0]
      }

      if (details.detail) {
        return details.detail
      }

      const firstFieldError = Object.values(details).find(
        (value) => Array.isArray(value) && value.length > 0,
      )

      if (Array.isArray(firstFieldError)) {
        return String(firstFieldError[0])
      }
    } catch {
      return error.message
    }

    return error.message
  }

  function handleEdit(enrolment: Enrolment) {
    setEditingId(enrolment.id)

    setForm({
      student: enrolment.student,
      programme: enrolment.programme,
      academic_year: enrolment.academic_year,
      semester: enrolment.semester,
      year_of_study: enrolment.year_of_study,
      enrolment_date: enrolment.enrolment_date,
      status: enrolment.status,
    })

    setError('')
    setSuccess('')

    // Bring the form into view.
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function cancelEdit() {
    setEditingId(null)
    setForm({ ...emptyForm, enrolment_date: getToday() })
    setError('')
    setSuccess('')
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (!form.student || !form.programme) {
      setError('Please select both a student and an academic programme.')
      return
    }

    // Exclude the record currently being edited from the duplicate check.
    const duplicate = enrolments.some(
        (item) =>
            item.id !== editingId &&
            item.student === form.student &&
            item.academic_year === form.academic_year,
    )
    if (duplicate) {
      setError(
        'This student is already enrolled in this programme for the selected academic year and semester.',
      )
      return
    }

    setIsSubmitting(true)

    try {
      if (editingId !== null) {
        const updatedEnrolment = await updateEnrolment(editingId, form)

        setEnrolments((previous) =>
          previous.map((item) =>
            item.id === editingId ? updatedEnrolment : item,
          ),
        )

        setSuccess('Enrolment updated successfully!')
        setEditingId(null)
      } else {
        const newEnrolment = await createEnrolment(form)

        setEnrolments((previous) => [...previous, newEnrolment])
        setSuccess('Student enrolment created successfully!')
      }

      setForm({ ...emptyForm, enrolment_date: getToday() })
    } catch (error) {
      console.error('Error saving enrolment:', error)
      setError(getErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  function studentName(studentId: number) {
    const student = students.find((item) => item.id === studentId)

    return student
      ? `${student.first_name} ${student.last_name} (${student.student_id})`
      : `Student #${studentId}`
  }

  function programmeName(programmeId: number) {
    const programme = programmes.find((item) => item.id === programmeId)

    return programme
      ? `${programme.programme_name} (${programme.programme_code})`
      : `Programme #${programmeId}`
  }

  function formatDate(date: string) {
    if (!date) return '—'
    return new Date(`${date}T00:00:00`).toLocaleDateString()
  }

  if (isLoading) {
    return (
      <section className="records-section">
        Loading enrolment records...
      </section>
    )
  }

  return (
    <section className="records-section page-placeholder">
      <div className="section-header">
        <div>
          <h2>Student Enrolments</h2>
          <p>Register students into academic programmes</p>
        </div>
        <span>{enrolments.length} enrolments</span>
      </div>

      <form className="student-form" onSubmit={handleSubmit}>
        <h3>
          {editingId !== null ? 'Edit Enrolment' : 'Create New Enrolment'}
        </h3>

        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}

        {success && (
          <p className="success-message" role="status">
            {success}
          </p>
        )}

        <div className="student-form-grid">
          <label>
            Select Student *
            <select
              name="student"
              value={form.student}
              onChange={handleChange}
              required
            >
              <option value={0}>Choose a student</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.student_id} - {student.first_name}{' '}
                  {student.last_name}
                </option>
              ))}
            </select>
          </label>

          <label>
            Academic Programme *
            <select
              name="programme"
              value={form.programme}
              onChange={handleChange}
              required
            >
              <option value={0}>Choose a programme</option>
              {programmes.map((programme) => (
                <option key={programme.id} value={programme.id}>
                  {programme.programme_code} - {programme.programme_name}
                </option>
              ))}
            </select>
          </label>

          <label>
            Academic Year *
            <input
              name="academic_year"
              value={form.academic_year}
              onChange={handleChange}
              placeholder="e.g. 2026/2027"
              pattern="[0-9]{4}/[0-9]{4}"
              required
            />
          </label>

          <label>
            Semester *
            <select
              name="semester"
              value={form.semester}
              onChange={handleChange}
              required
            >
              <option value={1}>Semester 1</option>
              <option value={2}>Semester 2</option>
              <option value={3}>Semester 3</option>
            </select>
          </label>

          <label>
            Year of Study *
            <select
              name="year_of_study"
              value={form.year_of_study}
              onChange={handleChange}
              required
            >
              {[1, 2, 3, 4, 5, 6].map((year) => (
                <option key={year} value={year}>
                  Year {year}
                </option>
              ))}
            </select>
          </label>

          <label>
            Enrolment Date *
            <input
              type="date"
              name="enrolment_date"
              value={form.enrolment_date}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Enrolment Status
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
            >
              <option value="ACTIVE">Active</option>
              <option value="COMPLETED">Completed</option>
              <option value="SUSPENDED">Suspended</option>
              <option value="WITHDRAWN">Withdrawn</option>
            </select>
          </label>
        </div>

        <div className="form-actions">
          <button
            type="submit"
            className="primary-button"
            disabled={
              isSubmitting ||
              students.length === 0 ||
              programmes.length === 0
            }
          >
            {isSubmitting
              ? 'Saving...'
              : editingId !== null
                ? 'Save Changes'
                : 'Create Enrolment'}
          </button>

          {editingId !== null && (
            <button
              type="button"
              className="cancel-button"
              onClick={cancelEdit}
              disabled={isSubmitting}
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="section-header">
        <div>
          <h2>Enrolment Records</h2>
          <p>All registered student enrolments</p>
        </div>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Student</th>
              <th>Programme</th>
              <th>Academic Year</th>
              <th>Semester</th>
              <th>Year of Study</th>
              <th>Enrolment Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {enrolments.map((enrolment) => (
              <tr key={enrolment.id}>
                <td>{studentName(enrolment.student)}</td>
                <td>{programmeName(enrolment.programme)}</td>
                <td>{enrolment.academic_year}</td>
                <td>{enrolment.semester}</td>
                <td>{enrolment.year_of_study}</td>
                <td>{formatDate(enrolment.enrolment_date)}</td>
                <td>
                  <span
                    className={`status-pill status-${enrolment.status.toLowerCase()}`}
                  >
                    {enrolment.status.charAt(0) +
                      enrolment.status.slice(1).toLowerCase()}
                  </span>
                </td>
                <td>
                  <button
                    type="button"
                    className="edit-button"
                    onClick={() => handleEdit(enrolment)}
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}

            {enrolments.length === 0 && (
              <tr>
                <td colSpan={8} className="empty-state">
                  No enrolment records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default EnrolmentsPage