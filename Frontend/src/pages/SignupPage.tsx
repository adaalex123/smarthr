import { useMemo, useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  RECRUITER_COUNTRIES,
  RECRUITER_INDUSTRIES,
  RECRUITER_JOB_TITLES,
  emptyRecruiterSignupForm,
} from '../constants/recruiterSignup'
import ApiErrorBanner from '../components/ApiErrorBanner'
import { apiErrorFields } from '../api/client'
import { useAuth } from '../AuthContext'
import type { UserRole } from '../types/auth'
import { homePath, isHiringRole, needsProfile } from '../types/auth'
import {
  passwordRules,
  recruiterProfileFromForm,
  validateRecruiterSignup,
  validateSignup,
} from '../utils/validation'
import '../styles/signup.css'

const ROLES: { id: UserRole; icon: string; title: string; desc: string }[] = [
  { id: 'candidate', icon: 'CA', title: 'Candidate', desc: 'Apply to roles and review your match details.' },
  { id: 'recruiter', icon: 'RE', title: 'Recruiter', desc: 'Post jobs, rank applicants, and manage your hiring workspace.' },
  { id: 'admin', icon: 'AD', title: 'Admin', desc: 'Manage users, account status, and platform access.' },
]

function afterAuth(user: { role: UserRole; fullName: string; recruiterProfile?: import('../types/auth').RecruiterProfile | null }, navigate: ReturnType<typeof useNavigate>) {
  navigate(needsProfile(user) ? '/complete-profile' : homePath(user.role))
}

function fieldError(errors: Record<string, string>, key: string) {
  return errors[key] ? <span className="field-error">{errors[key]}</span> : null
}

