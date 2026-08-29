import { useEffect, useState, type FormEvent, type ChangeEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../AuthContext'
import { apiRequest } from '../api/client'
import { homePath } from '../types/auth'
import type { PublicJob, RankingExplanation } from '../types/jobs'
import '../styles/recruiter-workspace.css'

type ApplyResult = {
  matchScore: number
  semanticScore: number
  skillScore: number
  explanation: RankingExplanation
}

export default function ApplyJobPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const [job, setJob] = useState<PublicJob | null>(null)

  const [form, setForm] = useState({
    fullName: user?.fullName?? '',
    email: user?.email?? '',
    resumeText: '',
    resumeFile: null as File | null,
  })

  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState<ApplyResult | null>(null)
  const signedIn = Boolean(user)
  const dashboardPath = user? homePath(user.role) : '/login'

  useEffect(() => {
    if (!user) return
    setForm((current) => ({
     ...current,
      fullName: current.fullName || user.fullName || '',
      email: user.email,
    }))
  }, [user])

  useEffect(() => {
    if (!id) return
    void apiRequest<{ job?: PublicJob }>(`/jobs/${id}`)
     .then((data) => setJob(data.job?? null))
     .catch((err) => setError(err instanceof Error? err.message : 'Job not found'))
  }, [id])

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setForm((c) => ({...c, resumeFile: e.target.files![0], resumeText: '' }))
    }
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    if (!id) return
    setBusy(true)
    setError('')
    try {
      const formData = new FormData()
      formData.append('fullName', form.fullName)
      formData.append('email', form.email)
      if (form.resumeFile) {
        formData.append('resumeFile', form.resumeFile)
      } else {
        formData.append('resumeText', form.resumeText)
      }

      const data = await apiRequest<{ application?: ApplyResult }>(`/jobs/${id}/apply`, {
        method: 'POST',
        body: formData,
      })
      if (data.application) setResult(data.application)
    } catch (err) {
      setError(err instanceof Error? err.message : 'Could not submit application')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="recruiter-workspace">
      <header className="rw-top">
        <div>
          <h1>{job?.title?? 'Apply'}</h1>
          <p>{job? `${job.companyName}${job.location? ` · ${job.location}` : ''}` : 'Loading job...'}</p>
        </div>
        <Link to="/" className="rw-ghost">Back home</Link>
      </header>

      {error && <div className="rw-banner">{error}</div>}

      {job &&!result && (
        <div className="rw-grid">
          <section className="rw-card">
            <h2>Role</h2>
            <p>{job.description}</p>
            <p><strong>Required skills:</strong> {job.requirements}</p>
          </section>
          <section className="rw-card">
            <h2>Apply with your resume</h2>
            <form onSubmit={onSubmit} encType="multipart/form-data">
              <label htmlFor="fullName">Full name</label>
              <input id="fullName" name="fullName" value={form.fullName} onChange={(e) => setForm((c) => ({...c, fullName: e.target.value }))} required />

              <label htmlFor="email">Email</label>
              <input id="email" name="email" type="email" value={form.email} onChange={(e) => setForm((c) => ({...c, email: e.target.value }))} readOnly={signedIn} required />

              <label htmlFor="resumeFile">Upload Resume / CV</label>
              <input
                id="resumeFile"
                name="resumeFile"
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
              />
              {form.resumeFile && <p className="rw-muted">Selected: {form.resumeFile.name}</p>}

              <label htmlFor="resumeText">Or Paste resume text</label>
              <textarea
                id="resumeText"
                name="resumeText"
                rows={6}
                value={form.resumeText}
                onChange={(e) => setForm((c) => ({...c, resumeText: e.target.value, resumeFile: null }))}
                placeholder="Paste resume text if you prefer not to upload a file."
              />
              <button className="rw-primary" type="submit" disabled={busy || (!form.resumeFile &&!form.resumeText)}>
                {busy? 'Scoring...' : 'Submit application'}
              </button>
            </form>
          </section>
        </div>
      )}

      {result && (
        <section className="rw-card">
          <h2>Application received</h2>
          <p>Your match score against this job is <strong>{result.matchScore}%</strong>.</p>
          <p>{result.explanation.summary}</p>
          <p><strong>Matched skills:</strong> {result.explanation.matchedSkills.join(', ') || 'None'}</p>
          <p><strong>Missing skills:</strong> {result.explanation.missingSkills.join(', ') || 'None'}</p>
          <p className="rw-muted">The recruiter sees the same explanation so ranking stays transparent.</p>
          <p>
            <Link to={dashboardPath}>{user?.role === 'candidate'? 'Open candidate dashboard' : 'Back to workspace'}</Link>
            {' · '}
            <Link to="/">Browse more roles</Link>
          </p>
        </section>
      )}
    </div>
  )
}
