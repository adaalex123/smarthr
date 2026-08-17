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
