import { useState, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import {
  RECRUITER_COUNTRIES,
  RECRUITER_INDUSTRIES,
  RECRUITER_JOB_TITLES,
  emptyRecruiterSignupForm,
} from '../constants/recruiterSignup'
import { apiErrorFields } from '../api/client'
import { useAuth } from '../AuthContext'
import { homePath, isHiringRole, needsProfile } from '../types/auth'
import { recruiterProfileFromForm, validateRecruiterSignup } from '../utils/validation'
import '../styles/signup.css'

function fieldError(errors: Record<string, string>, key: string) {
  return errors[key] ? <span className="field-error">{errors[key]}</span> : null
}

export default function CompleteProfilePage() {
  const { user, completeProfile, logout, accessToken } = useAuth()
  const navigate = useNavigate()
  const isHiring = user ? isHiringRole(user.role) : false

  const [fullName, setFullName] = useState(user?.fullName ?? '')
  const [phone, setPhone] = useState(user?.phone ?? '')
  const [recruiterForm, setRecruiterForm] = useState(() => ({
    ...emptyRecruiterSignupForm(),
    fullName: user?.fullName ?? '',
    phone: user?.phone ?? '',
    country: user?.recruiterProfile?.country ?? emptyRecruiterSignupForm().country,
    companyName: user?.recruiterProfile?.companyName ?? '',
    companyWebsite: user?.recruiterProfile?.companyWebsite ?? '',
    industry: user?.recruiterProfile?.industry ?? emptyRecruiterSignupForm().industry,
    jobTitle: user?.recruiterProfile?.jobTitle ?? emptyRecruiterSignupForm().jobTitle,
    linkedIn: user?.recruiterProfile?.linkedIn ?? '',
  }))
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  if (!accessToken) return <Navigate to="/login" replace />
  if (user && !needsProfile(user)) return <Navigate to={homePath(user.role)} replace />

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setBusy(true)
    setError('')
    setErrors({})

    try {
      if (isHiring) {
        const form = { ...recruiterForm, fullName: fullName.trim(), phone: phone.trim() }
        const nextErrors = validateRecruiterSignup({
          ...form,
          email: user?.email ?? 'user@example.com',
          password: 'Placeholder1!',
          confirmPassword: 'Placeholder1!',
        })
        delete nextErrors.email
        delete nextErrors.password
        delete nextErrors.confirmPassword
        if (Object.keys(nextErrors).length) {
          setErrors(nextErrors)
          return
        }
        const next = await completeProfile({
          fullName: fullName.trim(),
          phone: phone.trim(),
          recruiterProfile: recruiterProfileFromForm(form),
        })
        navigate(homePath(next.role))
        return
      }

      if (fullName.trim().length < 2) {
        setError('Enter your full name')
        return
      }
      const next = await completeProfile({ fullName: fullName.trim(), phone: phone.trim() || undefined })
      navigate(homePath(next.role))
    } catch (err) {
      setErrors(apiErrorFields(err))
      setError(err instanceof Error ? err.message : 'Could not save profile')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="signup-page">
      <div className="signup-card">
        <div className="brand-panel">
          <img
            className="bg-img"
            src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=1200&q=80"
            alt="Professional profile setup"
          />
          <div className="logo">SmartHR</div>
          <div className="brand-tagline">Finish your profile once. Use it everywhere.</div>
          <div className="brand-copy">
            Add the details SmartHR needs to send you to the right workspace and keep hiring records complete.
          </div>
          <div className="stats-grid">
            <div className="stat-item">
              <div className="label">Profile status</div>
              <div className="value">One final step</div>
            </div>
            <div className="stat-item">
              <div className="label">Workspace access</div>
              <div className="value">{isHiring ? 'Hiring workspace' : 'Your dashboard'}</div>
            </div>
          </div>
          <div className="footer-note">
            <span>Finish once. Continue faster next time.</span>
          </div>
        </div>
        <div className="form-panel">
          <h2>{isHiring ? 'Complete your hiring profile' : 'Complete your profile'}</h2>
          <p className="complete-subtitle">
            {isHiring
              ? 'Tell us about you and the company you hire for before accessing your workspace.'
              : 'Finish your profile so we know who you are.'}
          </p>
          {error && <div className="auth-banner-inline">{error}</div>}

          <form onSubmit={onSubmit}>
            {isHiring ? (
              <>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="fullName">Full Name</label>
                    <input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} />
                    {fieldError(errors, 'fullName')}
                  </div>
                  <div className="form-group">
                    <label htmlFor="phone">Phone Number</label>
                    <input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
                    {fieldError(errors, 'phone')}
                  </div>
                  <div className="form-group">
                    <label htmlFor="country">Country</label>
                    <select id="country" value={recruiterForm.country} onChange={(e) => setRecruiterForm((c) => ({ ...c, country: e.target.value }))}>
                      {RECRUITER_COUNTRIES.map((country) => <option key={country} value={country}>{country}</option>)}
                    </select>
                    {fieldError(errors, 'country')}
                  </div>
                </div>

                <div className="role-detail-box">
                  <div className="title">Recruiter details</div>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="companyName">Company Name</label>
                      <input id="companyName" value={recruiterForm.companyName} onChange={(e) => setRecruiterForm((c) => ({ ...c, companyName: e.target.value }))} />
                      {fieldError(errors, 'companyName')}
                    </div>
                    <div className="form-group">
                      <label htmlFor="companyWebsite">Company Website</label>
                      <input id="companyWebsite" type="url" placeholder="https://company.com" value={recruiterForm.companyWebsite} onChange={(e) => setRecruiterForm((c) => ({ ...c, companyWebsite: e.target.value }))} />
                      {fieldError(errors, 'companyWebsite')}
                    </div>
                    <div className="form-group">
                      <label htmlFor="industry">Industry</label>
                      <select id="industry" value={recruiterForm.industry} onChange={(e) => setRecruiterForm((c) => ({ ...c, industry: e.target.value }))}>
                        {RECRUITER_INDUSTRIES.map((industry) => <option key={industry} value={industry}>{industry}</option>)}
                      </select>
                      {fieldError(errors, 'industry')}
                    </div>
                    <div className="form-group">
                      <label htmlFor="jobTitle">Recruiter Role</label>
                      <select id="jobTitle" value={recruiterForm.jobTitle} onChange={(e) => setRecruiterForm((c) => ({ ...c, jobTitle: e.target.value }))}>
                        {RECRUITER_JOB_TITLES.map((title) => <option key={title} value={title}>{title}</option>)}
                      </select>
                      {fieldError(errors, 'jobTitle')}
                    </div>
                    <div className="form-group full-width">
                      <label htmlFor="linkedIn">LinkedIn Profile (optional)</label>
                      <input id="linkedIn" value={recruiterForm.linkedIn} onChange={(e) => setRecruiterForm((c) => ({ ...c, linkedIn: e.target.value }))} />
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="form-row">
                <div className="form-group full-width">
                  <label htmlFor="fullName">Full name</label>
                  <input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} />
                </div>
                <div className="form-group full-width">
                  <label htmlFor="phone">Phone (optional)</label>
                  <input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
                </div>
              </div>
            )}

            <button className="btn-primary" type="submit" disabled={busy}>
              {busy ? 'Saving...' : 'Save and continue'}
            </button>
          </form>

          <button type="button" className="complete-logout" onClick={() => void logout()}>
            Log out
          </button>
        </div>
      </div>
    </div>
  )
}
