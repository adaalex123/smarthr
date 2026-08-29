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

// All employer routes need auth + employer role
router.use(authenticateToken);
router.use(authorizeRole('employer'));

router.get('/dashboard', getDashboard);
router.get('/jobs', getJobs);
// in employerRoutes.ts
router.post('/jobs', createJobValidation, validate, createJob);
router.get('/applications', getAllApplications);
router.get('/candidates', getCandidates);
router.get('/messages', getMessages);
router.get('/jobs/:id/applicants', getApplicants);

export default router;