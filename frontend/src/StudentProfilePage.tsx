
import { useEffect, useState } from 'react'
import { getStudent, type Student } from './services/studentService'
import {
  getEnrolments,
  getProgrammes,
  type Enrolment,
  type AcademicProgramme,
} from './services/enrolmentService'

type StudentProfilePageProps = {
  studentId: number
  onBack: () => void
}

function StudentProfilePage({
  studentId,
  onBack,
}: StudentProfilePageProps) {
  const [student, setStudent] = useState<Student | null>(null)
  const [enrolments, setEnrolments] = useState<Enrolment[]>([])
  const [programmes, setProgrammes] = useState<AcademicProgramme[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadProfile() {
      try {
        setIsLoading(true)
        setError('')

        const [studentData, enrolmentData, programmeData] =
          await Promise.all([
            getStudent(studentId),
            getEnrolmentsForStudent(studentId),
            getProgrammes(),
          ])

        setStudent(studentData)
        setEnrolments(enrolmentData)
        setProgrammes(programmeData)
      } catch (error) {
        console.error('Error loading student profile:', error)
        setError('Unable to load this student profile. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }

    loadProfile()
  }, [studentId])

  if (isLoading) {
    return <section className="records-section">Loading student profile...</section>
  }

  if (error || !student) {
    return (
      <section className="records-section">
        <p className="form-error">{error || 'Student not found.'}</p>
        <button className="secondary-button" onClick={onBack}>
          Back to Students
        </button>
      </section>
    )
  }

  return (
    <section className="records-section student-profile">
      <div className="section-header">
        <div>
          <h2>Student Profile</h2>
          <p>Personal information and academic enrolment history</p>
        </div>

        <button className="secondary-button" onClick={onBack}>
          ← Back to Students
        </button>
      </div>

      <div className="profile-summary">
        <div className="profile-avatar-large">
          {student.first_name.charAt(0)}
          {student.last_name.charAt(0)}
        </div>

        <div>
          <h2>{student.first_name} {student.last_name}</h2>
          <p>{student.student_id}</p>
          <span className={`status ${
            student.is_active ? 'status-active' : 'status-inactive'
          }`}>
            {student.is_active ? 'Active Student' : 'Inactive Student'}
          </span>
        </div>
      </div>

      <div className="profile-section">
        <h3>Personal Information</h3>

        <div className="profile-details-grid">
          <div>
            <label>Email Address</label>
            <p>{student.email}</p>
          </div>

          <div>
            <label>Phone Number</label>
            <p>{student.phone_number || 'Not provided'}</p>
          </div>

          <div>
            <label>Date of Birth</label>
            <p>{student.date_of_birth}</p>
          </div>

          <div>
            <label>Gender</label>
            <p>
              {student.gender === 'M'
                ? 'Male'
                : student.gender === 'F'
                  ? 'Female'
                  : student.gender}
            </p>
          </div>

          <div>
            <label>Admission Date</label>
            <p>{student.admission_date}</p>
          </div>

          <div>
            <label>Address</label>
            <p>{student.address || 'Not provided'}</p>
          </div>
        </div>
      </div>

      <div className="profile-section">
        <h3>Academic Enrolment History</h3>

        {enrolments.length === 0 ? (
          <p>No enrolment records found for this student.</p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Programme</th>
                  <th>Academic Year</th>
                  <th>Semester</th>
                  <th>Year of Study</th>
                  <th>Enrolment Date</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {enrolments.map((enrolment) => {
                  const programme = programmes.find(
                    (item) => item.id === enrolment.programme,
                  )

                  return (
                    <tr key={enrolment.id}>
                      <td>
                        <strong>
                          {programme?.programme_name || 'Unknown programme'}
                        </strong>
                        <br />
                        <small>
                          {programme?.programme_code || ''}
                        </small>
                      </td>
                      <td>{enrolment.academic_year}</td>
                      <td>{enrolment.semester}</td>
                      <td>{enrolment.year_of_study}</td>
                      <td>{enrolment.enrolment_date}</td>
                      <td>
                        <span className={`status status-${enrolment.status.toLowerCase()}`}>
                          {enrolment.status}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  )
}

async function getEnrolmentsForStudent(studentId: number): Promise<Enrolment[]> {
  return getEnrolments(studentId)
}

export default StudentProfilePage
