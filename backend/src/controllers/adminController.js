// src/controllers/adminController.js
import { asyncHandler } from '../utils/errorHandler.js';

export const getDashboard = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    message: 'Admin Dashboard',
    user: {
      id: req.user.id,
      email: req.user.email,
      role: req.user.role,
    },
    data: {
      totalUsers: 1500,
      totalCandidates: 1200,
      totalRecruiters: 250,
      totalAdmins: 50,
      activeSessions: 342,
    },
  });
});

export const getUsers = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    message: 'Admin Users List',
    users: [
      { id: 1, name: 'Ada Johnson', email: 'ada@email.com', role: 'candidate', status: 'active' },
      { id: 2, name: 'Bob Smith', email: 'bob@email.com', role: 'recruiter', status: 'active' },
      { id: 3, name: 'Charlie Admin', email: 'admin@email.com', role: 'admin', status: 'active' },
    ],
  });
});

export const getSystemStats = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    message: 'System Statistics',
    stats: {
      totalUsers: 1500,
      totalJobs: 450,
      totalApplications: 3200,
      averageMatchScore: '86%',
      dailyActiveUsers: 890,
    },
  });
});

export const manageUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { action, data } = req.body;

  res.json({
    success: true,
    message: `User ${action} executed successfully`,
    userId,
    data,
  });
});