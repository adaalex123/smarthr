// src/controllers/recruiterController.js
import { asyncHandler } from '../utils/errorHandler.js';

export const getDashboard = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    message: 'Recruiter Dashboard',
    user: {
      id: req.user.id,
      email: req.user.email,
      role: req.user.role,
    },
    data: {
      activeJobs: 8,
      totalApplicants: 124,
      pendingReviews: 15,
      recentActivity: ['Job posted: Senior Developer', 'Interview scheduled: Ada Johnson'],
    },
  });
});

export const getJobs = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    message: 'Recruiter Jobs',
    jobs: [
      { id: 1, title: 'Senior Developer', applicants: 25, status: 'Active' },
      { id: 2, title: 'Product Manager', applicants: 18, status: 'Active' },
    ],
  });
});

export const getApplicants = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    message: 'Recruiter Applicants',
    applicants: [
      { id: 1, name: 'Ada Johnson', position: 'Senior Developer', matchScore: '94%' },
      { id: 2, name: 'Bob Smith', position: 'Product Manager', matchScore: '87%' },
    ],
  });
});