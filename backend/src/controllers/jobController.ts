import { asyncHandler, AppError } from '../utils/errorHandler.js';
import { JobService } from '../services/jobService.js';

export const getPublicJob = asyncHandler(async (req, res) => {
  const jobId = Number(req.params.id);
  if (!Number.isInteger(jobId)) throw new AppError('Invalid job id', 400);
  const job = await JobService.getPublicJob(jobId);
  res.json({
    success: true,
    job,
  });
});

export const applyToJob = asyncHandler(async (req, res) => {
  const jobId = Number(req.params.id);
  if (!Number.isInteger(jobId)) throw new AppError('Invalid job id', 400);
  const application = await JobService.apply(jobId, req.body);
  res.status(201).json({
    success: true,
    application: {
      id: application.id,
      matchScore: application.matchScore,
      semanticScore: application.semanticScore,
      skillScore: application.skillScore,
      explanation: application.explanation,
    },
  });
});
