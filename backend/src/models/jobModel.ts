import { Prisma } from '../../generated/prisma/client.js';
import prisma from '../config/database.js';

export const jobSelect = {
  id: true,
  recruiterId: true,
  title: true,
  description: true,
  requirements: true,
  location: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  recruiter: {
    select: {
      fullName: true,
      recruiterProfile: {
        select: { companyName: true },
      },
    },
  },
  _count: { select: { applications: true } },
} satisfies Prisma.JobSelect;

export const jobModel = {
  create(data: Prisma.JobCreateInput) {
    return prisma.job.create({ data, select: jobSelect });
  },

  findById(id: number) {
    return prisma.job.findUnique({ where: { id }, select: jobSelect });
  },

  listByRecruiter(recruiterId: number) {
    return prisma.job.findMany({
      where: { recruiterId },
      select: jobSelect,
      orderBy: { createdAt: 'desc' },
    });
  },
};
