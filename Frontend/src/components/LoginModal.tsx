import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../AuthContext'
import { homePath, needsProfile } from '../types/auth'

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { login, googleAuth } = useAuth()
  const navigate = useNavigate()

  if (!isOpen) return null

  function go(user: Parameters<typeof needsProfile>[0] & { role: Parameters<typeof homePath>[0] }) {
    onClose()
    navigate(needsProfile(user) ? '/complete-profile' : homePath(user.role))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      go(await login(email, password))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogle() {
    setError('')
    setLoading(true)
    try {
      go(await googleAuth())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google sign-in failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="tf-modal-backdrop" onClick={onClose}>
      <div className="tf-login-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="tf-modal-top-caret">◆</div>
        <button className="tf-close-modal-x" type="button" onClick={onClose}>✕</button>

        <div className="tf-login-card-body">
          <h3 className="tf-login-title">Sign in to SmartHR</h3>

          {error && <div className="tf-auth-error">{error}</div>}

          <form onSubmit={handleSubmit} className="tf-login-form">
            <div className="tf-form-group">
              <input
                type="email"
                className="tf-modal-input"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="tf-form-group">
              <input
                type="password"
                className="tf-modal-input"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="tf-auth-btns-row">
              <button type="submit" className="tf-solid-login-btn" disabled={loading}>
                {loading ? 'SIGNING IN...' : 'LOGIN'}
              </button>
              <Link to="/signup" className="tf-outline-register-btn" onClick={onClose}>
                REGISTER
              </Link>
            </div>
          </form>

          <div className="tf-or-divider">
            <span>or</span>
          </div>

          <div className="tf-social-btns-stack">
            <button type="button" className="tf-social-btn google" onClick={() => void handleGoogle()} disabled={loading}>
              <span className="icon">G</span> Continue with Google
            </button>
          </div>

          <div style={{ marginTop: '1.2rem', fontSize: '0.82rem', color: '#666', textAlign: 'center' }}>
            No account? <Link to="/signup" onClick={onClose} style={{ color: 'var(--purple-dark)', fontWeight: 700 }}>Create one</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
