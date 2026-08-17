export function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export function isValidPhone(value) {
  return /^[0-9+()\-\s]{7,}$/.test(value)
}

// Returns a score from 0 (empty) to 4 (strong).
export function scorePassword(value) {
  if (!value) return 0
  let score = 0
  if (value.length >= 8) score++
  if (/[A-Z]/.test(value) && /[a-z]/.test(value)) score++
  if (/\d/.test(value)) score++
  if (/[^A-Za-z0-9]/.test(value)) score++
  return Math.max(1, score)
}

export const STRENGTH_WORDS = ['Weak', 'Fair', 'Good', 'Strong']
export const STRENGTH_COLORS = ['#E5484D', '#F2994A', '#F2C94C', '#2FAE60']

// Validates the common + role-specific required fields for step 2.
// Only the fields listed in the brief as required are checked here;
// role-specific fields are treated as free-form (not blocking submit),
// matching the reference design's behavior.
export function validateStep2(form) {
  const errors = {}

  if (form.fullName.trim().length < 2) errors.fullName = 'Enter your full name'
  if (!isValidEmail(form.email)) errors.email = 'Enter a valid email address'
  if (!isValidPhone(form.phone)) errors.phone = 'Enter a valid phone number'
  if (form.password.length < 8) errors.password = 'Use at least 8 characters'
  if (!form.confirmPassword || form.confirmPassword !== form.password) {
    errors.confirmPassword = 'Passwords do not match'
  }
  if (!form.country) errors.country = 'Select your country'
  if (!form.terms) errors.terms = 'You must agree to continue'

  return errors
}

