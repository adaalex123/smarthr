import express from 'express';
import { getDashboard } from '../controllers/employerController.js';
import { authenticateToken } from '../middlewares/authenticateToken.js';
import { authorizeRole } from '../middlewares/authorizeRole.js';

const router = express.Router();

router.use(authenticateToken);
router.use(authorizeRole('employer'));

router.get('/dashboard', getDashboard);

export default router;
