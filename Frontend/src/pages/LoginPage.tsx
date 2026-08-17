import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../AuthContext'
import { homePath, needsProfile } from '../types/auth'
import '../styles/login.css'

export default function LoginPage() {
  const { login, googleAuth } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(true)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  function go(user: { role: 'admin' | 'employer' | 'recruiter'; fullName: string }) {
    navigate(needsProfile(user) ? '/complete-profile' : homePath(user.role))
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
          <img className="bg-img" src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="HR team" />
          <div className="logo"><i className="fas fa-brain" /> SmartHR</div>
          <div className="brand-tagline"><i className="fas fa-robot" style={{ marginRight: 6, opacity: 0.7 }} /> Smarter Hiring. Better Careers. Powered by AI.</div>
          <div className="description">SmartHR uses intelligent AI to screen resumes, rank candidates fairly, and connect the right talent with the right opportunities.</div>
          <div className="feature-grid">
            {[
              ['fas fa-microchip', 'AI-Powered Screening', 'Understand candidates beyond keywords with semantic AI.'],
              ['fas fa-list-ul', 'Explainable Rankings', 'Transparent scoring with clear reasons you can trust.'],
              ['fas fa-scale-balanced', 'Bias-Aware Hiring', 'Reduce unconscious bias and build fairer teams.'],
              ['fas fa-shield', 'Enterprise Security', 'Your data is protected with industry-leading security.'],
            ].map(([icon, label, desc]) => (
              <div key={label} className="feature-item">
                <i className={icon} />
                <span className="feat-label">{label} <span className="feat-desc">{desc}</span></span>
              </div>
            ))}
          </div>
          <div className="stats-row">
            <div className="stat"><span className="number">96%</span><span className="stat-label">AI Match Score</span><span className="badge">Excellent Match</span></div>
            <div className="stat"><span className="number"><i className="fas fa-check-circle" style={{ color: '#6fc2ff' }} /> Passed</span><span className="stat-label">Bias Detection</span></div>
            <div className="stat"><span className="number">25,430+</span><span className="stat-label">Candidates Ranked</span></div>
            <div className="stat"><span className="number">70%</span><span className="stat-label">Time Saved</span></div>
          </div>
          <div className="trusted-section">
            <div className="trust-label">Trusted by forward-thinking companies worldwide</div>
            <div className="copyright">© 2026 SmartHR. All rights reserved.</div>
          </div>
        </div>

        <div className="form-panel">
          <h2>Welcome Back</h2>
          <div className="subtitle">Log in to your SmartHR account</div>
          {error && <div style={{ background: '#fdecec', color: '#9b1c1c', borderRadius: 10, padding: '0.7rem 0.85rem', marginBottom: '1rem', fontSize: '0.9rem' }}>{error}</div>}
          <form onSubmit={onSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input id="email" type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input id="password" type="password" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <div className="form-options">
              <label><input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} /> Remember me</label>
              <a href="#">Forgot password?</a>
            </div>
            <button className="btn-primary" type="submit" disabled={busy}>
              <i className="fas fa-arrow-right-to-bracket" /> {busy ? 'Signing in...' : 'Log in'}
            </button>
            <div className="divider"><span /> OR <span /></div>
            <div className="social-login">
              <button type="button" className="social-btn" onClick={() => void onGoogle()} disabled={busy}>
                <i className="fab fa-google" style={{ color: '#ea4335' }} /> Google
              </button>
              <button type="button" className="social-btn" disabled><i className="fab fa-microsoft" style={{ color: '#0078d4' }} /> Microsoft</button>
            </div>
            <div className="signup-link">Don&apos;t have an account? <Link to="/signup">Create Account</Link></div>
            <div className="back-landing"><Link to="/"><i className="fas fa-arrow-left" /> Back to Home</Link></div>
          </form>
        </div>
      </div>
    </div>
  )
}
