
import { useEffect, useState } from 'react'
import {
  LayoutDashboard,
  GraduationCap,
  Building2,
  BookOpen,
  Users,
  ClipboardList,
  Bell,
  UserCheck,
  UserX,
  LogOut,
} from 'lucide-react'

import {
  createStudent,
  deleteStudent,
  getStudents,
  updateStudent,
  type NewStudent,
  type Student,
} from './services/studentService'

import { getDepartments } from './services/departmentService'
import {
  getProgrammes,
  type AcademicProgramme,
} from './services/programmeService'
import { getLecturers } from './services/lecturerService'

import {
  getEnrolments,
  type Enrolment,
} from './services/enrolmentService'

import {
  getCurrentUser,
  login,
  logout,
  type User,
} from './services/authService'

import {
  getAuthToken,
  clearAuthToken,
} from './services/api'

import LoginPage from './LoginPage'
import EnrolmentsPage from './EnrolmentsPage'
import StudentProfilePage from './StudentProfilePage'
import DepartmentsPage from './DepartmentsPage'
import ProgrammesPage from './ProgrammesPage'
import LecturersPage from './LecturersPage'

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

type DashboardProps = {
  user: User
  onLogout: () => void
}

function Dashboard({ user, onLogout }: DashboardProps) {
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
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null)

  // Dashboard statistics
  const [departmentCount, setDepartmentCount] = useState(0)
  const [programmeCount, setProgrammeCount] = useState(0)
  const [lecturerCount, setLecturerCount] = useState(0)
  const [statsLoading, setStatsLoading] = useState(true)
  const [statsError, setStatsError] = useState('')

  // Dashboard enrolment data
  const [enrolments, setEnrolments] = useState<Enrolment[]>([])
  const [programmes, setProgrammes] = useState<AcademicProgramme[]>([])

  // Display the authenticated user's name
  const displayName =
    `${user.first_name} ${user.last_name}`.trim() || user.username

  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase()

  // Retrieve student records from Django
  useEffect(() => {
    let cancelled = false

    getStudents()
      .then((data) => {
        if (!cancelled) {
          setStudents(data)
          setError('')
        }
      })
      .catch((error: unknown) => {
        console.error('Error retrieving students:', error)

        if (!cancelled) {
          setError('Unable to load student records. Please try again.')
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [])

  // Load dashboard information when the Dashboard is opened
  useEffect(() => {
    if (activePage !== 'Dashboard') return

    let cancelled = false

    async function loadDashboardData() {
      setStatsLoading(true)
      setStatsError('')

      try {
        const [
          departments,
          programmeRecords,
          lecturers,
          enrolmentRecords,
        ] = await Promise.all([
          getDepartments(),
          getProgrammes(),
          getLecturers(),
          getEnrolments(),
        ])

        if (!cancelled) {
          setDepartmentCount(departments.length)
          setProgrammeCount(programmeRecords.length)
          setLecturerCount(lecturers.length)
          setProgrammes(programmeRecords)
          setEnrolments(enrolmentRecords)
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error)

        if (!cancelled) {
          setStatsError('Unable to load some dashboard information.')
        }
      } finally {
        if (!cancelled) {
          setStatsLoading(false)
        }
      }
    }

    void loadDashboardData()

    return () => {
      cancelled = true
    }
  }, [activePage])

  // Sidebar navigation
  const navigation = [
    { name: 'Dashboard', icon: LayoutDashboard },
    { name: 'Students', icon: GraduationCap },
    { name: 'Departments', icon: Building2 },
    { name: 'Programmes', icon: BookOpen },
    { name: 'Lecturers', icon: Users },
    { name: 'Enrolments', icon: ClipboardList },
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

  // Calculate student status totals
  const activeStudentCount = students.filter(
    (student) => student.is_active,
  ).length

  const inactiveStudentCount = students.length - activeStudentCount

  // Get the five most recent enrolments
  const recentEnrolments = [...enrolments]
    .sort(
      (a, b) =>
        new Date(b.enrolment_date).getTime() -
        new Date(a.enrolment_date).getTime(),
    )
    .slice(0, 5)

  // Calculate enrolments per programme
  const programmeDistribution = enrolments.reduce<
    { programmeId: number; count: number }[]
  >((distribution, enrolment) => {
    const existing = distribution.find(
      (item) => item.programmeId === enrolment.programme,
    )

    if (existing) {
      existing.count += 1
    } else {
      distribution.push({
        programmeId: enrolment.programme,
        count: 1,
      })
    }

    return distribution
  }, [])

  // Open the selected student's profile
  function handleViewProfile(student: Student) {
    setSelectedStudentId(student.id)
    setActivePage('Student Profile')
    setShowAddForm(false)
  }

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
                type="button"
                className={`nav-item ${
                  activePage === item.name ? 'active' : ''
                }`}
                onClick={() => setActivePage(item.name)}
              >
                <span className="nav-icon">
                  <item.icon size={20} strokeWidth={1.8} />
                </span>
                <span>{item.name}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="sidebar-footer">
          <div className="profile-avatar">{initials}</div>

          <div className="profile-info">
            <h4>{displayName}</h4>
            <p>
              {user.is_superuser
                ? 'System Administrator'
                : user.is_staff
                  ? 'Staff Account'
                  : 'User Account'}
            </p>
          </div>

          <button
            type="button"
            className="logout-button"
            onClick={onLogout}
            title="Log out"
            aria-label="Log out"
          >
            <LogOut size={17} />
          </button>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <p className="breadcrumb">Pages / {activePage}</p>
            <h1>{activePage}</h1>
          </div>

          <div className="topbar-actions">
            <button
              className="notification-button"
              aria-label="Notifications"
              type="button"
            >
              <Bell size={20} strokeWidth={1.8} />
            </button>
            <div className="topbar-avatar">{initials}</div>
          </div>
        </header>

        <div className="page-content">
          {activePage === 'Dashboard' ? (
            <>
              <section className="welcome-section">
                <div>
                  <h2>
                    Welcome back, {user.first_name || user.username}!
                  </h2>
                  <p>
                    Here's an overview of your institution's academic records.
                  </p>
                </div>
                <span className="date-label">
                  Academic Year 2026/2027
                </span>
              </section>

              {/* Main dashboard statistics */}
              <section className="stats-grid">
                <div className="stat-card">
                  <div className="stat-heading">
                    <span>Total Students</span>
                    <span className="stat-icon blue">
                      <GraduationCap size={22} strokeWidth={1.8} />
                    </span>
                  </div>
                  <h2>{isLoading ? '...' : students.length}</h2>
                  <p>Registered students</p>
                </div>

                <div className="stat-card">
                  <div className="stat-heading">
                    <span>Departments</span>
                    <span className="stat-icon purple">
                      <Building2 size={22} strokeWidth={1.8} />
                    </span>
                  </div>
                  <h2>{statsLoading ? '...' : departmentCount}</h2>
                  <p>Academic departments</p>
                </div>

                <div className="stat-card">
                  <div className="stat-heading">
                    <span>Programmes</span>
                    <span className="stat-icon orange">
                      <BookOpen size={22} strokeWidth={1.8} />
                    </span>
                  </div>
                  <h2>{statsLoading ? '...' : programmeCount}</h2>
                  <p>Academic programmes</p>
                </div>

                <div className="stat-card">
                  <div className="stat-heading">
                    <span>Lecturers</span>
                    <span className="stat-icon green">
                      <Users size={22} strokeWidth={1.8} />
                    </span>
                  </div>
                  <h2>{statsLoading ? '...' : lecturerCount}</h2>
                  <p>Registered lecturers</p>
                </div>
              </section>

              {statsError && (
                <p className="form-error" role="alert">
                  {statsError}
                </p>
              )}

              {/* Student status and enrolment summary */}
              <section className="stats-grid">
                <div className="stat-card">
                  <div className="stat-heading">
                    <span>Active Students</span>
                    <span className="stat-icon green">
                      <UserCheck size={22} strokeWidth={1.8} />
                    </span>
                  </div>
                  <h2>{isLoading ? '...' : activeStudentCount}</h2>
                  <p>Currently active students</p>
                </div>

                <div className="stat-card">
                  <div className="stat-heading">
                    <span>Inactive Students</span>
                    <span className="stat-icon orange">
                      <UserX size={22} strokeWidth={1.8} />
                    </span>
                  </div>
                  <h2>{isLoading ? '...' : inactiveStudentCount}</h2>
                  <p>Inactive student records</p>
                </div>

                <div className="stat-card">
                  <div className="stat-heading">
                    <span>Total Enrolments</span>
                    <span className="stat-icon blue">
                      <ClipboardList size={22} strokeWidth={1.8} />
                    </span>
                  </div>
                  <h2>{statsLoading ? '...' : enrolments.length}</h2>
                  <p>Recorded enrolments</p>
                </div>
              </section>

              {/* Recent students */}
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

              {/* Recent enrolments */}
              <section className="records-section">
                <div className="section-header">
                  <div>
                    <h2>Recent Enrolments</h2>
                    <p>Latest student programme enrolments</p>
                  </div>

                  <button
                    className="primary-button"
                    onClick={() => setActivePage('Enrolments')}
                  >
                    View Enrolments
                  </button>
                </div>

                {statsLoading ? (
                  <p>Loading enrolments...</p>
                ) : (
                  <div className="table-container">
                    <table>
                      <thead>
                        <tr>
                          <th>Student</th>
                          <th>Programme</th>
                          <th>Academic Year</th>
                          <th>Semester</th>
                          <th>Enrolment Date</th>
                          <th>Status</th>
                        </tr>
                      </thead>

                      <tbody>
                        {recentEnrolments.map((enrolment) => {
                          const student = students.find(
                            (item) => item.id === enrolment.student,
                          )

                          const programme = programmes.find(
                            (item) => item.id === enrolment.programme,
                          )

                          return (
                            <tr key={enrolment.id}>
                              <td>
                                {student
                                  ? `${student.first_name} ${student.last_name}`
                                  : `Student #${enrolment.student}`}
                              </td>
                              <td>
                                {programme
                                  ? programme.programme_name
                                  : `Programme #${enrolment.programme}`}
                              </td>
                              <td>{enrolment.academic_year}</td>
                              <td>{enrolment.semester}</td>
                              <td>{enrolment.enrolment_date}</td>
                              <td>{enrolment.status}</td>
                            </tr>
                          )
                        })}

                        {recentEnrolments.length === 0 && (
                          <tr>
                            <td colSpan={6} className="empty-state">
                              No enrolment records available.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>

              {/* Programme distribution */}
              <section className="records-section">
                <div className="section-header">
                  <div>
                    <h2>Programme Distribution</h2>
                    <p>Enrolments across academic programmes</p>
                  </div>
                </div>

                {statsLoading ? (
                  <p>Loading programme distribution...</p>
                ) : programmeDistribution.length === 0 ? (
                  <p>No programme enrolments available.</p>
                ) : (
                  <div className="programme-distribution">
                    {programmeDistribution.map((item) => {
                      const programme = programmes.find(
                        (record) => record.id === item.programmeId,
                      )

                      const percentage =
                        enrolments.length > 0
                          ? (item.count / enrolments.length) * 100
                          : 0

                      return (
                        <div
                          className="distribution-item"
                          key={item.programmeId}
                        >
                          <div className="distribution-heading">
                            <strong>
                              {programme
                                ? programme.programme_name
                                : `Programme #${item.programmeId}`}
                            </strong>
                            <span>
                              {item.count}{' '}
                              {item.count === 1 ? 'enrolment' : 'enrolments'}
                              {' '}({percentage.toFixed(1)}%)
                            </span>
                          </div>

                          <div className="distribution-bar">
                            <div
                              className="distribution-fill"
                              style={{
                                width: `${percentage}%`,
                              }}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </section>
            </>
          ) : activePage === 'Student Profile' && selectedStudentId !== null ? (
            <StudentProfilePage
              studentId={selectedStudentId}
              onBack={() => setActivePage('Students')}
            />
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
                                className="view-button"
                                onClick={() => handleViewProfile(student)}
                              >
                                View Profile
                              </button>

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
          ) : activePage === 'Departments' ? (
            <DepartmentsPage />
          ) : activePage === 'Programmes' ? (
            <ProgrammesPage />
          ) : activePage === 'Lecturers' ? (
            <LecturersPage />
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

// Authentication controller
function App() {
  const [user, setUser] = useState<User | null>(null)
  const [isCheckingSession, setIsCheckingSession] = useState(true)

  // Restore the existing login session when the application opens
  useEffect(() => {
    let cancelled = false

    async function restoreSession() {
      const token = getAuthToken()

      if (!token) {
        if (!cancelled) {
          setIsCheckingSession(false)
        }
        return
      }

      try {
        const currentUser = await getCurrentUser()

        if (!cancelled) {
          setUser(currentUser)
        }
      } catch (error) {
        console.error('Unable to restore session:', error)
        clearAuthToken()

        if (!cancelled) {
          setUser(null)
        }
      } finally {
        if (!cancelled) {
          setIsCheckingSession(false)
        }
      }
    }

    void restoreSession()

    return () => {
      cancelled = true
    }
  }, [])

  // Authenticate the user
  async function handleLogin(
    username: string,
    password: string,
  ) {
    const authenticatedUser = await login(username, password)
    setUser(authenticatedUser)
  }

  // End the current session
  async function handleLogout() {
    try {
      await logout()
    } catch (error) {
      console.error('Logout request failed:', error)
    } finally {
      clearAuthToken()
      setUser(null)
    }
  }

  if (isCheckingSession) {
    return (
      <div className="auth-loading">
        Checking session...
      </div>
    )
  }

  if (!user) {
    return <LoginPage onLogin={handleLogin} />
  }

  return <Dashboard user={user} onLogout={handleLogout} />
}

export default App
