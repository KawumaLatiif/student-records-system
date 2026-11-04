
import { useEffect, useState } from 'react'
import {
  createProgramme,
  deleteProgramme,
  getProgrammes,
  updateProgramme,
  type AcademicProgramme,
  type NewProgramme,
} from './services/programmeService'
import {
  getDepartments,
  type Department,
} from './services/departmentService'

const emptyForm: NewProgramme = {
  department: 0,
  programme_code: '',
  programme_name: '',
  duration_years: 4,
  description: '',
}

function ProgrammesPage() {
  const [programmes, setProgrammes] = useState<AcademicProgramme[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [form, setForm] = useState<NewProgramme>(emptyForm)
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
      const [programmeData, departmentData] = await Promise.all([
        getProgrammes(),
        getDepartments(),
      ])

      setProgrammes(programmeData)
      setDepartments(departmentData)
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Unable to load academic programmes.',
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadData()
  }, [])

  const filteredProgrammes = programmes.filter((programme) => {
    const search = searchTerm.toLowerCase()

    return (
      programme.programme_code.toLowerCase().includes(search) ||
      programme.programme_name.toLowerCase().includes(search)
    )
  })

  function handleFormChange(
    event: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) {
    const { name, value } = event.target

    setForm((previous) => ({
      ...previous,
      [name]:
        name === 'department' || name === 'duration_years'
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

  function handleEdit(programme: AcademicProgramme) {
    setForm({
      department: programme.department,
      programme_code: programme.programme_code,
      programme_name: programme.programme_name,
      duration_years: programme.duration_years,
      description: programme.description ?? '',
    })

    setEditingId(programme.id)
    setFormError('')
    setShowForm(true)
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)
    setFormError('')

    try {
      if (editingId !== null) {
        const updated = await updateProgramme(editingId, form)

        setProgrammes((previous) =>
          previous.map((item) =>
            item.id === editingId ? updated : item,
          ),
        )

        alert('Programme updated successfully!')
      } else {
        const created = await createProgramme(form)

        setProgrammes((previous) => [...previous, created])
        alert('Programme registered successfully!')
      }

      setForm(emptyForm)
      setEditingId(null)
      setShowForm(false)
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : 'Unable to save programme.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(programme: AcademicProgramme) {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${programme.programme_name}?`,
    )

    if (!confirmed) return

    try {
      await deleteProgramme(programme.id)

      setProgrammes((previous) =>
        previous.filter((item) => item.id !== programme.id),
      )

      alert('Programme deleted successfully!')
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : 'Unable to delete programme.',
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
          <h2>Academic Programmes</h2>
          <p>Manage programmes offered by academic departments</p>
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
          {showForm ? 'Cancel' : '+ Add Programme'}
        </button>
      </div>

      {showForm && (
        <form className="student-form" onSubmit={handleSubmit}>
          <h3>
            {editingId !== null
              ? 'Edit Academic Programme'
              : 'Register Academic Programme'}
          </h3>

          {formError && (
            <p className="form-error" role="alert">
              {formError}
            </p>
          )}

          <div className="student-form-grid">
            <label>
              Programme Code *
              <input
                name="programme_code"
                value={form.programme_code}
                onChange={handleFormChange}
                placeholder="e.g. BENG-ECE"
                required
              />
            </label>

            <label>
              Programme Name *
              <input
                name="programme_name"
                value={form.programme_name}
                onChange={handleFormChange}
                placeholder="e.g. Bachelor of Engineering"
                required
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
              Duration (Years) *
              <input
                type="number"
                name="duration_years"
                min="1"
                max="10"
                value={form.duration_years}
                onChange={handleFormChange}
                required
              />
            </label>

            <label className="full-width">
              Description
              <textarea
                name="description"
                value={form.description}
                onChange={handleFormChange}
                rows={3}
                placeholder="Enter programme description"
              />
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
                : 'Register Programme'}
          </button>

          {departments.length === 0 && (
            <p className="form-error">
              Register a department before adding an academic programme.
            </p>
          )}
        </form>
      )}

      <div className="table-toolbar">
        <input
          type="search"
          placeholder="Search programmes..."
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
        />

        <span>
          {loading
            ? 'Loading...'
            : `${filteredProgrammes.length} records found`}
        </span>
      </div>

      {loading ? (
        <p>Loading academic programmes...</p>
      ) : error ? (
        <p className="form-error">{error}</p>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Programme Code</th>
                <th>Programme Name</th>
                <th>Department</th>
                <th>Duration</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredProgrammes.map((programme) => (
                <tr key={programme.id}>
                  <td>{programme.programme_code}</td>
                  <td>{programme.programme_name}</td>
                  <td>{getDepartmentName(programme.department)}</td>
                  <td>{programme.duration_years} years</td>
                  <td>{programme.description || '—'}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="edit-button"
                        onClick={() => handleEdit(programme)}
                      >
                        Edit
                      </button>

                      <button
                        className="delete-button"
                        onClick={() => handleDelete(programme)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredProgrammes.length === 0 && (
                <tr>
                  <td colSpan={6} className="empty-state">
                    No academic programmes found.
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

export default ProgrammesPage
