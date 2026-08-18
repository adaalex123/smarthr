import { Fragment, useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../AuthContext'
import { apiRequest } from '../api/client'
import type { JobSummary, RankedApplicant } from '../types/jobs'
import RichTextarea from '../components/RichTextarea'
import '../styles/recruiter-workspace.css'

const emptyJob = {
  title: '',
  description: '',
  requirements: '',
  location: '',
}

export default function RecruiterWorkspacePage() {
  const { user, logout } = useAuth()
  const [jobs, setJobs] = useState<JobSummary[]>([])
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [applicants, setApplicants] = useState<RankedApplicant[]>([])
  const [form, setForm] = useState(emptyJob)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [openWhy, setOpenWhy] = useState<number | null>(null)

  const selectedJob = jobs.find((job) => job.id === selectedId) ?? null

  async function loadJobs() {
    const data = await apiRequest<{ jobs?: JobSummary[] }>('/recruiter/jobs')
    setJobs(data.jobs ?? [])
    if (!selectedId && data.jobs?.[0]) setSelectedId(data.jobs[0].id)
  }

  async function loadApplicants(jobId: number) {
    const data = await apiRequest<{ applicants?: RankedApplicant[] }>(`/recruiter/jobs/${jobId}/applicants`)
    setApplicants(data.applicants ?? [])
  }

  useEffect(() => {
    void loadJobs().catch((err) =>
      setError(err instanceof Error ? err.message : 'Could not load recruiter data'),
    )
  }, [])

  useEffect(() => {
    if (!selectedId) {
      setApplicants([])
      return
    }
    void loadApplicants(selectedId).catch((err) => setError(err instanceof Error ? err.message : 'Could not load applicants'))
  }, [selectedId])

  async function onCreate(event: FormEvent) {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      const data = await apiRequest<{ job?: JobSummary }>('/recruiter/jobs', {
        method: 'POST',
        body: JSON.stringify(form),
      })
      if (data.job) {
        setJobs((current) => [data.job!, ...current])
        setSelectedId(data.job.id)
        setForm(emptyJob)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create job')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="recruiter-workspace">
      <header className="rw-top">
        <div>
          <h1>SmartHR ranking workspace</h1>
          <p>{user?.fullName || user?.email} · Applicants are ranked by semantic overlap with your job description, then explained.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Link to="/recruiter/applications" className="rw-ghost">All applications</Link>
          <button className="rw-ghost" type="button" onClick={() => void logout()}>Log out</button>
        </div>
      </header>

      {error && <div className="rw-banner">{error}</div>}

      <div className="rw-grid">
        <section className="rw-card">
          <h2>Post a job</h2>
          <form onSubmit={onCreate}>
            <label htmlFor="title">Job title</label>
            <input id="title" value={form.title} onChange={(e) => setForm((c) => ({ ...c, title: e.target.value }))} placeholder="Senior React Engineer" />
            <label htmlFor="location">Location (optional)</label>
            <input id="location" value={form.location} onChange={(e) => setForm((c) => ({ ...c, location: e.target.value }))} placeholder="Remote / Lagos" />
            <label htmlFor="description">Job description</label>
            <RichTextarea
              id="description"
              value={form.description}
              onChange={(value) => setForm((c) => ({ ...c, description: value }))}
              placeholder={'## About the role\n\nWhat this person will do and own.\n\n## Stack\n\n- React, TypeScript\n- Node.js, PostgreSQL\n\n## What success looks like\n\nClear outcomes, not just activities.'}
              rows={10}
            />
            <label htmlFor="requirements">Required skills (comma-separated)</label>
            <input id="requirements" value={form.requirements} onChange={(e) => setForm((c) => ({ ...c, requirements: e.target.value }))} placeholder="React, TypeScript, Node.js, PostgreSQL" />
            <button className="rw-primary" type="submit" disabled={busy}>{busy ? 'Publishing...' : 'Publish job'}</button>
          </form>
        </section>

        <section className="rw-card">
          <h2>Your jobs</h2>
          {jobs.length === 0 ? <p className="rw-muted">No jobs yet. Publish one to start ranking applicants.</p> : (
            <ul className="rw-jobs">
              {jobs.map((job) => (
                <li key={job.id}>
                  <button type="button" className={job.id === selectedId ? 'active' : ''} onClick={() => setSelectedId(job.id)}>
                    <strong>{job.title}</strong>
                    <span>{job._count?.applications ?? 0} applicants</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="rw-card">
        <div className="rw-jobhead">
          <div>
            <h2>{selectedJob ? `Ranked applicants · ${selectedJob.title}` : 'Ranked applicants'}</h2>
            {selectedJob && (
              <p className="rw-muted">
                Share apply link: <code>{`${window.location.origin}/jobs/${selectedJob.id}/apply`}</code>
              </p>
            )}
          </div>
        </div>
        {!selectedJob ? <p className="rw-muted">Select a job to see ranked applicants and why they scored that way.</p> : applicants.length === 0 ? (
          <p className="rw-muted">No applications yet. Send the apply link to candidates.</p>
        ) : (
          <div className="rw-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Candidate</th>
                  <th>Match</th>
                  <th>Semantic</th>
                  <th>Skills</th>
                  <th>Why</th>
                </tr>
              </thead>
              <tbody>
                {applicants.map((applicant) => (
                  <Fragment key={applicant.id}>
                    <tr>
                      <td>{applicant.rank}</td>
                      <td>
                        <strong>{applicant.fullName}</strong>
                        <div className="rw-muted">{applicant.email}</div>
                      </td>
                      <td><span className="rw-score">{applicant.matchScore}%</span></td>
                      <td>{applicant.semanticScore}%</td>
                      <td>{applicant.skillScore}%</td>
                      <td>
                        <button type="button" className="rw-link" onClick={() => setOpenWhy(openWhy === applicant.id ? null : applicant.id)}>
                          {openWhy === applicant.id ? 'Hide' : 'Show why'}
                        </button>
                      </td>
                    </tr>
                    {openWhy === applicant.id && (
                      <tr className="rw-why">
                        <td colSpan={6}>
                          <p>{applicant.explanation.summary}</p>
                          <p><strong>Matched skills:</strong> {applicant.explanation.matchedSkills.join(', ') || 'None'}</p>
                          <p><strong>Missing skills:</strong> {applicant.explanation.missingSkills.join(', ') || 'None'}</p>
                          <p><strong>Overlapping terms:</strong> {applicant.explanation.overlappingTerms.map((term) => term.term).join(', ') || 'None'}</p>
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
