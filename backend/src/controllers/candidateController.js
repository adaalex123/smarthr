// src/controllers/candidateController.js
import { asyncHandler } from '../utils/errorHandler.js';

export const getDashboard = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    message: 'Candidate Dashboard',
    user: {
      id: req.user.id,
      email: req.user.email,
      role: req.user.role,
    },
    data: {
      applications: 5,
      interviews: 2,
      offers: 0,
      recentlyViewed: ['Job 1', 'Job 2', 'Job 3'],
    },
  });
});

export const getProfile = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    message: 'Candidate Profile',
    user: req.user,
  });
});

export const updateProfile = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    message: 'Profile updated successfully',
  });
});