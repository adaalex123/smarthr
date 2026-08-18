import type { RecruiterProfileInput, RecruiterSignupForm } from '../constants/recruiterSignup'

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export type PasswordRule = {
  id: string
  label: string
  ok: boolean
}

export function passwordRules(value: string): PasswordRule[] {
  return [
    { id: 'length', label: 'At least 8 characters', ok: value.length >= 8 },
    { id: 'letter', label: 'A letter (A–Z or a–z)', ok: /[A-Za-z]/.test(value) },
    { id: 'number', label: 'A number (0–9)', ok: /\d/.test(value) },
    { id: 'special', label: 'A special character (e.g. !@#$%)', ok: /[^A-Za-z0-9]/.test(value) },
  ]
}

export function passwordIsValid(value: string): boolean {
  return passwordRules(value).every((rule) => rule.ok)
}

export type SignupForm = {
  email: string
  password: string
  confirmPassword: string
}

export function validateSignup(form: SignupForm): Record<string, string> {
  const errors: Record<string, string> = {}
  if (!isValidEmail(form.email)) errors.email = 'Enter a valid email address'
  if (!passwordIsValid(form.password)) {
    const missing = passwordRules(form.password).filter((rule) => !rule.ok).map((rule) => rule.label)
    errors.password = `Password still needs: ${missing.join(', ')}`
  }
  if (!form.confirmPassword || form.confirmPassword !== form.password) {
    errors.confirmPassword = 'Passwords do not match'
  }
  return errors
}

export function validateRecruiterSignup(form: RecruiterSignupForm): Record<string, string> {
  const errors: Record<string, string> = {}

  if (form.fullName.trim().length < 2) errors.fullName = 'Enter your full name'
  if (!isValidEmail(form.email)) errors.email = 'Enter a valid email address'
  const phoneDigits = form.phone.replace(/\D/g, '')
  if (phoneDigits.length < 7 || phoneDigits.length > 15) {
    errors.phone = 'Enter a valid phone number'
  }
  if (!form.country.trim()) errors.country = 'Select your country'
  if (!passwordIsValid(form.password)) {
    errors.password = 'Password does not meet all requirements'
  }
  if (form.confirmPassword !== form.password) {
    errors.confirmPassword = 'Passwords do not match'
  }
  if (form.companyName.trim().length < 2) errors.companyName = 'Enter your company name'
  if (form.industry.trim().length < 2) errors.industry = 'Select an industry'
  if (form.jobTitle.trim().length < 2) errors.jobTitle = 'Select your recruiter role'
  if (form.companyWebsite.trim() && !/^https?:\/\/.+/i.test(form.companyWebsite.trim())) {
    errors.companyWebsite = 'Enter a valid URL (include https://)'
  }

  return errors
}

export function recruiterProfileFromForm(form: RecruiterSignupForm): RecruiterProfileInput {
  return {
    companyName: form.companyName.trim(),
    companyWebsite: form.companyWebsite.trim() || undefined,
    industry: form.industry.trim(),
    jobTitle: form.jobTitle.trim(),
    country: form.country.trim(),
    linkedIn: form.linkedIn.trim() || undefined,
  }
}
