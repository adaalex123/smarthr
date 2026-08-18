import express from 'express';
import { getApplications, getDashboard, getMessages } from '../controllers/candidateController.js';
import { authenticateToken } from '../middlewares/authenticateToken.js';
import { authorizeRole } from '../middlewares/authorizeRole.js';

const router = express.Router();

router.use(authenticateToken);
router.use(authorizeRole('candidate'));

router.get('/dashboard', getDashboard);
router.get('/applications', getApplications);
router.get('/messages', getMessages);

export default router;
