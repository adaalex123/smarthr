import express from 'express';
import { 
  getApplicants,
  getCandidates,
  getDashboard,
  getJobs,
  getMessages,
  createJob,
  getAllApplications
} from '../controllers/employerController.js';
import { authenticateToken } from '../middlewares/authenticateToken.js';
import { authorizeRole } from '../middlewares/authorizeRole.js';
import { createJobValidation, validate } from '../middlewares/validation.js';

const router = express.Router();

// The frontend uses /employer for both historical employer users and current recruiter users.
router.use(authenticateToken);
router.use(authorizeRole('employer', 'recruiter'));

router.get('/dashboard', getDashboard);
router.get('/jobs', getJobs);
// in employerRoutes.ts
router.post('/jobs', createJobValidation, validate, createJob);
router.get('/applications', getAllApplications);
router.get('/candidates', getCandidates);
router.get('/messages', getMessages);
router.get('/jobs/:id/applicants', getApplicants);

export default router;
