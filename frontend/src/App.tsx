
import { useEffect, useState } from 'react'

import {
  createStudent,
  deleteStudent,
  getStudents,
  updateStudent,
  type NewStudent,
  type Student,
} from './services/studentService'

import EnrolmentsPage from './EnrolmentsPage'
import './App.css'

const emptyStudentForm: NewStudent = {
  student_id: '',
  first_name: '',
  last_name: '',
  email: '',
  phone_number: '',
  date_of_birth: '',
  gender: 'M',
  address: '',
  admission_date: '',
  is_active: true,
}

function App() {
  const [activePage, setActivePage] = useState('Dashboard')
  const [searchTerm, setSearchTerm] = useState('')
  const [students, setStudents] = useState<Student[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [formError, setFormError] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [studentForm, setStudentForm] =
    useState<NewStudent>(emptyStudentForm)
  const [editingStudentId, setEditingStudentId] = useState<number | null>(null)

  // Retrieve student records from Django
  useEffect(() => {
    getStudents()
      .then((data) => {
        setStudents(data)
        setError('')
      })
      .catch((error: unknown) => {
        console.error('Error retrieving students:', error)
        setError('Unable to load student records. Please try again.')
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [])

  const navigation = [
    { name: 'Dashboard', icon: '▦' },
    { name: 'Students', icon: '♙' },
    { name: 'Departments', icon: '▤' },
    { name: 'Programmes', icon: '▧' },
    { name: 'Lecturers', icon: '♧' },
    { name: 'Enrolments', icon: '☷' },
  ]

  // Search student records
  const filteredStudents = students.filter((student) => {
    const search = searchTerm.toLowerCase()
    const fullName =
      `${student.first_name} ${student.last_name}`.toLowerCase()

    return (
      fullName.includes(search) ||
      student.student_id.toLowerCase().includes(search) ||
      student.email.toLowerCase().includes(search)
    )
  })

  // Load selected student details into the form
  function handleEditStudent(student: Student) {
    setStudentForm({
      student_id: student.student_id,
      first_name: student.first_name,
      last_name: student.last_name,
      email: student.email,
      phone_number: student.phone_number,
      date_of_birth: student.date_of_birth,
      gender: student.gender,
      address: student.address,
      admission_date: student.admission_date,
      is_active: student.is_active,
    })

    setEditingStudentId(student.id)
    setShowAddForm(true)
    setFormError('')
  }

  // Delete a student record after confirmation
  async function handleDeleteStudent(student: Student) {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${student.first_name} ${student.last_name}?`,
    )

    if (!confirmed) {
      return
    }

    try {
      await deleteStudent(student.id)

      setStudents((previousStudents) =>
        previousStudents.filter(
          (existingStudent) => existingStudent.id !== student.id,
        ),
      )

      if (editingStudentId === student.id) {
        setStudentForm(emptyStudentForm)
        setEditingStudentId(null)
        setShowAddForm(false)
      }

      alert('Student deleted successfully!')
    } catch (error) {
      console.error('Error deleting student:', error)

      alert(
        error instanceof Error
          ? error.message
          : 'Unable to delete student record.',
      )
    }
  }

  // Update form fields
  function handleFormChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) {
    const { name, value } = event.target

    setStudentForm((previousForm) => ({
      ...previousForm,
      [name]: value,
    }))
  }

  // Register a new student or save changes to an existing student
  async function handleAddStudent(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()
    setIsSubmitting(true)
    setFormError('')

    try {
      if (editingStudentId !== null) {
        const updatedStudent = await updateStudent(
          editingStudentId,
          studentForm,
        )

        setStudents((previousStudents) =>
          previousStudents.map((student) =>
            student.id === editingStudentId
              ? updatedStudent
              : student,
          ),
        )

        alert('Student updated successfully!')
      } else {
        const newStudent = await createStudent(studentForm)

        setStudents((previousStudents) => [
          ...previousStudents,
          newStudent,
        ])

        alert('Student registered successfully!')
      }

      setStudentForm(emptyStudentForm)
      setEditingStudentId(null)
      setShowAddForm(false)
      setSearchTerm('')
    } catch (error) {
      console.error('Error saving student:', error)
      setFormError(
        error instanceof Error
          ? error.message
          : 'Unable to save student record.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">SR</div>
          <div>
            <h2>Student Records</h2>
            <p>Management System</p>
          </div>
        </div>

        <div className="sidebar-section">
          <p className="section-label">MAIN MENU</p>

          <nav>
            {navigation.map((item) => (
              <button
                key={item.name}
                className={`nav-item ${
                  activePage === item.name ? 'active' : ''
                }`}
                onClick={() => setActivePage(item.name)}
              >
                <span className="nav-icon">{item.icon}</span>
                <span>{item.name}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="sidebar-footer">
          <div className="profile-avatar">AD</div>
          <div className="profile-info">
            <h4>Administrator</h4>
            <p>System Admin</p>
          </div>
          <span className="profile-menu">⋮</span>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <p className="breadcrumb">Pages / {activePage}</p>
            <h1>{activePage}</h1>
          </div>

          <div className="topbar-actions">
            <button className="notification-button" aria-label="Notifications">
              ♧
            </button>
            <div className="topbar-avatar">AD</div>
          </div>
        </header>

        <div className="page-content">
          {activePage === 'Dashboard' ? (
            <>
              <section className="welcome-section">
                <div>
                  <h2>Welcome back, Administrator!</h2>
                  <p>
                    Here's an overview of your institution's academic records.
                  </p>
                </div>
                <span className="date-label">
                  Academic Year 2026/2027
                </span>
              </section>

              <section className="stats-grid">
                <div className="stat-card">
                  <div className="stat-heading">
                    <span>Total Students</span>
                    <span className="stat-icon blue">♙</span>
                  </div>
                  <h2>{isLoading ? '...' : students.length}</h2>
                  <p>Registered students</p>
                </div>

                <div className="stat-card">
                  <div className="stat-heading">
                    <span>Departments</span>
                    <span className="stat-icon purple">▤</span>
                  </div>
                  <h2>3</h2>
                  <p>Academic departments</p>
                </div>

                <div className="stat-card">
                  <div className="stat-heading">
                    <span>Programmes</span>
                    <span className="stat-icon orange">▧</span>
                  </div>
                  <h2>3</h2>
                  <p>Academic programmes</p>
                </div>

                <div className="stat-card">
                  <div className="stat-heading">
                    <span>Lecturers</span>
                    <span className="stat-icon green">♧</span>
                  </div>
                  <h2>3</h2>
                  <p>Registered lecturers</p>
                </div>
              </section>

              <section className="records-section">
                <div className="section-header">
                  <div>
                    <h2>Recent Students</h2>
                    <p>Recently registered student records</p>
                  </div>

                  <button
                    className="primary-button"
                    onClick={() => setActivePage('Students')}
                  >
                    + View Students
                  </button>
                </div>

                <div className="table-toolbar">
                  <input
                    type="search"
                    placeholder="Search students..."
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                  />
                  <span>
                    {isLoading
                      ? 'Loading...'
                      : `${filteredStudents.length} records found`}
                  </span>
                </div>

                {isLoading ? (
                  <p>Loading student records...</p>
                ) : error ? (
                  <p>{error}</p>
                ) : (
                  <div className="table-container">
                    <table>
                      <thead>
                        <tr>
                          <th>Registration No.</th>
                          <th>Student Name</th>
                          <th>Email</th>
                          <th>Phone Number</th>
                          <th>Admission Date</th>
                          <th>Status</th>
                        </tr>
                      </thead>

                      <tbody>
                        {filteredStudents.map((student) => (
                          <tr key={student.id}>
                            <td>{student.student_id}</td>
                            <td>
                              <div className="student-name">
                                <div className="student-avatar">
                                  {student.first_name.charAt(0)}
                                </div>
                                <div>
                                  <strong>
                                    {student.first_name} {student.last_name}
                                  </strong>
                                </div>
                              </div>
                            </td>
                            <td>{student.email}</td>
                            <td>{student.phone_number || 'Not provided'}</td>
                            <td>{student.admission_date}</td>
                            <td>
                              <span
                                className={`status ${
                                  student.is_active
                                    ? 'status-active'
                                    : 'status-inactive'
                                }`}
                              >
                                {student.is_active ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                          </tr>
                        ))}

                        {filteredStudents.length === 0 && (
                          <tr>
                            <td colSpan={6} className="empty-state">
                              No students match your search.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            </>
          ) : activePage === 'Students' ? (
            <section className="records-section page-placeholder">
              <div className="section-header">
                <div>
                  <h2>Student Records</h2>
                  <p>Manage registered student information</p>
                </div>

                <button
                  className="primary-button"
                  onClick={() => {
                    if (showAddForm) {
                      setShowAddForm(false)
                      setStudentForm(emptyStudentForm)
                      setEditingStudentId(null)
                      setFormError('')
                    } else {
                      setStudentForm(emptyStudentForm)
                      setEditingStudentId(null)
                      setShowAddForm(true)
                      setFormError('')
                    }
                  }}
                >
                  {showAddForm ? 'Cancel' : '+ Add Student'}
                </button>
              </div>

              {showAddForm && (
                <form className="student-form" onSubmit={handleAddStudent}>
                  <h3>
                    {editingStudentId !== null
                      ? 'Edit Student Details'
                      : 'Register New Student'}
                  </h3>

                  {formError && (
                    <p className="form-error" role="alert">
                      {formError}
                    </p>
                  )}

                  <div className="student-form-grid">
                    <label>
                      Registration Number *
                      <input
                        name="student_id"
                        value={studentForm.student_id}
                        onChange={handleFormChange}
                        placeholder="e.g. STU2026004"
                        required
                      />
                    </label>

                    <label>
                      First Name *
                      <input
                        name="first_name"
                        value={studentForm.first_name}
                        onChange={handleFormChange}
                        required
                      />
                    </label>

                    <label>
                      Last Name *
                      <input
                        name="last_name"
                        value={studentForm.last_name}
                        onChange={handleFormChange}
                        required
                      />
                    </label>

                    <label>
                      Email Address *
                      <input
                        type="email"
                        name="email"
                        value={studentForm.email}
                        onChange={handleFormChange}
                        required
                      />
                    </label>

                    <label>
                      Phone Number
                      <input
                        name="phone_number"
                        value={studentForm.phone_number}
                        onChange={handleFormChange}
                      />
                    </label>

                    <label>
                      Date of Birth *
                      <input
                        type="date"
                        name="date_of_birth"
                        value={studentForm.date_of_birth}
                        onChange={handleFormChange}
                        required
                      />
                    </label>

                    <label>
                      Gender *
                      <select
                        name="gender"
                        value={studentForm.gender}
                        onChange={handleFormChange}
                        required
                      >
                        <option value="M">Male</option>
                        <option value="F">Female</option>
                      </select>
                    </label>

                    <label>
                      Admission Date *
                      <input
                        type="date"
                        name="admission_date"
                        value={studentForm.admission_date}
                        onChange={handleFormChange}
                        required
                      />
                    </label>

                    <label>
                      Address *
                      <input
                        name="address"
                        value={studentForm.address}
                        onChange={handleFormChange}
                        required
                      />
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="primary-button"
                    disabled={isSubmitting}
                  >
                    {isSubmitting
                      ? editingStudentId !== null
                        ? 'Saving Changes...'
                        : 'Registering...'
                      : editingStudentId !== null
                        ? 'Save Changes'
                        : 'Register Student'}
                  </button>
                </form>
              )}

              <div className="table-toolbar">
                <input
                  type="search"
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                />
                <span>
                  {isLoading
                    ? 'Loading...'
                    : `${filteredStudents.length} records found`}
                </span>
              </div>

              {isLoading ? (
                <p>Loading student records...</p>
              ) : error ? (
                <p>{error}</p>
              ) : (
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Registration No.</th>
                        <th>Student Name</th>
                        <th>Email</th>
                        <th>Phone Number</th>
                        <th>Gender</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredStudents.map((student) => (
                        <tr key={student.id}>
                          <td>{student.student_id}</td>
                          <td>
                            {student.first_name} {student.last_name}
                          </td>
                          <td>{student.email}</td>
                          <td>{student.phone_number || 'Not provided'}</td>
                          <td>
                            {student.gender === 'M'
                              ? 'Male'
                              : student.gender === 'F'
                                ? 'Female'
                                : student.gender}
                          </td>
                          <td>
                            <span
                              className={`status ${
                                student.is_active
                                  ? 'status-active'
                                  : 'status-inactive'
                              }`}
                            >
                              {student.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td>
                            <div className="action-buttons">
                              <button
                                type="button"
                                className="edit-button"
                                onClick={() => handleEditStudent(student)}
                              >
                                Edit
                              </button>

                              <button
                                type="button"
                                className="delete-button"
                                onClick={() => handleDeleteStudent(student)}
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}

                      {filteredStudents.length === 0 && (
                        <tr>
                          <td colSpan={7} className="empty-state">
                            No students match your search.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          ) : activePage === 'Enrolments' ? (
            <EnrolmentsPage />
          ) : (
            <section className="records-section page-placeholder">
              <h2>{activePage}</h2>
              <p>
                The {activePage.toLowerCase()} management page will be
                developed in the next stages.
              </p>
            </section>
          )}

          <footer className="page-footer">
            <p>Student Records Management System</p>
            <p>© 2026 All rights reserved.</p>
          </footer>
        </div>
      </main>
    </div>
  )
}

export default App
