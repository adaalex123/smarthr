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
