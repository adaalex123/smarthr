import express from 'express';
import {
  getDashboard,
  getUsers,
  getSystemStats,
  manageUser,
} from '../controllers/adminController.js';
import { authenticateToken } from '../middlewares/authenticateToken.js';
import { authorizeRole } from '../middlewares/authorizeRole.js';

const router = express.Router();

router.use(authenticateToken);
router.use(authorizeRole('admin'));

router.get('/dashboard', getDashboard);
router.get('/users', getUsers);
router.get('/stats', getSystemStats);
router.put('/users/:userId', manageUser);

export default router;
