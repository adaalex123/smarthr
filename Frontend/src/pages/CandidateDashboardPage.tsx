import { Fragment, useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../AuthContext'
import { apiRequest } from '../api/client'
import type { CandidateApplication, EmployerTrend, RankingExplanation } from '../types/jobs'
import '../styles/candidate-dashboard.css'

type NavId = 'dashboard' | 'jobs' | 'profile' | 'messages' | 'settings'

type DashboardData = {
  applications?: CandidateApplication[]
  stats?: {
    total: number
    avgScore: number | null
    companies: number
    thisWeek: number
  }
  trends?: EmployerTrend[]
}

const NAV: { id: NavId; label: string }[] = [
  { id: 'dashboard', label: 'User Dashboard' },
  { id: 'profile', label: 'My Profile' },
  { id: 'jobs', label: 'My Jobs' },
  { id: 'messages', label: 'Messages' },
  { id: 'settings', label: 'Settings' },
]

function chartGeometry(values: number[]) {
  const max = Math.max(...values, 1)
  const points = values.map((value, index) => {
    const x = 24 + (index * 512) / Math.max(values.length - 1, 1)
    const y = 210 - (value / max) * 160
    return { x, y }
  })
  return {
    line: points.map((point) => `${point.x},${point.y}`).join(' '),
    area: points.length
      ? `M ${points[0].x},210 L ${points.map((point) => `${point.x},${point.y}`).join(' ')} L ${points[points.length - 1].x},210 Z`
      : '',
  }
}

function Why({ explanation }: { explanation: RankingExplanation }) {
  return (
    <div className="cd-why">
      <p>{explanation.summary}</p>
      <p><strong>Matched:</strong> {explanation.matchedSkills.join(', ') || 'None'}</p>
      <p><strong>Missing:</strong> {explanation.missingSkills.join(', ') || 'None'}</p>
    </div>
  )
}

export default function CandidateDashboardPage() {
  const { user, logout, accessToken, completeProfile } = useAuth()
  const navigate = useNavigate()
  const [activeNav, setActiveNav] = useState<NavId>('dashboard')
  const [dashboard, setDashboard] = useState<DashboardData | null>(null)
  const [messages, setMessages] = useState<Array<{ id: number; subject: string }>>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [openWhy, setOpenWhy] = useState<number | null>(null)
  const [fullName, setFullName] = useState(user?.fullName ?? '')
  const [phone, setPhone] = useState(user?.phone ?? '')
  const [saved, setSaved] = useState('')
  const [busy, setBusy] = useState(false)

  const displayName = user?.fullName || user?.email?.split('@')[0] || 'Candidate'
  const initials = displayName.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase()

  async function loadAll() {
    const [dash, messagesData] = await Promise.all([
      apiRequest<DashboardData>('/candidate/dashboard'),
      apiRequest<{ messages?: Array<{ id: number; subject: string }> }>('/candidate/messages'),
    ])
    setDashboard(dash)
    setMessages(messagesData.messages ?? [])
  }

  useEffect(() => {
    if (!accessToken) return
    setLoading(true)
    void loadAll()
      .then(() => setError(''))
      .catch((err) => setError(err instanceof Error ? err.message : 'Could not load candidate dashboard'))
      .finally(() => setLoading(false))
  }, [accessToken])

  const stats = dashboard?.stats
  const applications = dashboard?.applications ?? []
  const trends = dashboard?.trends ?? []
  const trendValues = trends.map((item) => item.value)
  const hasTrendActivity = trendValues.some((value) => value > 0)
  const chart = chartGeometry(trendValues)
  const section = NAV.find((item) => item.id === activeNav)?.label ?? 'User Dashboard'

  const statCards = useMemo(() => ([
    { label: 'Applied jobs', value: String(stats?.total ?? 0), tone: 'green' as const },
    { label: 'Companies', value: String(stats?.companies ?? 0), tone: 'pink' as const },
    { label: 'This week', value: String(stats?.thisWeek ?? 0), tone: 'blue' as const },
    { label: 'Avg. match', value: stats?.avgScore == null ? '—' : `${stats.avgScore}%`, tone: 'red' as const },
  ]), [stats])

  if (!accessToken) return <Navigate to="/login" replace />

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  async function onSaveProfile(event: FormEvent) {
    event.preventDefault()
    setBusy(true)
    setError('')
    setSaved('')
    try {
      await completeProfile({ fullName: fullName.trim(), phone: phone.trim() || undefined })
      setSaved('Profile saved')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save profile')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="cd-shell">
      <aside className="cd-sidebar">
        <div className="cd-brand">SmartHR</div>
        <div className="cd-profile">
          <div className="cd-avatar">{initials}</div>
          <strong>{displayName}</strong>
          <p>Job seeker</p>
        </div>
        <p className="cd-nav-label">Main Navigation</p>
        <nav className="cd-nav">
          {NAV.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`cd-nav-item${activeNav === item.id ? ' active' : ''}`}
              onClick={() => setActiveNav(item.id)}
            >
              {item.label}
            </button>
          ))}
          <button type="button" className="cd-nav-item" onClick={() => void handleLogout()}>Log Out</button>
        </nav>
      </aside>

      <main className="cd-main">
        <header className="cd-topbar">
          <div>
            <h1>Candidate Dashboard</h1>
            <p>Candidate / {section}</p>
          </div>
          <Link to="/" className="cd-topbar-btn">Browse jobs</Link>
        </header>

        {error && <div className="cd-banner">{error}</div>}
        {saved && <div className="cd-success">{saved}</div>}
        {loading && <p className="cd-muted">Loading...</p>}

        {activeNav === 'dashboard' && (
          <>
            <section className="cd-stat-row">
              {statCards.map((card) => (
                <article key={card.label} className="cd-stat-card">
                  <div className={`cd-stat-icon cd-stat-icon--${card.tone}`} />
                  <div>
                    <span className="cd-stat-num">{card.value}</span>
                    <span className="cd-stat-label">{card.label}</span>
                  </div>
                </article>
              ))}
            </section>
            <section className="cd-content">
              <article className="cd-panel">
                <h2>Recently Applied Jobs</h2>
                {applications.length === 0 ? (
                  <div className="cd-empty">
                    <p>No applications yet</p>
                    <Link to="/" className="cd-cta-btn">Browse open roles</Link>
                  </div>
                ) : (
                  <div className="cd-job-list">
                    {applications.slice(0, 6).map((application) => (
                      <div key={application.id} className="cd-job-row">
                        <div className="cd-job-mark">{application.company[0]?.toUpperCase()}</div>
                        <div>
                          <strong>{application.jobTitle}</strong>
                          <p>{application.company}{application.location ? ` · ${application.location}` : ''}</p>
                        </div>
                        <span className="cd-score-pill">{application.matchScore}%</span>
                      </div>
                    ))}
                  </div>
                )}
              </article>
              <article className="cd-panel">
                <h2>Applications this week</h2>
                {!hasTrendActivity ? (
                  <div className="cd-empty">
                    <p>No application activity yet</p>
                    <span>A weekly chart appears after you apply.</span>
                  </div>
                ) : (
                  <div className="cd-chart-wrap">
                    <svg viewBox="0 0 560 240" className="cd-chart" role="img" aria-label="Weekly applications">
                      <path className="cd-chart-area" d={chart.area} />
                      <polyline className="cd-chart-line" points={chart.line} />
                    </svg>
                    <div className="cd-chart-legend">
                      {trends.map((point) => (
                        <span key={point.label}>{point.label.slice(5)} · {point.value}</span>
                      ))}
                    </div>
                  </div>
                )}
              </article>
            </section>
          </>
        )}

        {activeNav === 'jobs' && (
          <section className="cd-panel">
            <h2>My applications</h2>
            {applications.length === 0 ? (
              <div className="cd-empty">
                <p>No applications yet</p>
                <Link to="/" className="cd-cta-btn">Find a role to apply</Link>
              </div>
            ) : (
              <div className="cd-table-wrap">
                <table className="cd-table">
                  <thead>
                    <tr>
                      <th>Job</th>
                      <th>Company</th>
                      <th>Match</th>
                      <th>Applied</th>
                      <th>Why</th>
                    </tr>
                  </thead>
                  <tbody>
                    {applications.map((application) => (
                      <Fragment key={application.id}>
                        <tr>
                          <td>
                            <strong>{application.jobTitle}</strong>
                            <div className="cd-muted">{application.location || 'No location'}</div>
                          </td>
                          <td>{application.company}</td>
                          <td><span className="cd-score-pill">{application.matchScore}%</span></td>
                          <td className="cd-muted">{new Date(application.createdAt).toLocaleDateString()}</td>
                          <td>
                            <button type="button" className="cd-text-btn" onClick={() => setOpenWhy(openWhy === application.id ? null : application.id)}>
                              {openWhy === application.id ? 'Hide' : 'Show why'}
                            </button>
                          </td>
                        </tr>
                        {openWhy === application.id && (
                          <tr>
                            <td colSpan={5}><Why explanation={application.explanation} /></td>
                          </tr>
                        )}
                      </Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {(activeNav === 'profile' || activeNav === 'settings') && (
          <section className="cd-panel cd-panel--narrow">
            <h2>{activeNav === 'profile' ? 'My profile' : 'Account settings'}</h2>
            <form className="cd-form" onSubmit={(event) => void onSaveProfile(event)}>
              <label htmlFor="candidate-name">Full name</label>
              <input id="candidate-name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
              <label htmlFor="candidate-phone">Phone</label>
              <input id="candidate-phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
              <p className="cd-muted">{user?.email}</p>
              <button className="cd-topbar-btn" type="submit" disabled={busy}>{busy ? 'Saving...' : 'Save profile'}</button>
            </form>
          </section>
        )}

        {activeNav === 'messages' && (
          <section className="cd-panel">
            <h2>Messages</h2>
            {messages.length === 0 ? (
              <div className="cd-empty">
                <p>Inbox is empty</p>
                <span>There is no messaging thread data yet for this account.</span>
              </div>
            ) : (
              <div className="cd-job-list">
                {messages.map((message) => (
                  <div key={message.id} className="cd-job-row">
                    <strong>{message.subject}</strong>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  )
}
