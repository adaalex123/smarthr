import express from 'express';
import { getDashboard, getJobs, getApplicants } from '../controllers/recruiterController.js';
import { authenticateToken } from '../middlewares/authenticateToken.js';
import { authorizeRole } from '../middlewares/authorizeRole.js';

const router = express.Router();

router.use(authenticateToken);
router.use(authorizeRole('recruiter'));

router.get('/dashboard', getDashboard);
router.get('/jobs', getJobs);
router.get('/applicants', getApplicants);

export default router;
