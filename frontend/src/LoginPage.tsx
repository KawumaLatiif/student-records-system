import { useState } from 'react'
import { GraduationCap, LockKeyhole, User } from 'lucide-react'

type LoginPageProps = {
  onLogin: (username: string, password: string) => Promise<void>
}

function LoginPage({ onLogin }: LoginPageProps) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      await onLogin(username, password)
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Unable to sign in. Please try again.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="login-page">
      <section className="login-card">
        <div className="login-brand-icon">
          <GraduationCap size={32} />
        </div>

        <h1>Student Records</h1>
        <p className="login-subtitle">
          Management System
        </p>

        <div className="login-heading">
          <h2>Welcome back</h2>
          <p>Sign in to access your academic records dashboard.</p>
        </div>

        {error && (
          <div className="login-error" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <label htmlFor="username">Username</label>
          <div className="login-input-wrapper">
            <User size={18} />
            <input
              id="username"
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="Enter your username"
              autoComplete="username"
              required
            />
          </div>

          <label htmlFor="password">Password</label>
          <div className="login-input-wrapper">
            <LockKeyhole size={18} />
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              autoComplete="current-password"
              required
            />
          </div>

          <button
            type="submit"
            className="login-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="login-footer">
          Student Records Management System © 2026
        </p>
      </section>
    </main>
  )
}

export default LoginPage