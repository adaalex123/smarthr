import { Prisma, Role, User, UserStatus } from '../../generated/prisma/client.js';
import prisma from '../config/database.js';

export const publicUserSelect = {
  id: true,
  fullName: true,
  email: true,
  phone: true,
  role: true,
  status: true,
  provider: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

export type PublicUser = Prisma.UserGetPayload<{ select: typeof publicUserSelect }>;

export const userModel = {
  findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  },

  findById(id: number, select: Prisma.UserSelect = publicUserSelect) {
    return prisma.user.findUnique({ where: { id }, select });
  },

  findByProvider(provider: string, providerId: string) {
    return prisma.user.findFirst({ where: { provider, providerId } });
  },

  create(data: Prisma.UserCreateInput) {
    return prisma.user.create({ data, select: publicUserSelect });
  },

  updateById(id: number, data: Prisma.UserUpdateInput) {
    return prisma.user.update({ where: { id }, data, select: publicUserSelect });
  },

  list() {
    return prisma.user.findMany({
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        status: true,
        provider: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  count(where: Prisma.UserWhereInput = {}) {
    return prisma.user.count({ where });
  },
};

export type { Role, User, UserStatus };
