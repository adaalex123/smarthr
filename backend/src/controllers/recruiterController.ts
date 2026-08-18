import { asyncHandler, AppError } from '../utils/errorHandler.js';
import { userModel } from '../models/userModel.js';
import { JobService } from '../services/jobService.js';

export const getDashboard = asyncHandler(async (req, res) => {
  if (!req.user) throw new AppError('Authentication required', 401);
  const user = await userModel.findById(req.user.id);
  const jobs = await JobService.listJobs(req.user.id);
  res.json({
    success: true,
    user,
    jobs,
  });
});

export const getJobs = asyncHandler(async (req, res) => {
  if (!req.user) throw new AppError('Authentication required', 401);
  const jobs = await JobService.listJobs(req.user.id);
  res.json({
    success: true,
    jobs,
  });
});

export const createJob = asyncHandler(async (req, res) => {
  if (!req.user) throw new AppError('Authentication required', 401);
  const job = await JobService.createJob(req.user.id, req.body);
  res.status(201).json({
    success: true,
    job,
  });
});

export const getJob = asyncHandler(async (req, res) => {
  if (!req.user) throw new AppError('Authentication required', 401);
  const jobId = Number(req.params.id);
  if (!Number.isInteger(jobId)) throw new AppError('Invalid job id', 400);
  const job = await JobService.getRecruiterJob(req.user.id, jobId);
  res.json({
    success: true,
    job,
  });
});

export const getApplicants = asyncHandler(async (req, res) => {
  if (!req.user) throw new AppError('Authentication required', 401);
  const jobId = Number(req.params.id);
  if (!Number.isInteger(jobId)) throw new AppError('Invalid job id', 400);
  const applicants = await JobService.listRankedApplicants(req.user.id, jobId);
  res.json({
    success: true,
    applicants,
  });
});

export const getAllApplications = asyncHandler(async (req, res) => {
  if (!req.user) throw new AppError('Authentication required', 401);
  const applications = await JobService.listAllRecruiterApplications(req.user.id);
  res.json({
    success: true,
    applications,
  });
});
