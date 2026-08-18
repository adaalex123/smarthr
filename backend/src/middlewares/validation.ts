import { NextFunction, Request, Response } from 'express';
import { ValidationChain, body, validationResult } from 'express-validator';
import { AppError } from '../utils/errorHandler.js';

export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await Promise.all(validations.map((validation) => validation.run(req)));

      const errors = validationResult(req);
      if (errors.isEmpty()) {
        return next();
      }

      const formattedErrors = errors.array().map((err) => ({
        field: 'path' in err ? String(err.path) : 'unknown',
        message: err.msg,
      }));

      throw new AppError('Validation failed', 400, formattedErrors);
    } catch (error) {
      next(error);
    }
  };
};

const optionalPhone = body('phone')
  .optional({ values: 'falsy' })
  .trim()
  .custom((value) => {
    const digits = String(value).replace(/\D/g, '');
    return digits.length >= 7 && digits.length <= 15;
  })
  .withMessage('Enter a valid phone number');

const recruiterProfileRules: ValidationChain[] = [
  body('recruiterProfile.companyName')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ min: 2, max: 150 }).withMessage('Company name must be between 2 and 150 characters'),

  body('recruiterProfile.companyWebsite')
    .optional({ values: 'falsy' })
    .trim()
    .matches(/^https?:\/\/\S+$/i)
    .withMessage('Company website must start with http:// or https://'),

  body('recruiterProfile.industry')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Industry must be between 2 and 100 characters'),

  body('recruiterProfile.jobTitle')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Recruiter role must be between 2 and 100 characters'),

  body('recruiterProfile.country')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Country must be between 2 and 100 characters'),

  body('recruiterProfile.linkedIn')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: 255 }).withMessage('LinkedIn profile is too long'),
];

export const registerValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/[A-Za-z]/).withMessage('Password must contain a letter')
    .matches(/[0-9]/).withMessage('Password must contain a number')
    .matches(/[^A-Za-z0-9]/).withMessage('Password must contain a special character'),

  body('role')
    .notEmpty().withMessage('Please choose an account type')
    .isIn(['admin', 'employer', 'recruiter', 'candidate']).withMessage('Role must be candidate, recruiter, or admin'),

  body('fullName')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Full name must be between 2 and 100 characters'),

  optionalPhone,

  body('country')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Country must be between 2 and 100 characters'),

  ...recruiterProfileRules,
];

export const loginValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required'),
];

export const oauthValidation = [
  body('idToken')
    .trim()
    .notEmpty().withMessage('idToken is required'),

  body('role')
    .optional()
    .isIn(['admin', 'employer', 'recruiter', 'candidate']).withMessage('Role must be candidate, recruiter, or admin'),
];

export const updateProfileValidation = [
  body('fullName')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Full name must be between 2 and 100 characters'),

  optionalPhone,
  ...recruiterProfileRules,
];

export const forgotPasswordValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),
];

export const resetPasswordValidation = [
  body('token')
    .notEmpty().withMessage('Reset token is required'),

  body('newPassword')
    .notEmpty().withMessage('New password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/[A-Za-z]/).withMessage('Password must contain a letter')
    .matches(/[0-9]/).withMessage('Password must contain a number')
    .matches(/[^A-Za-z0-9]/).withMessage('Password must contain a special character'),
];

export const createJobValidation = [
  body('title')
    .trim()
    .notEmpty().withMessage('Job title is required')
    .isLength({ min: 3, max: 120 }).withMessage('Job title must be between 3 and 120 characters'),

  body('description')
    .trim()
    .notEmpty().withMessage('Job description is required')
    .isLength({ min: 40, max: 8000 }).withMessage('Job description must be at least 40 characters'),

  body('requirements')
    .trim()
    .notEmpty().withMessage('Required skills are required')
    .isLength({ min: 2, max: 2000 }).withMessage('Add at least one required skill'),

  body('location')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: 120 }).withMessage('Location is too long'),
];

export const applyJobValidation = [
  body('fullName')
    .trim()
    .notEmpty().withMessage('Full name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Full name must be between 2 and 100 characters'),

  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),

  body('resumeText')
    .trim()
    .notEmpty().withMessage('Resume text is required')
    .isLength({ min: 40, max: 20000 }).withMessage('Paste at least 40 characters from the resume'),
];
