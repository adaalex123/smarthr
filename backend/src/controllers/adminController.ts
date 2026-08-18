import { UserStatus } from '../../generated/prisma/client.js';
import { asyncHandler, AppError } from '../utils/errorHandler.js';
import { userModel } from '../models/userModel.js';

const STATUSES: UserStatus[] = ['active', 'inactive', 'suspended'];

export const getDashboard = asyncHandler(async (req, res) => {
  if (!req.user) throw new AppError('Authentication required', 401);

  const [totalUsers, totalRecruiters, totalCandidates, totalAdmins] = await Promise.all([
    userModel.count(),
    userModel.count({ role: { in: ['employer', 'recruiter'] } }),
    userModel.count({ role: 'candidate' }),
    userModel.count({ role: 'admin' }),
  ]);

  res.json({
    success: true,
    user: {
      id: req.user.id,
      email: req.user.email,
      role: req.user.role,
    },
    data: {
      totalUsers,
      totalRecruiters,
      totalCandidates,
      totalAdmins,
    },
  });
});

export const getUsers = asyncHandler(async (_req, res) => {
  const users = await userModel.list();
  res.json({
    success: true,
    users,
  });
});

export const getSystemStats = asyncHandler(async (_req, res) => {
  const totalUsers = await userModel.count();
  res.json({
    success: true,
    stats: {
      totalUsers,
    },
  });
});

export const manageUser = asyncHandler(async (req, res) => {
  const userId = parseInt(req.params.userId, 10);
  const { action, data } = req.body as { action?: string; data?: { status?: string } };

  if (action !== 'updateStatus') {
    throw new AppError('Unsupported action', 400);
  }

  const status = data?.status;
  if (!status || !STATUSES.includes(status as UserStatus)) {
    throw new AppError('Invalid status', 400);
  }

  const user = await userModel.updateById(userId, { status: status as UserStatus });
  res.json({
    success: true,
    message: 'User updated successfully',
    user,
  });
});
