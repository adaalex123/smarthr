import { Fragment, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../AuthContext'
import { apiRequest } from '../api/client'
import type { RecruiterApplication, RankingExplanation } from '../types/jobs'
import '../styles/recruiter-workspace.css'

function ExplanationRow({ explanation }: { explanation: RankingExplanation }) {
  return (
    <div className="rw-explanation">
      <p>{explanation.summary}</p>
      {explanation.matchedSkills.length > 0 && (
        <p>
          <strong>Matched:</strong>{' '}
          {explanation.matchedSkills.map((skill) => (
            <span key={skill} className="rw-tag rw-tag--green">{skill}</span>
          ))}
        </p>
      )}
      {explanation.missingSkills.length > 0 && (
        <p>
          <strong>Missing:</strong>{' '}
          {explanation.missingSkills.map((skill) => (
            <span key={skill} className="rw-tag rw-tag--red">{skill}</span>
          ))}
        </p>
      )}
    </div>
  )
}

type Filters = {
  jobId: string
  minScore: string
  search: string
}

export default function AllApplicationsPage() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [applications, setApplications] = useState<RecruiterApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [openId, setOpenId] = useState<number | null>(null)
  const [filters, setFilters] = useState<Filters>({ jobId: '', minScore: '', search: '' })

  useEffect(() => {
    void apiRequest<{ applications?: RecruiterApplication[] }>('/recruiter/applications')
      .then((data) => setApplications(data.applications ?? []))
      .catch((err) => setError(err instanceof Error ? err.message : 'Could not load applications'))
      .finally(() => setLoading(false))
  }, [])

  const jobOptions = useMemo(() => {
    const seen = new Map<number, string>()
    for (const app of applications) {
      if (!seen.has(app.job.id)) seen.set(app.job.id, app.job.title)
    }
    return [...seen.entries()]
  }, [applications])

  const visible = useMemo(() => {
    const minScore = filters.minScore ? Number(filters.minScore) : 0
    const search = filters.search.toLowerCase()
    return applications.filter((app) => {
      if (filters.jobId && app.job.id !== Number(filters.jobId)) return false
      if (app.matchScore < minScore) return false
      if (search && !app.fullName.toLowerCase().includes(search) && !app.email.toLowerCase().includes(search)) return false
      return true
    })
  }, [applications, filters])

  function setFilter<K extends keyof Filters>(key: K, value: Filters[K]) {
    setFilters((current) => ({ ...current, [key]: value }))
  }

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  return (
    <div className="recruiter-workspace">
      <header className="rw-top">
        <div>
          <h1>All applications</h1>
          <p>Every candidate across all your job posts, filtered and ranked by match score.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Link to="/employer" className="rw-ghost">Workspace</Link>
          <button type="button" className="rw-ghost" onClick={() => void handleLogout()}>Log out</button>
        </div>
      </header>

      {error && <div className="rw-banner">{error}</div>}

      <section className="rw-card">
        <div className="rw-filters">
          <div>
            <label htmlFor="filter-job">Job</label>
            <select
              id="filter-job"
              value={filters.jobId}
              onChange={(e) => setFilter('jobId', e.target.value)}
            >
              <option value="">All jobs</option>
              {jobOptions.map(([id, title]) => (
                <option key={id} value={String(id)}>{title}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="filter-score">Min match %</label>
            <input
              id="filter-score"
              type="number"
              min="0"
              max="100"
              placeholder="0"
              value={filters.minScore}
              onChange={(e) => setFilter('minScore', e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="filter-search">Search name / email</label>
            <input
              id="filter-search"
              type="search"
              placeholder="Ada Johnson"
              value={filters.search}
              onChange={(e) => setFilter('search', e.target.value)}
            />
          </div>
          <p className="rw-muted" style={{ alignSelf: 'flex-end', marginBottom: '0.3rem' }}>
            {visible.length} of {applications.length} applications
          </p>
        </div>
      </section>

      <section className="rw-card">
        {loading ? (
          <p className="rw-muted">Loading...</p>
        ) : visible.length === 0 ? (
          <p className="rw-muted">No applications match those filters.</p>
        ) : (
          <div className="rw-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Candidate</th>
                  <th>Job</th>
                  <th>Match</th>
                  <th>Semantic</th>
                  <th>Skills</th>
                  <th>Submitted</th>
                  <th>Why</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((app) => (
                  <Fragment key={app.id}>
                    <tr>
                      <td>
                        <strong>{app.fullName}</strong>
                        <div className="rw-muted">{app.email}</div>
                      </td>
                      <td>{app.job.title}</td>
                      <td><span className="rw-score">{app.matchScore}%</span></td>
                      <td>{app.semanticScore}%</td>
                      <td>{app.skillScore}%</td>
                      <td>{new Date(app.createdAt).toLocaleDateString()}</td>
                      <td>
                        <button
                          type="button"
                          className="rw-link"
                          onClick={() => setOpenId(openId === app.id ? null : app.id)}
                        >
                          {openId === app.id ? 'Hide' : 'Show why'}
                        </button>
                      </td>
                    </tr>
                    {openId === app.id && (
                      <tr className="rw-why">
                        <td colSpan={7}>
                          <ExplanationRow explanation={app.explanation} />
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
    </div>
  )
}
