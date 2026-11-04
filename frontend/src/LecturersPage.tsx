
import { useEffect, useState } from 'react'
import {
  createLecturer,
  deleteLecturer,
  getLecturers,
  updateLecturer,
  type Lecturer,
  type NewLecturer,
} from './services/lecturerService'
import {
  getDepartments,
  type Department,
} from './services/departmentService'

const emptyForm: NewLecturer = {
  lecturer_id: '',
  first_name: '',
  last_name: '',
  email: '',
  phone_number: '',
  department: 0,
  designation: '',
  date_joined: '',
  is_active: true,
}

function LecturersPage() {
  const [lecturers, setLecturers] = useState<Lecturer[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [form, setForm] = useState<NewLecturer>(emptyForm)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [formError, setFormError] = useState('')

  async function loadData() {
    setLoading(true)
    setError('')

    try {
      const [lecturerData, departmentData] = await Promise.all([
        getLecturers(),
        getDepartments(),
      ])

      setLecturers(lecturerData)
      setDepartments(departmentData)
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Unable to load lecturer records.',
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadData()
  }, [])

  const filteredLecturers = lecturers.filter((lecturer) => {
    const search = searchTerm.toLowerCase()
    const fullName =
      `${lecturer.first_name} ${lecturer.last_name}`.toLowerCase()

    return (
      fullName.includes(search) ||
      lecturer.lecturer_id.toLowerCase().includes(search) ||
      lecturer.email.toLowerCase().includes(search) ||
      lecturer.designation.toLowerCase().includes(search)
    )
  })

  function handleFormChange(
    event: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement
    >,
  ) {
    const { name, value, type } = event.target

    setForm((previous) => ({
      ...previous,
      [name]:
        type === 'checkbox'
          ? (event.target as HTMLInputElement).checked
          : name === 'department'
            ? Number(value)
            : value,
    }))
  }

  function handleAddNew() {
    setForm(emptyForm)
    setEditingId(null)
    setFormError('')
    setShowForm(true)
  }

  function handleEdit(lecturer: Lecturer) {
    setForm({
      lecturer_id: lecturer.lecturer_id,
      first_name: lecturer.first_name,
      last_name: lecturer.last_name,
      email: lecturer.email,
      phone_number: lecturer.phone_number,
      department: lecturer.department,
      designation: lecturer.designation,
      date_joined: lecturer.date_joined,
      is_active: lecturer.is_active,
    })

    setEditingId(lecturer.id)
    setFormError('')
    setShowForm(true)
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)
    setFormError('')

    try {
      if (editingId !== null) {
        const updated = await updateLecturer(editingId, form)

        setLecturers((previous) =>
          previous.map((item) =>
            item.id === editingId ? updated : item,
          ),
        )

        alert('Lecturer updated successfully!')
      } else {
        const created = await createLecturer(form)

        setLecturers((previous) => [...previous, created])
        alert('Lecturer registered successfully!')
      }

      setForm(emptyForm)
      setEditingId(null)
      setShowForm(false)
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : 'Unable to save lecturer record.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(lecturer: Lecturer) {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${lecturer.first_name} ${lecturer.last_name}?`,
    )

    if (!confirmed) return

    try {
      await deleteLecturer(lecturer.id)

      setLecturers((previous) =>
        previous.filter((item) => item.id !== lecturer.id),
      )

      if (editingId === lecturer.id) {
        setForm(emptyForm)
        setEditingId(null)
        setShowForm(false)
      }

      alert('Lecturer deleted successfully!')
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : 'Unable to delete lecturer.',
      )
    }
  }

  function getDepartmentName(departmentId: number) {
    return (
      departments.find((department) => department.id === departmentId)
        ?.department_name ?? 'Unknown department'
    )
  }

  return (
    <section className="records-section page-placeholder">
      <div className="section-header">
        <div>
          <h2>Lecturer Records</h2>
          <p>Manage lecturers and their departmental assignments</p>
        </div>

        <button
          className="primary-button"
          onClick={() => {
            if (showForm) {
              setShowForm(false)
              setForm(emptyForm)
              setEditingId(null)
              setFormError('')
            } else {
              handleAddNew()
            }
          }}
        >
          {showForm ? 'Cancel' : '+ Add Lecturer'}
        </button>
      </div>

      {showForm && (
        <form className="student-form" onSubmit={handleSubmit}>
          <h3>
            {editingId !== null
              ? 'Edit Lecturer Details'
              : 'Register New Lecturer'}
          </h3>

          {formError && (
            <p className="form-error" role="alert">
              {formError}
            </p>
          )}

          <div className="student-form-grid">
            <label>
              Lecturer ID *
              <input
                name="lecturer_id"
                value={form.lecturer_id}
                onChange={handleFormChange}
                placeholder="e.g. LEC2026001"
                required
              />
            </label>

            <label>
              First Name *
              <input
                name="first_name"
                value={form.first_name}
                onChange={handleFormChange}
                required
              />
            </label>

            <label>
              Last Name *
              <input
                name="last_name"
                value={form.last_name}
                onChange={handleFormChange}
                required
              />
            </label>

            <label>
              Email Address *
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleFormChange}
                required
              />
            </label>

            <label>
              Phone Number
              <input
                name="phone_number"
                value={form.phone_number}
                onChange={handleFormChange}
              />
            </label>

            <label>
              Department *
              <select
                name="department"
                value={form.department}
                onChange={handleFormChange}
                required
              >
                <option value={0} disabled>
                  Select department
                </option>

                {departments.map((department) => (
                  <option key={department.id} value={department.id}>
                    {department.department_name}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Designation *
              <input
                name="designation"
                value={form.designation}
                onChange={handleFormChange}
                placeholder="e.g. Lecturer"
                required
              />
            </label>

            <label>
              Date Joined *
              <input
                type="date"
                name="date_joined"
                value={form.date_joined}
                onChange={handleFormChange}
                required
              />
            </label>

            <label className="checkbox-label">
              <input
                type="checkbox"
                name="is_active"
                checked={form.is_active}
                onChange={handleFormChange}
              />
              Active Lecturer
            </label>
          </div>

          <button
            type="submit"
            className="primary-button"
            disabled={submitting || departments.length === 0}
          >
            {submitting
              ? 'Saving...'
              : editingId !== null
                ? 'Save Changes'
                : 'Register Lecturer'}
          </button>

          {departments.length === 0 && (
            <p className="form-error">
              Register a department before adding a lecturer.
            </p>
          )}
        </form>
      )}

      <div className="table-toolbar">
        <input
          type="search"
          placeholder="Search lecturers..."
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
        />

        <span>
          {loading
            ? 'Loading...'
            : `${filteredLecturers.length} records found`}
        </span>
      </div>

      {loading ? (
        <p>Loading lecturer records...</p>
      ) : error ? (
        <p className="form-error">{error}</p>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Lecturer ID</th>
                <th>Lecturer Name</th>
                <th>Email</th>
                <th>Department</th>
                <th>Designation</th>
                <th>Date Joined</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredLecturers.map((lecturer) => (
                <tr key={lecturer.id}>
                  <td>{lecturer.lecturer_id}</td>
                  <td>
                    {lecturer.first_name} {lecturer.last_name}
                  </td>
                  <td>{lecturer.email}</td>
                  <td>{getDepartmentName(lecturer.department)}</td>
                  <td>{lecturer.designation}</td>
                  <td>{lecturer.date_joined}</td>
                  <td>
                    <span
                      className={`status ${
                        lecturer.is_active
                          ? 'status-active'
                          : 'status-inactive'
                      }`}
                    >
                      {lecturer.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="edit-button"
                        onClick={() => handleEdit(lecturer)}
                      >
                        Edit
                      </button>

                      <button
                        className="delete-button"
                        onClick={() => handleDelete(lecturer)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredLecturers.length === 0 && (
                <tr>
                  <td colSpan={8} className="empty-state">
                    No lecturers found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

export default LecturersPage
