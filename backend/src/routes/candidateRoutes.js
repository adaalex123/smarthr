// src/routes/candidateRoutes.js
import express from 'express';
import { getDashboard, getProfile, updateProfile } from '../controllers/candidateController.js';
import { authenticateToken } from '../middlewares/authenticateToken.js';
import { authorizeRole } from '../middlewares/authorizeRole.js';
import { validate, updateProfileValidation } from '../middlewares/validation.js';

const router = express.Router();

router.use(authenticateToken);
router.use(authorizeRole('candidate'));

router.get('/dashboard', getDashboard);
router.get('/profile', getProfile);
router.put('/profile', validate(updateProfileValidation), updateProfile);

export default router;