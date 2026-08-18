import express from 'express';
import { applyToJob, getPublicJob } from '../controllers/jobController.js';
import { applyJobValidation, validate } from '../middlewares/validation.js';

const router = express.Router();

router.get('/:id', getPublicJob);
router.post('/:id/apply', validate(applyJobValidation), applyToJob);

export default router;
