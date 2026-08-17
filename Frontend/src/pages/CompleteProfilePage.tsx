import { useState, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../AuthContext'
import { homePath, needsProfile } from '../types/auth'

export default function CompleteProfilePage() {
  const { user, completeProfile, logout, accessToken } = useAuth()
  const navigate = useNavigate()
  const [fullName, setFullName] = useState(user?.fullName ?? '')
  const [phone, setPhone] = useState(user?.phone ?? '')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  if (!accessToken) return <Navigate to="/login" replace />
  if (user && !needsProfile(user)) return <Navigate to={homePath(user.role)} replace />

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    if (fullName.trim().length < 2) {
      setError('Enter your full name')
      return
    }
    setBusy(true)
    setError('')
    try {
      const next = await completeProfile({ fullName: fullName.trim(), phone: phone.trim() || undefined })
      navigate(homePath(next.role))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save profile')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="auth-shell">
      <aside className="auth-brand">
        <div>
          <h1>SmartHR</h1>
          <p>Finish your profile so we know who you are.</p>
        </div>
      </aside>
      <main className="auth-panel">
        <div className="auth-card">
          <h2>Complete your profile</h2>
          {error && <div className="banner">{error}</div>}
          <form onSubmit={onSubmit}>
            <div className="form-grid">
              <div className="field full">
                <label htmlFor="fullName">Full name</label>
                <input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} />
              </div>
              <div className="field full">
                <label htmlFor="phone">Phone (optional)</label>
                <input id="phone" value={phone ?? ''} onChange={(e) => setPhone(e.target.value)} />
              </div>
            </div>
            <div className="actions">
              <button className="btn btn-primary" type="submit" disabled={busy}>
                {busy ? 'Saving...' : 'Save and continue'}
              </button>
            </div>
          </form>
          <button type="button" className="link" style={{ background: 'none', border: 0, marginTop: '1rem', cursor: 'pointer' }} onClick={() => void logout()}>
            Log out
          </button>
        </div>
      </main>
    </div>
  )
}
