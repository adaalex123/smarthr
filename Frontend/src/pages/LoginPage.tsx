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
        {/* Left Brand Panel */}
        <div className="brand-panel">
          <img
            className="bg-img"
            src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
            alt="HR team"
          />
          <div className="logo-badge">
            smart hr<br />
            recruitment<br />
            agency
          </div>
          <div className="brand-tagline">
            Smarter Hiring.<br />
            Better Careers.
          </div>
          <div className="description">
            Smart HR uses intelligent AI to screen resumes, rank candidates fairly, and connect top talent with leading recruiters worldwide.
          </div>
          <div className="feature-grid">
            <div className="feature-item">
              <span className="feat-label">✓ AI-Powered Screening</span>
              <span className="feat-desc">Understand candidates beyond keywords.</span>
            </div>
            <div className="feature-item">
              <span className="feat-label">✓ Explainable Rankings</span>
              <span className="feat-desc">Transparent scoring with clear reasons.</span>
            </div>
          </div>
          <div className="trusted-section">
            © 2026 Smart HR Recruitment Agency. All rights reserved.
          </div>
        </div>

        {/* Right Form Panel - Screenshot 3 */}
        <div className="form-panel">
          <h2>Existing Users Login Below</h2>
          <div className="subtitle">Log in to your Smart HR account</div>

          {error && <div className="banner" style={{ background: '#fdecec', color: '#9b1c1c', borderRadius: 4, padding: '0.7rem', marginBottom: '1rem', fontSize: '0.88rem' }}>{error}</div>}

          <form onSubmit={onSubmit}>
            <div className="form-group">
              <input
                type="text"
                placeholder="Username or Email Address"
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
                {busy ? 'LOGGING IN...' : 'LOGIN'}
              </button>
              <Link to="/signup" className="btn-outline-purple">
                REGISTER
              </Link>
            </div>

            <div className="divider">
              <span>or</span>
            </div>

            <div className="social-login-stack">
              <button type="button" className="social-btn-card goog" onClick={() => void onGoogle()} disabled={busy}>
                G Continue with Google
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
