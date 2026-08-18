import { applicationModel } from '../models/applicationModel.js';
import { jobModel } from '../models/jobModel.js';
import { rankResume } from './rankingService.js';
import { AppError } from '../utils/errorHandler.js';

type CreateJobInput = {
  title: string;
  description: string;
  requirements: string;
  location?: string;
};

type ApplyInput = {
  fullName: string;
  email: string;
  resumeText: string;
};

type CandidateApplication = {
  email: string;
  fullName: string;
  matchScore: number;
  createdAt: Date;
  job: { title: string };
};

export function buildDailyTrends(createdAts: Date[], days = 7, now = new Date()) {
  const end = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const buckets = new Map<string, number>();
  for (let i = days - 1; i >= 0; i -= 1) {
    const key = new Date(end - i * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    buckets.set(key, 0);
  }
  for (const createdAt of createdAts) {
    const key = new Date(createdAt).toISOString().slice(0, 10);
    if (buckets.has(key)) buckets.set(key, (buckets.get(key) ?? 0) + 1);
  }
  return [...buckets.entries()].map(([label, value]) => ({ label, value }));
}

export function uniqueCandidates(applications: CandidateApplication[]) {
  const byEmail = new Map<string, {
    email: string;
    fullName: string;
    applications: number;
    bestScore: number;
    latestJobTitle: string;
    latestAt: Date;
  }>();

  for (const application of applications) {
    const current = byEmail.get(application.email);
    if (!current) {
      byEmail.set(application.email, {
        email: application.email,
        fullName: application.fullName,
        applications: 1,
        bestScore: application.matchScore,
        latestJobTitle: application.job.title,
        latestAt: application.createdAt,
      });
      continue;
    }
    current.applications += 1;
    if (application.matchScore > current.bestScore) current.bestScore = application.matchScore;
    if (application.createdAt > current.latestAt) {
      current.latestAt = application.createdAt;
      current.latestJobTitle = application.job.title;
      current.fullName = application.fullName;
    }
  }

  return [...byEmail.values()].sort((a, b) => b.bestScore - a.bestScore);
}

type CandidateJob = {
  id: number;
  title: string;
  location: string | null;
  recruiter: {
    fullName: string;
    recruiterProfile: { companyName: string } | null;
  };
};

type CandidateApplicationRow = {
  id: number;
  matchScore: number;
  semanticScore: number;
  skillScore: number;
  explanation: unknown;
  createdAt: Date;
  job: CandidateJob;
};

export function companyNameFromJob(job: CandidateJob) {
  return job.recruiter.recruiterProfile?.companyName || job.recruiter.fullName || 'SmartHR recruiter';
}

export function buildCandidateWorkspace(applications: CandidateApplicationRow[], now = new Date()) {
  const mapped = applications.map((item) => ({
    id: item.id,
    jobId: item.job.id,
    jobTitle: item.job.title,
    location: item.job.location,
    company: companyNameFromJob(item.job),
    matchScore: Math.round(item.matchScore),
    semanticScore: Math.round(item.semanticScore),
    skillScore: Math.round(item.skillScore),
    explanation: item.explanation,
    status: 'Submitted',
    createdAt: item.createdAt,
  }));
  const total = mapped.length;
  const avgScore = total
    ? Math.round(mapped.reduce((sum, item) => sum + item.matchScore, 0) / total)
    : null;
  const trends = buildDailyTrends(mapped.map((item) => item.createdAt), 7, now);

  return {
    applications: mapped,
    stats: {
      total,
      avgScore,
      companies: new Set(mapped.map((item) => item.company)).size,
      thisWeek: trends.reduce((sum, item) => sum + item.value, 0),
    },
    trends,
  };
}

export class JobService {
  static async createJob(recruiterId: number, input: CreateJobInput) {
    return jobModel.create({
      title: input.title.trim(),
      description: input.description.trim(),
      requirements: input.requirements.trim(),
      location: input.location?.trim() || null,
      recruiter: { connect: { id: recruiterId } },
    });
  }

  static listJobs(recruiterId: number) {
    return jobModel.listByRecruiter(recruiterId);
  }

  static async getRecruiterJob(recruiterId: number, jobId: number) {
    const job = await jobModel.findById(jobId);
    if (!job || job.recruiterId !== recruiterId) {
      throw new AppError('Job not found', 404);
    }
    return job;
  }

  static async listRankedApplicants(recruiterId: number, jobId: number) {
    await JobService.getRecruiterJob(recruiterId, jobId);
    const applicants = await applicationModel.listByJob(jobId);
    return applicants.map((applicant, index) => ({
      ...applicant,
      rank: index + 1,
    }));
  }

  static async listAllRecruiterApplications(recruiterId: number) {
    const applications = await applicationModel.listByRecruiter(recruiterId);
    return applications.map((application) => ({
      ...application,
      rank: null,
    }));
  }

  static listCandidates(recruiterId: number) {
    return applicationModel.listByRecruiter(recruiterId).then((applications) => uniqueCandidates(applications));
  }

  static async getCandidateWorkspace(email: string, now = new Date()) {
    const applications = await applicationModel.listByCandidateEmail(email.toLowerCase());
    return buildCandidateWorkspace(applications, now);
  }

  static async getWorkspace(userId: number) {
    const [jobs, applications] = await Promise.all([
      jobModel.listByRecruiter(userId),
      applicationModel.listByRecruiter(userId),
    ]);
    const avgMatchScore = applications.length
      ? Math.round(applications.reduce((sum, item) => sum + item.matchScore, 0) / applications.length)
      : null;

    return {
      stats: {
        postedJobs: jobs.length,
        allApplicants: applications.length,
        uniqueCandidates: uniqueCandidates(applications).length,
        avgMatchScore,
      },
      recentApplicants: applications.slice(0, 6).map((application) => ({
        id: application.id,
        fullName: application.fullName,
        email: application.email,
        matchScore: application.matchScore,
        jobTitle: application.job.title,
        createdAt: application.createdAt,
      })),
      trends: buildDailyTrends(applications.map((application) => application.createdAt)),
    };
  }

  static async getPublicJob(jobId: number) {
    const job = await jobModel.findById(jobId);
    if (!job || job.status !== 'open') {
      throw new AppError('Job not found', 404);
    }
    return {
      id: job.id,
      title: job.title,
      description: job.description,
      requirements: job.requirements,
      location: job.location,
      companyName: job.recruiter.recruiterProfile?.companyName || 'SmartHR recruiter',
    };
  }

  static async apply(jobId: number, input: ApplyInput) {
    const job = await jobModel.findById(jobId);
    if (!job || job.status !== 'open') {
      throw new AppError('This job is not accepting applications', 404);
    }

    const email = input.email.trim().toLowerCase();
    const existing = await applicationModel.findByJobAndEmail(jobId, email);
    if (existing) {
      throw new AppError('You have already applied to this job', 409);
    }

    const ranking = rankResume(
      { description: job.description, requirements: job.requirements },
      input.resumeText,
    );

    return applicationModel.create({
      jobId,
      fullName: input.fullName.trim(),
      email,
      resumeText: input.resumeText.trim(),
      ...ranking,
    });
  }
}
