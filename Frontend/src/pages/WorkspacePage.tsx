import { Fragment, useEffect, useMemo, useState, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../AuthContext'
import { apiRequest } from '../api/client'
import RichTextarea from '../components/RichTextarea'
import type {
  EmployerCandidate,
  EmployerTrend,
  JobSummary,
  RecruiterApplication,
} from '../types/jobs'
import '../styles/employer-dashboard.css'

type NavId = 'dashboard' | 'jobs' | 'applicants' | 'candidates' | 'messages' | 'settings'

type DashboardData = {
  stats?: {
    postedJobs: number
    allApplicants: number
    uniqueCandidates: number
    avgMatchScore: number | null
  }
  recentApplicants?: Array<{
    id: number
    fullName: string
    email: string
    matchScore: number
    jobTitle: string
    createdAt: string
  }>
  trends?: EmployerTrend[]
}

const NAV: { id: NavId; label: string }[] = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'jobs', label: 'My Jobs' },
  { id: 'applicants', label: 'Applicants' },
  { id: 'candidates', label: 'Candidates' },
  { id: 'messages', label: 'Messages' },
  { id: 'settings', label: 'Settings' },
]

const emptyJob = { title: '', description: '', requirements: '', location: '' }

function chartPoints(values: number[]) {
  const max = Math.max(...values, 1)
  return values
    .map((value, index) => {
      const x = 24 + (index * 512) / Math.max(values.length - 1, 1)
      const y = 210 - (value / max) * 160
      return `${x},${y}`
    })
    .join(' ')
}

