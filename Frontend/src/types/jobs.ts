export type RankingExplanation = {
  matchedSkills: string[]
  missingSkills: string[]
  overlappingTerms: { term: string; jobWeight: number; resumeWeight: number }[]
  summary: string
}

export type JobSummary = {
  id: number
  title: string
  description: string
  requirements: string
  location?: string | null
  status: 'open' | 'closed'
  createdAt: string
  recruiter?: { fullName: string; recruiterProfile?: { companyName: string } | null }
  _count?: { applications: number }
}

export type PublicJob = {
  id: number
  title: string
  description: string
  requirements: string
  location?: string | null
  companyName: string
}

export type RankedApplicant = {
  id: number
  rank: number
  fullName: string
  email: string
  resumeText: string
  matchScore: number
  semanticScore: number
  skillScore: number
  explanation: RankingExplanation
  createdAt: string
}

export type RecruiterApplication = RankedApplicant & {
  rank: number | null
  job: {
    id: number
    title: string
  }
}

export type EmployerCandidate = {
  email: string
  fullName: string
  applications: number
  bestScore: number
  latestJobTitle: string
  latestAt: string
}

export type EmployerTrend = {
  label: string
  value: number
}

export type CandidateApplication = {
  id: number
  jobId: number
  jobTitle: string
  location: string | null
  company: string
  matchScore: number
  semanticScore: number
  skillScore: number
  explanation: RankingExplanation
  status: string
  createdAt: string
}
