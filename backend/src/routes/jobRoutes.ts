import express from 'express';
import multer from 'multer';
import { applyToJob, getPublicJob } from '../controllers/jobController.js';
import { applyJobValidation, validate } from '../middlewares/validation.js';

const router = express.Router();
const upload = multer({ 
  dest: 'uploads/',
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

router.get('/:id', getPublicJob);

router.post(
  '/:id/apply',
  upload.single('resumeFile'), // must match frontend input name
  applyJobValidation,
  validate,
  applyToJob
);

export default router;