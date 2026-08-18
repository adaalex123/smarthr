import express from 'express';
import {
  createJob,
  getAllApplications,
  getApplicants,
  getCandidates,
  getDashboard,
  getJobs,
  getMessages,
} from '../controllers/employerController.js';
import { authenticateToken } from '../middlewares/authenticateToken.js';
import { authorizeRole } from '../middlewares/authorizeRole.js';
import { createJobValidation, validate } from '../middlewares/validation.js';

const router = express.Router();

router.use(authenticateToken);
router.use(authorizeRole('employer', 'recruiter'));

router.get('/dashboard', getDashboard);
router.get('/jobs', getJobs);
router.post('/jobs', validate(createJobValidation), createJob);
router.get('/applications', getAllApplications);
router.get('/candidates', getCandidates);
router.get('/messages', getMessages);
router.get('/jobs/:id/applicants', getApplicants);

export default router;
