import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../AuthContext'
import { homePath, needsProfile } from '../types/auth'
import '../styles/login.css'

export default function LoginPage() {
  const { login, googleAuth, user, accessToken } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  if (accessToken && user) {
    return <Navigate to={needsProfile(user) ? '/complete-profile' : homePath(user.role)} replace />
  }

  function go(next: Parameters<typeof needsProfile>[0] & { role: Parameters<typeof homePath>[0] }) {
    navigate(needsProfile(next) ? '/complete-profile' : homePath(next.role))
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      go(await login(email, password))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not log in')
    } finally {
      setBusy(false)
    }
  }

  async function onGoogle() {
    setBusy(true)
    setError('')
    try {
      go(await googleAuth())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google sign-in failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="brand-panel">
          <img
            className="bg-img"
            src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
            alt="HR team"
          />
          <div className="logo-badge">
            SmartHR
          </div>
          <div className="brand-tagline">
            Sign in to a workspace that keeps hiring readable.
          </div>
          <div className="description">
            Recruiters review ranked applicants. Candidates see the same match details. Admins keep the platform tidy.
          </div>
          <div className="feature-grid">
            <div className="feature-item">
              <span className="feat-label">Resume ranking</span>
              <span className="feat-desc">Skill and semantic score details.</span>
            </div>
            <div className="feature-item">
              <span className="feat-label">Role routing</span>
              <span className="feat-desc">Recruiter, candidate, and admin dashboards.</span>
            </div>
          </div>
          <div className="trusted-section">
            SmartHR Recruitment Agency
          </div>
        </div>

        <div className="form-panel">
          <h2>Welcome back</h2>
          <div className="subtitle">Use the email connected to your SmartHR account.</div>

          {error && <div className="banner">{error}</div>}

          <form onSubmit={onSubmit}>
            <div className="form-group">
              <input
                type="text"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-options">
              <a href="#forgot">Forgot Password?</a>
            </div>

            <div className="auth-action-row">
              <button className="btn-primary-purple" type="submit" disabled={busy}>
                {busy ? 'Signing in...' : 'Sign in'}
              </button>
              <Link to="/signup" className="btn-outline-purple">
                Create account
              </Link>
            </div>

            <div className="divider">
              <span>or</span>
            </div>

            <div className="social-login-stack">
              <button type="button" className="social-btn-card goog" onClick={() => void onGoogle()} disabled={busy}>
                Continue with Google
              </button>
            </div>

            <div className="signup-link-row">
              Don&apos;t have an account? <Link to="/signup">Create Account</Link> | <Link to="/">Back to Home</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