export default function SignupPage() {
  const { signup, googleAuth } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const preset = params.get('role')
  const initialRole = preset === 'admin' || preset === 'candidate' || preset === 'recruiter'
    ? preset
    : preset === 'employer'
      ? 'recruiter'
      : null

  const [role, setRole] = useState<UserRole | null>(initialRole)
  const [basicForm, setBasicForm] = useState({ email: '', password: '', confirmPassword: '' })
  const [recruiterForm, setRecruiterForm] = useState(emptyRecruiterSignupForm)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [serverError, setServerError] = useState<unknown>(null)
  const [busy, setBusy] = useState(false)
  const [terms, setTerms] = useState(false)

  const isHiring = role ? isHiringRole(role) : false
  const passwordValue = isHiring ? recruiterForm.password : basicForm.password
  const rules = passwordRules(passwordValue)
  const selected = useMemo(() => ROLES.find((item) => item.id === role), [role])

  function updateRecruiter<K extends keyof typeof recruiterForm>(key: K, value: (typeof recruiterForm)[K]) {
    setRecruiterForm((current) => ({ ...current, [key]: value }))
  }

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

    const nextErrors = isHiring ? validateRecruiterSignup(recruiterForm) : validateSignup(basicForm)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return

    setBusy(true)
    setServerError(null)
    try {
      if (isHiring) {
        afterAuth(await signup({
          email: recruiterForm.email.trim(),
          password: recruiterForm.password,
          role,
          fullName: recruiterForm.fullName.trim(),
          phone: recruiterForm.phone.trim(),
          country: recruiterForm.country.trim(),
          recruiterProfile: recruiterProfileFromForm(recruiterForm),
        }), navigate)
      } else {
        afterAuth(await signup({
          email: basicForm.email.trim(),
          password: basicForm.password,
          role,
        }), navigate)
      }
    } catch (error) {
      setErrors(apiErrorFields(error))
      setServerError(error)
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
    setServerError(null)
    try {
      afterAuth(await googleAuth(role), navigate)
    } catch (error) {
      setServerError(error)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="signup-page">
      <div className="signup-card">
        <div className="brand-panel">
          <img className="bg-img" src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="HR team" />
          <div className="logo">SmartHR</div>
          <div className="brand-tagline">Choose the workspace that fits your day.</div>
          <div className="brand-copy">One account flow, three clear destinations: candidate dashboard, recruiter workspace, or admin console.</div>
          <div className="stats-grid">
            <div className="stat-item"><div className="label">Recruiter</div><div className="value">Create jobs <small>and review applicants</small></div></div>
            <div className="stat-item"><div className="label">Candidate</div><div className="value">Apply faster <small>with a reusable profile</small></div></div>
            <div className="stat-item"><div className="label">Admin</div><div className="value">Control access <small>from one console</small></div></div>
          </div>
          <div className="footer-note">
            <span>© 2026 SmartHR. All rights reserved.</span>
            <Link to="/">Back to landing</Link>
          </div>
        </div>

        <div className="form-panel">
          <h2>Create your account</h2>
          <div className="step-indicator">Choose account type</div>

          <div className="signup-section-label">Step 1: Select Account Type</div>
          <div className="role-grid">
            {ROLES.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`role-card${role === item.id ? ' active' : ''}${item.id === 'admin' ? ' full-width' : ''}`}
                onClick={() => { setRole(item.id); setErrors({}) }}
              >
                <span className="role-card-symbol">{item.icon}</span>
                <div><span className="role-label">{item.title}</span><span className="role-desc">{item.desc}</span></div>
              </button>
            ))}
          </div>
          {errors.role && <p className="field-error">{errors.role}</p>}

          <div className="signup-section-label">
            Step 2: {isHiring ? 'Your profile & company details' : 'Create Your Account'}
          </div>
          <ApiErrorBanner error={serverError} onDismiss={() => setServerError(null)} />

          <form className="dynamic-form" onSubmit={onSubmit}>
            {isHiring ? (
              <>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="fullName">Full Name</label>
                    <input id="fullName" type="text" placeholder="Enter your full name" value={recruiterForm.fullName} onChange={(e) => updateRecruiter('fullName', e.target.value)} />
                    {fieldError(errors, 'fullName')}
                  </div>
                  <div className="form-group">
                    <label htmlFor="email">Email Address</label>
                    <input id="email" type="email" placeholder="Enter your email" value={recruiterForm.email} onChange={(e) => updateRecruiter('email', e.target.value)} />
                    {fieldError(errors, 'email')}
                  </div>
                  <div className="form-group">
                    <label htmlFor="phone">Phone Number</label>
                    <input id="phone" type="tel" placeholder="Enter your phone number" value={recruiterForm.phone} onChange={(e) => updateRecruiter('phone', e.target.value)} />
                    {fieldError(errors, 'phone')}
                  </div>
                  <div className="form-group">
                    <label htmlFor="country">Country</label>
                    <select id="country" value={recruiterForm.country} onChange={(e) => updateRecruiter('country', e.target.value)}>
                      {RECRUITER_COUNTRIES.map((country) => <option key={country} value={country}>{country}</option>)}
                    </select>
                    {fieldError(errors, 'country')}
                  </div>
                  <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <input id="password" type="password" placeholder="Create a password" value={recruiterForm.password} onChange={(e) => updateRecruiter('password', e.target.value)} />
                    <ul className="password-rules-list">
                      {rules.map((rule) => <li key={rule.id} className={rule.ok ? 'ok' : ''}><span>{rule.ok ? 'Met' : 'Needs'}</span>{rule.label}</li>)}
                    </ul>
                    {fieldError(errors, 'password')}
                  </div>
                  <div className="form-group">
                    <label htmlFor="confirmPassword">Confirm Password</label>
                    <input id="confirmPassword" type="password" placeholder="Confirm your password" value={recruiterForm.confirmPassword} onChange={(e) => updateRecruiter('confirmPassword', e.target.value)} />
                    {fieldError(errors, 'confirmPassword')}
                  </div>
                </div>

                <div className="role-detail-box">
                  <div className="title">Company details</div>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="companyName">Company Name</label>
                      <input id="companyName" type="text" placeholder="Enter company name" value={recruiterForm.companyName} onChange={(e) => updateRecruiter('companyName', e.target.value)} />
                      {fieldError(errors, 'companyName')}
                    </div>
                    <div className="form-group">
                      <label htmlFor="companyWebsite">Company Website</label>
                      <input id="companyWebsite" type="url" placeholder="https://company.com" value={recruiterForm.companyWebsite} onChange={(e) => updateRecruiter('companyWebsite', e.target.value)} />
                      {fieldError(errors, 'companyWebsite')}
                    </div>
                    <div className="form-group">
                      <label htmlFor="industry">Industry</label>
                      <select id="industry" value={recruiterForm.industry} onChange={(e) => updateRecruiter('industry', e.target.value)}>
                        {RECRUITER_INDUSTRIES.map((industry) => <option key={industry} value={industry}>{industry}</option>)}
                      </select>
                      {fieldError(errors, 'industry')}
                    </div>
                    <div className="form-group">
                      <label htmlFor="jobTitle">Recruiter Role</label>
                      <select id="jobTitle" value={recruiterForm.jobTitle} onChange={(e) => updateRecruiter('jobTitle', e.target.value)}>
                        {RECRUITER_JOB_TITLES.map((title) => <option key={title} value={title}>{title}</option>)}
                      </select>
                      {fieldError(errors, 'jobTitle')}
                    </div>
                    <div className="form-group full-width">
                      <label htmlFor="linkedIn">LinkedIn Profile (optional)</label>
                      <input id="linkedIn" type="url" placeholder="linkedin.com/in/yourprofile" value={recruiterForm.linkedIn} onChange={(e) => updateRecruiter('linkedIn', e.target.value)} />
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="form-row">
                <div className="form-group full-width">
                  <label htmlFor="email">Email Address</label>
                  <input id="email" type="email" placeholder="Enter your email" value={basicForm.email} onChange={(e) => setBasicForm((c) => ({ ...c, email: e.target.value }))} />
                  {fieldError(errors, 'email')}
                </div>
                <div className="form-group full-width">
                  <label htmlFor="password">Password</label>
                  <input id="password" type="password" placeholder="Create a password" value={basicForm.password} onChange={(e) => setBasicForm((c) => ({ ...c, password: e.target.value }))} />
                  <ul className="password-rules-list">
                    {rules.map((rule) => <li key={rule.id} className={rule.ok ? 'ok' : ''}><span>{rule.ok ? 'Met' : 'Needs'}</span>{rule.label}</li>)}
                  </ul>
                  {fieldError(errors, 'password')}
                </div>
                <div className="form-group full-width">
                  <label htmlFor="confirmPassword">Confirm Password</label>
                  <input id="confirmPassword" type="password" placeholder="Confirm your password" value={basicForm.confirmPassword} onChange={(e) => setBasicForm((c) => ({ ...c, confirmPassword: e.target.value }))} />
                  {fieldError(errors, 'confirmPassword')}
                </div>
              </div>
            )}

            <div className="terms">
              <input type="checkbox" id="termsCheck" checked={terms} onChange={(e) => setTerms(e.target.checked)} />
              <label htmlFor="termsCheck">I agree to the Terms of Service and Privacy Policy</label>
            </div>
            {errors.terms && <span className="field-error">{errors.terms}</span>}

            <button className="btn-primary" type="submit" disabled={busy || !selected}>
              {busy ? 'Creating account...' : `Create ${selected?.title ?? ''} account`}
            </button>

            <div className="inline-divider"><span>OR</span></div>

            <div className="social-login">
              <button type="button" className="social-btn" onClick={() => void onGoogle()} disabled={busy}>
                Continue with Google
              </button>
            </div>

            <div className="login-link">Already have an account? <Link to="/login">Log in</Link></div>
            <div className="home-link-row"><Link to="/">Back to Home</Link></div>
          </form>
        </div>
      </div>
    </div>
  )
}