export default function WorkspacePage() {
  const { user, logout, accessToken, completeProfile } = useAuth()
  const navigate = useNavigate()
  const [activeNav, setActiveNav] = useState<NavId>('dashboard')
  const [dashboard, setDashboard] = useState<DashboardData | null>(null)
  const [jobs, setJobs] = useState<JobSummary[]>([])
  const [applications, setApplications] = useState<RecruiterApplication[]>([])
  const [candidates, setCandidates] = useState<EmployerCandidate[]>([])
  const [messages, setMessages] = useState<Array<{ id: number; subject: string }>>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [form, setForm] = useState(emptyJob)
  const [busy, setBusy] = useState(false)
  const [openWhy, setOpenWhy] = useState<number | null>(null)
  const [fullName, setFullName] = useState(user?.fullName ?? '')
  const [phone, setPhone] = useState(user?.phone ?? '')
  const [saved, setSaved] = useState('')

  const displayName = user?.fullName || user?.email?.split('@')[0] || 'Employer'
  const initials = displayName.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase()

  async function loadAll() {
    const [dash, jobsData, appsData, candidatesData, messagesData] = await Promise.all([
      apiRequest<DashboardData>('/employer/dashboard'),
      apiRequest<{ jobs?: JobSummary[] }>('/employer/jobs'),
      apiRequest<{ applications?: RecruiterApplication[] }>('/employer/applications'),
      apiRequest<{ candidates?: EmployerCandidate[] }>('/employer/candidates'),
      apiRequest<{ messages?: Array<{ id: number; subject: string }> }>('/employer/messages'),
    ])
    setDashboard(dash)
    setJobs(jobsData.jobs ?? [])
    setApplications(appsData.applications ?? [])
    setCandidates(candidatesData.candidates ?? [])
    setMessages(messagesData.messages ?? [])
  }

  useEffect(() => {
    if (!accessToken) return
    setLoading(true)
    void loadAll()
      .then(() => setError(''))
      .catch((err) => setError(err instanceof Error ? err.message : 'Could not load employer workspace'))
      .finally(() => setLoading(false))
  }, [accessToken])

  const stats = dashboard?.stats
  const trends = dashboard?.trends ?? []
  const trendValues = trends.map((item) => item.value)
  const hasTrendActivity = trendValues.some((value) => value > 0)
  const section = NAV.find((item) => item.id === activeNav)?.label ?? 'Dashboard'
  const applyOrigin = typeof window === 'undefined' ? '' : window.location.origin

  const statCards = useMemo(() => ([
    { label: 'Posted Jobs', value: String(stats?.postedJobs ?? 0), tone: 'green' as const },
    { label: 'All Applicants', value: String(stats?.allApplicants ?? 0), tone: 'pink' as const },
    { label: 'Candidates', value: String(stats?.uniqueCandidates ?? 0), tone: 'blue' as const },
    { label: 'Avg. Match', value: stats?.avgMatchScore == null ? '—' : `${stats.avgMatchScore}%`, tone: 'red' as const },
  ]), [stats])

  if (!accessToken) return <Navigate to="/login" replace />

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  async function onCreateJob(event: FormEvent) {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      const data = await apiRequest<{ job?: JobSummary }>('/employer/jobs', {
        method: 'POST',
        body: JSON.stringify(form),
      })
      if (data.job) {
        setJobs((current) => [data.job!, ...current])
        setForm(emptyJob)
        await loadAll()
        setActiveNav('jobs')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create job')
    } finally {
      setBusy(false)
    }
  }

  async function onSaveSettings(event: FormEvent) {
    event.preventDefault()
    setBusy(true)
    setError('')
    setSaved('')
    try {
      await completeProfile({ fullName: fullName.trim(), phone: phone.trim() || undefined })
      setSaved('Profile saved')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save settings')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="ed-shell">
      <aside className="ed-sidebar">
        <div className="ed-brand-mark">SmartHR</div>
        <div className="ed-profile">
          <div className="ed-avatar">{initials}</div>
          <strong>{displayName}</strong>
          <p>Employer / Recruiter</p>
        </div>
        <p className="ed-nav-label">Main Navigation</p>
        <nav className="ed-nav">
          {NAV.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`ed-nav-item${activeNav === item.id ? ' active' : ''}`}
              onClick={() => setActiveNav(item.id)}
            >
              {item.label}
            </button>
          ))}
          <button type="button" className="ed-nav-item" onClick={() => void handleLogout()}>Log Out</button>
        </nav>
      </aside>

      <main className="ed-main">
        <header className="ed-topbar">
          <div>
            <h1>{section}</h1>
            <p>Hiring / {section}</p>
          </div>
          <button type="button" className="ed-post-btn" onClick={() => setActiveNav('jobs')}>
            Post Your Job
          </button>
        </header>

        {error && <div className="ed-banner">{error}</div>}
        {saved && <div className="ed-success">{saved}</div>}
        {loading && <p className="ed-muted">Loading...</p>}

        {activeNav === 'dashboard' && (
          <>
            <section className="ed-stats">
              {statCards.map((card) => (
                <article key={card.label} className="ed-card">
                  <div className={`ed-icon ed-icon--${card.tone}`} />
                  <div>
                    <strong>{card.value}</strong>
                    <p>{card.label}</p>
                  </div>
                </article>
              ))}
            </section>
            <section className="ed-content">
              <article className="ed-panel">
                <h2>New Applicants</h2>
                {(dashboard?.recentApplicants?.length ?? 0) === 0 ? (
                  <div className="ed-empty">
                    <p>No applicants yet</p>
                    <span>Publish a job and share the apply link.</span>
                  </div>
                ) : (
                  <div className="ed-list">
                    {dashboard?.recentApplicants?.map((applicant) => (
                      <div key={applicant.id} className="ed-list-item">
                        <strong>{applicant.fullName}</strong>
                        <span>{applicant.jobTitle} · {applicant.matchScore}% match</span>
                      </div>
                    ))}
                  </div>
                )}
              </article>
              <article className="ed-panel">
                <h2>Applications this week</h2>
                {!hasTrendActivity ? (
                  <div className="ed-empty">
                    <p>No application activity yet</p>
                    <span>A weekly chart appears after the first application.</span>
                  </div>
                ) : (
                  <div className="ed-chart-wrap">
                    <svg viewBox="0 0 560 240" className="ed-chart" role="img" aria-label="Weekly applications">
                      <polyline points={chartPoints(trendValues)} />
                    </svg>
                    <div className="ed-chart-legend">
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
          <section className="ed-content ed-content--jobs">
            <article className="ed-panel">
              <h2>Post a job</h2>
              <form className="ed-form" onSubmit={(event) => void onCreateJob(event)}>
                <label htmlFor="title">Job title</label>
                <input id="title" value={form.title} onChange={(e) => setForm((c) => ({ ...c, title: e.target.value }))} />
                <label htmlFor="location">Location (optional)</label>
                <input id="location" value={form.location} onChange={(e) => setForm((c) => ({ ...c, location: e.target.value }))} />
                <label htmlFor="description">Job description</label>
                <RichTextarea
                  id="description"
                  value={form.description}
                  onChange={(value) => setForm((c) => ({ ...c, description: value }))}
                  rows={8}
                  placeholder={'## About the role\n\nWhat this person will do.'}
                />
                <label htmlFor="requirements">Required skills</label>
                <input id="requirements" value={form.requirements} onChange={(e) => setForm((c) => ({ ...c, requirements: e.target.value }))} placeholder="React, TypeScript, PostgreSQL" />
                <button className="ed-post-btn" type="submit" disabled={busy}>{busy ? 'Publishing...' : 'Publish job'}</button>
              </form>
            </article>
            <article className="ed-panel">
              <h2>Open roles</h2>
              {jobs.length === 0 ? (
                <div className="ed-empty">
                  <p>No jobs posted</p>
                  <span>Use the form to publish your first role.</span>
                </div>
              ) : (
                <div className="ed-table-wrap">
                  <table className="ed-table">
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Applicants</th>
                        <th>Apply link</th>
                      </tr>
                    </thead>
                    <tbody>
                      {jobs.map((job) => (
                        <tr key={job.id}>
                          <td>
                            <strong>{job.title}</strong>
                            <div className="ed-muted">{job.location || 'No location'}</div>
                          </td>
                          <td>{job._count?.applications ?? 0}</td>
                          <td className="ed-link">{`${applyOrigin}/jobs/${job.id}/apply`}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </article>
          </section>
        )}

        {activeNav === 'applicants' && (
          <section className="ed-panel">
            <h2>All applicants</h2>
            {applications.length === 0 ? (
              <div className="ed-empty">
                <p>No applications yet</p>
                <span>Ranked applicants appear here after people apply.</span>
              </div>
            ) : (
              <div className="ed-table-wrap">
                <table className="ed-table">
                  <thead>
                    <tr>
                      <th>Candidate</th>
                      <th>Job</th>
                      <th>Match</th>
                      <th>Semantic</th>
                      <th>Skills</th>
                      <th>Why</th>
                    </tr>
                  </thead>
                  <tbody>
                    {applications.map((application) => (
                      <Fragment key={application.id}>
                        <tr>
                          <td>
                            <strong>{application.fullName}</strong>
                            <div className="ed-muted">{application.email}</div>
                          </td>
                          <td>{application.job.title}</td>
                          <td><span className="ed-score">{application.matchScore}%</span></td>
                          <td>{application.semanticScore}%</td>
                          <td>{application.skillScore}%</td>
                          <td>
                            <button type="button" className="ed-text-btn" onClick={() => setOpenWhy(openWhy === application.id ? null : application.id)}>
                              {openWhy === application.id ? 'Hide' : 'Show why'}
                            </button>
                          </td>
                        </tr>
                        {openWhy === application.id && (
                          <tr className="ed-why">
                            <td colSpan={6}>
                              <p>{application.explanation.summary}</p>
                              <p><strong>Matched:</strong> {application.explanation.matchedSkills.join(', ') || 'None'}</p>
                              <p><strong>Missing:</strong> {application.explanation.missingSkills.join(', ') || 'None'}</p>
                            </td>
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

        {activeNav === 'candidates' && (
          <section className="ed-panel">
            <h2>Candidate pool</h2>
            {candidates.length === 0 ? (
              <div className="ed-empty">
                <p>No candidates yet</p>
                <span>People who apply are grouped here by email.</span>
              </div>
            ) : (
              <div className="ed-candidate-grid">
                {candidates.map((candidate) => (
                  <article key={candidate.email} className="ed-candidate-card">
                    <div className="ed-avatar">{candidate.fullName[0]?.toUpperCase()}</div>
                    <strong>{candidate.fullName}</strong>
                    <p>{candidate.email}</p>
                    <p>Best match {candidate.bestScore}% · {candidate.applications} application{candidate.applications === 1 ? '' : 's'}</p>
                    <span>Latest: {candidate.latestJobTitle}</span>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}

        {activeNav === 'messages' && (
          <section className="ed-panel">
            <h2>Messages</h2>
            {messages.length === 0 ? (
              <div className="ed-empty">
                <p>Inbox is empty</p>
                <span>There is no messaging thread data yet for this account.</span>
              </div>
            ) : (
              <div className="ed-list">
                {messages.map((message) => (
                  <div key={message.id} className="ed-list-item">
                    <strong>{message.subject}</strong>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {activeNav === 'settings' && (
          <section className="ed-panel ed-panel--narrow">
            <h2>Account settings</h2>
            <form className="ed-form" onSubmit={(event) => void onSaveSettings(event)}>
              <label htmlFor="settings-name">Full name</label>
              <input id="settings-name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
              <label htmlFor="settings-phone">Phone</label>
              <input id="settings-phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
              <p className="ed-muted">{user?.email}</p>
              <button className="ed-post-btn" type="submit" disabled={busy}>{busy ? 'Saving...' : 'Save settings'}</button>
            </form>
          </section>
        )}
      </main>
    </div>
  )
}
