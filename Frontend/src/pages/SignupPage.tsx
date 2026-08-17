import { useMemo, useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../AuthContext'
import type { UserRole } from '../types/auth'
import { homePath, needsProfile } from '../types/auth'
import { passwordRules, validateSignup } from '../utils/validation'
import '../styles/signup.css'

const ROLES: { id: UserRole; icon: string; title: string; desc: string }[] = [
  { id: 'employer', icon: 'fas fa-building', title: 'Employer', desc: 'Hire and manage your company’s talent pipeline.' },
  { id: 'recruiter', icon: 'fas fa-briefcase', title: 'Recruiter', desc: 'Post jobs, manage applicants and hire top candidates.' },
  { id: 'admin', icon: 'fas fa-user-gear', title: 'Administrator', desc: 'Manage the platform, users, roles and system settings.' },
]

function afterAuth(user: { role: UserRole; fullName: string }, navigate: ReturnType<typeof useNavigate>) {
  navigate(needsProfile(user) ? '/complete-profile' : homePath(user.role))
}

export default function SignupPage() {
  const { signup, googleAuth } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const preset = params.get('role')
  const initialRole = preset === 'admin' || preset === 'employer' || preset === 'recruiter' ? preset : null

  const [role, setRole] = useState<UserRole | null>(initialRole)
  const [form, setForm] = useState({ email: '', password: '', confirmPassword: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [serverError, setServerError] = useState('')
  const [busy, setBusy] = useState(false)
  const [terms, setTerms] = useState(false)

  const rules = passwordRules(form.password)
  const selected = useMemo(() => ROLES.find((item) => item.id === role), [role])

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    if (!role) {
      setErrors({ role: 'Choose a role to continue' })
      return
    }
    if (!terms) {
      setErrors({ terms: 'You must agree to the terms' })
      return
    }
    const nextErrors = validateSignup(form)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return

    setBusy(true)
    setServerError('')
    try {
      afterAuth(await signup({ email: form.email.trim(), password: form.password, role }), navigate)
    } catch (error) {
      setServerError(error instanceof Error ? error.message : 'Could not create your account')
    } finally {
      setBusy(false)
    }
  }

  async function onGoogle() {
    if (!role) {
      setErrors({ role: 'Choose a role before continuing with Google' })
      return
    }
    setBusy(true)
    setServerError('')
    try {
      afterAuth(await googleAuth(role), navigate)
    } catch (error) {
      setServerError(error instanceof Error ? error.message : 'Google sign-in failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="signup-page">
      <div className="signup-card">
        <div className="brand-panel">
          <img className="bg-img" src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="HR team" />
          <div className="logo"><i className="fas fa-brain" /> SmartHR</div>
          <div className="brand-tagline"><i className="fas fa-robot" style={{ marginRight: 6, opacity: 0.7 }} /> Smarter Hiring. Better Careers. Powered by AI.</div>
          <div style={{ fontSize: '0.8rem', opacity: 0.75, marginBottom: '0.5rem' }}>SmartHR uses intelligent AI to screen resumes, rank candidates fairly, and connect the right talent with the right opportunities.</div>
          <div className="stats-grid">
            <div className="stat-item"><div className="label">Top Candidate</div><div className="value">Ada Johnson <small>94%</small></div></div>
            <div className="stat-item"><div className="label">Bias Detector</div><div className="value" style={{ color: '#6fc2ff' }}><i className="fas fa-check-circle" /> Passed</div></div>
            <div className="stat-item" style={{ gridColumn: 'span 2' }}><div className="label">AI Match Score</div><div className="value">96% <small>· explainable ranking</small></div></div>
          </div>
          <div className="footer-note">
            <span>© 2026 SmartHR. All rights reserved.</span>
            <Link to="/"><i className="fas fa-arrow-left" /> Back to landing</Link>
          </div>
        </div>

        <div className="form-panel">
          <h2>Create Your SmartHR Account</h2>
          <div className="step-indicator"><i className="fas fa-circle-check" /> Choose your account type to get started</div>

          <div style={{ fontWeight: 600, fontSize: '0.75rem', color: '#1d2d44', marginBottom: '0.1rem' }}>Step 1: Select Account Type</div>
          <div className="role-grid">
            {ROLES.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`role-card${role === item.id ? ' active' : ''}${item.id === 'admin' ? ' full-width' : ''}`}
                onClick={() => { setRole(item.id); setErrors({}) }}
              >
                <i className={item.icon} />
                <div><span className="role-label">{item.title}</span><span className="role-desc">{item.desc}</span></div>
              </button>
            ))}
          </div>
          {errors.role && <p style={{ color: '#c62828', fontSize: '0.78rem', marginTop: '0.5rem' }}>{errors.role}</p>}

          <div style={{ fontWeight: 600, fontSize: '0.75rem', color: '#1d2d44', margin: '0.8rem 0 0.1rem' }}>Step 2: Create Your Account</div>
          {serverError && <div style={{ background: '#fdecec', color: '#9b1c1c', borderRadius: 10, padding: '0.7rem', margin: '0.6rem 0', fontSize: '0.85rem' }}>{serverError}</div>}

          <form onSubmit={onSubmit}>
            <div className="form-row">
              <div className="form-group full-width">
                <label htmlFor="email">Email Address</label>
                <input id="email" type="email" placeholder="Enter your email" value={form.email} onChange={(e) => setForm((c) => ({ ...c, email: e.target.value }))} />
                {errors.email && <span style={{ color: '#c62828', fontSize: '0.78rem' }}>{errors.email}</span>}
              </div>
              <div className="form-group full-width">
                <label htmlFor="password">Password</label>
                <input id="password" type="password" placeholder="Create a password" value={form.password} onChange={(e) => setForm((c) => ({ ...c, password: e.target.value }))} />
                <ul style={{ listStyle: 'none', margin: '0.4rem 0 0', padding: 0, fontSize: '0.8rem' }}>
                  {rules.map((rule) => <li key={rule.id} style={{ color: rule.ok ? '#1b7f4a' : '#b42318' }}>{rule.ok ? '✓' : '•'} {rule.label}</li>)}
                </ul>
                {errors.password && <span style={{ color: '#c62828', fontSize: '0.78rem' }}>{errors.password}</span>}
              </div>
              <div className="form-group full-width">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input id="confirmPassword" type="password" placeholder="Confirm your password" value={form.confirmPassword} onChange={(e) => setForm((c) => ({ ...c, confirmPassword: e.target.value }))} />
                {errors.confirmPassword && <span style={{ color: '#c62828', fontSize: '0.78rem' }}>{errors.confirmPassword}</span>}
              </div>
            </div>

            <div className="terms">
              <input type="checkbox" id="termsCheck" checked={terms} onChange={(e) => setTerms(e.target.checked)} />
              <label htmlFor="termsCheck">I agree to the Terms of Service and Privacy Policy</label>
            </div>
            {errors.terms && <span style={{ color: '#c62828', fontSize: '0.78rem' }}>{errors.terms}</span>}

            <button className="btn-primary" type="submit" disabled={busy || !selected}>
              <i className="fas fa-user-plus" /> {busy ? 'Creating account...' : `Create ${selected?.title ?? ''} Account`}
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', margin: '0.5rem 0', color: '#7a8aa0', fontSize: '0.7rem' }}>
              <span style={{ flex: 1, height: 1, background: '#dee6ef' }} /><span>OR</span><span style={{ flex: 1, height: 1, background: '#dee6ef' }} />
            </div>

            <div className="social-login">
              <button type="button" className="social-btn" onClick={() => void onGoogle()} disabled={busy}>
                <i className="fab fa-google" style={{ color: '#ea4335' }} /> Continue with Google
              </button>
            </div>

            <div className="login-link">Already have an account? <Link to="/login">Log in</Link></div>
            <div className="home link"><Link to="/">Back to Home</Link></div>
          </form>
        </div>
      </div>
    </div>
  )
}
