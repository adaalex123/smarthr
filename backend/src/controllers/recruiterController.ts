import { asyncHandler, AppError } from '../utils/errorHandler.js';
import { userModel } from '../models/userModel.js';

export const getDashboard = asyncHandler(async (req, res) => {
  if (!req.user) throw new AppError('Authentication required', 401);
  const user = await userModel.findById(req.user.id);
  res.json({
    success: true,
    user,
  });
});

export const getJobs = asyncHandler(async (_req, res) => {
  res.json({
    success: true,
    jobs: [],
  });
});

export const getApplicants = asyncHandler(async (_req, res) => {
  res.json({
    success: true,
    applicants: [],
  });
});
