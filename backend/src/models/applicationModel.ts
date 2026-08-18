import { Prisma } from '../../generated/prisma/client.js';
import prisma from '../config/database.js';
import type { RankingExplanation } from '../services/rankingService.js';

export const applicationSelect = {
  id: true,
  jobId: true,
  fullName: true,
  email: true,
  resumeText: true,
  matchScore: true,
  semanticScore: true,
  skillScore: true,
  explanation: true,
  createdAt: true,
} satisfies Prisma.ApplicationSelect;

export const recruiterApplicationSelect = {
  ...applicationSelect,
  job: {
    select: {
      id: true,
      title: true,
    },
  },
} satisfies Prisma.ApplicationSelect;

export const candidateApplicationSelect = {
  ...applicationSelect,
  job: {
    select: {
      id: true,
      title: true,
      recruiter: {
        select: {
          recruiterProfile: {
            select: {
              companyName: true,
            },
          },
          fullName: true,
        },
      },
      location: true,
    },
  },
} satisfies Prisma.ApplicationSelect;

export const applicationModel = {
  create(data: {
    jobId: number;
    fullName: string;
    email: string;
    resumeText: string;
    matchScore: number;
    semanticScore: number;
    skillScore: number;
    explanation: RankingExplanation;
  }) {
    return prisma.application.create({
      data,
      select: applicationSelect,
    });
  },

  findByJobAndEmail(jobId: number, email: string) {
    return prisma.application.findUnique({
      where: { jobId_email: { jobId, email } },
      select: applicationSelect,
    });
  },

  listByJob(jobId: number) {
    return prisma.application.findMany({
      where: { jobId },
      select: applicationSelect,
      orderBy: { matchScore: 'desc' },
    });
  },

  listByRecruiter(recruiterId: number) {
    return prisma.application.findMany({
      where: { job: { recruiterId } },
      select: recruiterApplicationSelect,
      orderBy: [{ createdAt: 'desc' }],
    });
  },

  listByCandidateEmail(email: string) {
    return prisma.application.findMany({
      where: { email },
      select: candidateApplicationSelect,
      orderBy: [{ createdAt: 'desc' }],
    });
  },
};
