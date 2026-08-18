export const RECRUITER_COUNTRIES = [
  'United States',
  'Canada',
  'United Kingdom',
  'Germany',
  'Nigeria',
  'Other',
] as const

export const RECRUITER_INDUSTRIES = [
  'Technology',
  'Finance',
  'Healthcare',
  'Education',
  'Retail',
  'Manufacturing',
  'Other',
] as const

export const RECRUITER_JOB_TITLES = [
  'Talent Acquisition',
  'HR Manager',
  'Hiring Lead',
  'Recruitment Specialist',
  'Head of People',
  'Other',
] as const

export type RecruiterProfileInput = {
  companyName: string
  companyWebsite?: string
  industry: string
  jobTitle: string
  country: string
  linkedIn?: string
}

export type RecruiterSignupForm = {
  fullName: string
  email: string
  phone: string
  country: string
  password: string
  confirmPassword: string
  companyName: string
  companyWebsite: string
  industry: string
  jobTitle: string
  linkedIn: string
}

export const emptyRecruiterSignupForm = (): RecruiterSignupForm => ({
  fullName: '',
  email: '',
  phone: '',
  country: RECRUITER_COUNTRIES[0],
  password: '',
  confirmPassword: '',
  companyName: '',
  companyWebsite: '',
  industry: RECRUITER_INDUSTRIES[0],
  jobTitle: RECRUITER_JOB_TITLES[0],
  linkedIn: '',
})
