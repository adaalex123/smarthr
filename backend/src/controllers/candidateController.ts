import { asyncHandler, AppError } from '../utils/errorHandler.js';
import { JobService } from '../services/jobService.js';

export const getDashboard = asyncHandler(async (req, res) => {
  if (!req.user) throw new AppError('Authentication required', 401);
  const workspace = await JobService.getCandidateWorkspace(req.user.email);
  res.json({
    success: true,
    ...workspace,
  });
});

export const getApplications = asyncHandler(async (req, res) => {
  if (!req.user) throw new AppError('Authentication required', 401);
  const { applications } = await JobService.getCandidateWorkspace(req.user.email);
  res.json({ success: true, applications });
});

export const getMessages = asyncHandler(async (req, res) => {
  if (!req.user) throw new AppError('Authentication required', 401);
  res.json({ success: true, messages: [] });
});
