
import { useEffect, useState } from 'react'

import {
  createDepartment,
  deleteDepartment,
  getDepartments,
  updateDepartment,
  type Department,
  type NewDepartment,
} from './services/departmentService'

const emptyDepartmentForm: NewDepartment = {
  department_code: '',
  department_name: '',
  description: '',
}

function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([])
  const [departmentForm, setDepartmentForm] =
    useState<NewDepartment>(emptyDepartmentForm)

  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [error, setError] = useState('')
  const [formError, setFormError] = useState('')

  // Retrieve departments from Django
  async function loadDepartments() {
    try {
      setIsLoading(true)
      const data = await getDepartments()
      setDepartments(data)
      setError('')
    } catch (error) {
      console.error('Error retrieving departments:', error)
      setError('Unable to load departments. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadDepartments()
  }, [])

  // Search departments by code or name
  const filteredDepartments = departments.filter((department) => {
    const search = searchTerm.toLowerCase()

    return (
      department.department_code.toLowerCase().includes(search) ||
      department.department_name.toLowerCase().includes(search)
    )
  })

  // Update form fields
  function handleFormChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    const { name, value } = event.target

    setDepartmentForm((previousForm) => ({
      ...previousForm,
      [name]: value,
    }))
  }

  // Open the form for creating a department
  function handleAddNew() {
    setDepartmentForm(emptyDepartmentForm)
    setEditingId(null)
    setFormError('')
    setShowForm(true)
  }

  // Load department details for editing
  function handleEdit(department: Department) {
    setDepartmentForm({
      department_code: department.department_code,
      department_name: department.department_name,
      description: department.description || '',
    })

    setEditingId(department.id)
    setFormError('')
    setShowForm(true)
  }

  // Create or update a department
  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)
    setFormError('')

    try {
      if (editingId !== null) {
        const updatedDepartment = await updateDepartment(
          editingId,
          departmentForm,
        )

        setDepartments((previousDepartments) =>
          previousDepartments.map((department) =>
            department.id === editingId
              ? updatedDepartment
              : department,
          ),
        )

        alert('Department updated successfully!')
      } else {
        const newDepartment = await createDepartment(departmentForm)

        setDepartments((previousDepartments) => [
          ...previousDepartments,
          newDepartment,
        ])

        alert('Department registered successfully!')
      }

      setDepartmentForm(emptyDepartmentForm)
      setEditingId(null)
      setShowForm(false)
    } catch (error) {
      console.error('Error saving department:', error)

      setFormError(
        error instanceof Error
          ? error.message
          : 'Unable to save department.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  // Delete a department after confirmation
  async function handleDelete(department: Department) {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${department.department_name}?`,
    )

    if (!confirmed) return

    try {
      await deleteDepartment(department.id)

      setDepartments((previousDepartments) =>
        previousDepartments.filter(
          (item) => item.id !== department.id,
        ),
      )

      alert('Department deleted successfully!')
    } catch (error) {
      console.error('Error deleting department:', error)

      alert(
        error instanceof Error
          ? error.message
          : 'Unable to delete department.',
      )
    }
  }

  return (
    <section className="records-section page-placeholder">
      <div className="section-header">
        <div>
          <h2>Department Management</h2>
          <p>Manage your institution's academic departments</p>
        </div>

        <button
          className="primary-button"
          onClick={showForm ? () => {
            setShowForm(false)
            setDepartmentForm(emptyDepartmentForm)
            setEditingId(null)
            setFormError('')
          } : handleAddNew}
        >
          {showForm ? 'Cancel' : '+ Add Department'}
        </button>
      </div>

      {showForm && (
        <form className="student-form" onSubmit={handleSubmit}>
          <h3>
            {editingId !== null
              ? 'Edit Department'
              : 'Register New Department'}
          </h3>

          {formError && (
            <p className="form-error" role="alert">
              {formError}
            </p>
          )}

          <div className="student-form-grid">
            <label>
              Department Code *
              <input
                name="department_code"
                value={departmentForm.department_code}
                onChange={handleFormChange}
                placeholder="e.g. EEE"
                required
              />
            </label>

            <label>
              Department Name *
              <input
                name="department_name"
                value={departmentForm.department_name}
                onChange={handleFormChange}
                placeholder="e.g. Electrical Engineering"
                required
              />
            </label>

            <label className="full-width">
              Description
              <textarea
                name="description"
                value={departmentForm.description}
                onChange={handleFormChange}
                placeholder="Enter department description"
                rows={3}
              />
            </label>
          </div>

          <button
            type="submit"
            className="primary-button"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? 'Saving...'
              : editingId !== null
                ? 'Save Changes'
                : 'Register Department'}
          </button>
        </form>
      )}

      <div className="table-toolbar">
        <input
          type="search"
          placeholder="Search departments..."
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
        />

        <span>
          {isLoading
            ? 'Loading...'
            : `${filteredDepartments.length} records found`}
        </span>
      </div>

      {isLoading ? (
        <p>Loading departments...</p>
      ) : error ? (
        <p className="form-error">{error}</p>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Department Code</th>
                <th>Department Name</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredDepartments.map((department) => (
                <tr key={department.id}>
                  <td><strong>{department.department_code}</strong></td>
                  <td>{department.department_name}</td>
                  <td>{department.description || 'No description'}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        type="button"
                        className="edit-button"
                        onClick={() => handleEdit(department)}
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        className="delete-button"
                        onClick={() => handleDelete(department)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredDepartments.length === 0 && (
                <tr>
                  <td colSpan={4} className="empty-state">
                    No departments found.
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

export default DepartmentsPage
