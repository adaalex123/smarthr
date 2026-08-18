import { Prisma } from '../../generated/prisma/client.js';
import prisma from '../config/database.js';

export type RecruiterProfileInput = {
  companyName: string;
  companyWebsite?: string | null;
  industry: string;
  jobTitle: string;
  country: string;
  linkedIn?: string | null;
};

export const recruiterProfileSelect = {
  companyName: true,
  companyWebsite: true,
  industry: true,
  jobTitle: true,
  country: true,
  linkedIn: true,
} satisfies Prisma.RecruiterProfileSelect;

export type PublicRecruiterProfile = Prisma.RecruiterProfileGetPayload<{
  select: typeof recruiterProfileSelect;
}>;

export const recruiterProfileModel = {
  create(userId: number, data: RecruiterProfileInput) {
    return prisma.recruiterProfile.create({
      data: { userId, ...data },
      select: recruiterProfileSelect,
    });
  },

  upsert(userId: number, data: RecruiterProfileInput) {
    return prisma.recruiterProfile.upsert({
      where: { userId },
      create: { userId, ...data },
      update: data,
      select: recruiterProfileSelect,
    });
  },

  findByUserId(userId: number) {
    return prisma.recruiterProfile.findUnique({
      where: { userId },
      select: recruiterProfileSelect,
    });
  },
};
