import type { RequestHandler, Response } from 'express';
import { body, validationResult, type ValidationChain } from 'express-validator';

const PUBLIC_ROLES = ['candidate', 'recruiter', 'employer', 'admin'];
const HIRING_ROLES = ['recruiter', 'employer'];

const passwordValidation = body('password')
  .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
  .matches(/[A-Za-z]/).withMessage('Password must include a letter')
  .matches(/\d/).withMessage('Password must include a number')
  .matches(/[^A-Za-z0-9]/).withMessage('Password must include a special character');

const recruiterProfileRequired = body('role').isIn(HIRING_ROLES);

// For Job Application
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

  // resumeText is optional now
  body('resumeText')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ min: 40, max: 20000 }).withMessage('Paste at least 40 characters from the resume'),

  // custom check: require either resumeText OR file
  body().custom((value, { req }) => {
    const hasText = req.body.resumeText && req.body.resumeText.trim().length >= 40;
    const hasFile = !!req.file; // multer puts file here
    if (!hasText && !hasFile) {
      throw new Error('Please upload a resume file or paste resume text');
    }
    return true;
  }),
];

// For User Registration
export const registerValidation = [
  body('role')
    .trim()
    .notEmpty().withMessage('Please choose an account type')
    .isIn(PUBLIC_ROLES).withMessage('Role must be candidate, recruiter, or admin'),
  body('fullName')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Full name must be between 2 and 100 characters'),
  body('fullName')
    .if(recruiterProfileRequired)
    .trim()
    .notEmpty().withMessage('Full name is required for recruiter accounts'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Valid email is required')
    .normalizeEmail(),
  passwordValidation,
  body('phone')
    .if(recruiterProfileRequired)
    .trim()
    .notEmpty().withMessage('Phone number is required for recruiter accounts')
    .custom((value) => {
      const digits = String(value).replace(/\D/g, '');
      return digits.length >= 7 && digits.length <= 15;
    }).withMessage('Enter a valid phone number'),
  body('recruiterProfile')
    .if(recruiterProfileRequired)
    .custom((value) => value && typeof value === 'object' && !Array.isArray(value))
    .withMessage('Recruiter profile is required for recruiter accounts'),
  body('recruiterProfile.companyName')
    .if(recruiterProfileRequired)
    .trim()
    .notEmpty().withMessage('Company name is required')
    .isLength({ min: 2, max: 120 }).withMessage('Company name must be between 2 and 120 characters'),
  body('recruiterProfile.companyWebsite')
    .optional({ values: 'falsy' })
    .trim()
    .isURL({ require_protocol: true }).withMessage('Enter a valid URL including https://'),
  body('recruiterProfile.industry')
    .if(recruiterProfileRequired)
    .trim()
    .notEmpty().withMessage('Industry is required'),
  body('recruiterProfile.jobTitle')
    .if(recruiterProfileRequired)
    .trim()
    .notEmpty().withMessage('Recruiter role is required'),
  body('recruiterProfile.country')
    .if(recruiterProfileRequired)
    .trim()
    .notEmpty().withMessage('Country is required'),
  body('recruiterProfile.linkedIn')
    .optional({ values: 'falsy' })
    .trim(),
];

// For Login
export const loginValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Valid email is required')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required')
];

// For OAuth Login/Register
export const oauthValidation = [
  body('idToken')
    .trim()
    .notEmpty().withMessage('Google sign-in token is required'),
  body('role')
    .optional({ values: 'falsy' })
    .trim()
    .isIn(PUBLIC_ROLES).withMessage('Role must be candidate, recruiter, or admin'),
];

// For Update Profile
export const updateProfileValidation = [
  body('fullName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Full name must be between 2 and 100 characters'),
  body('fullName')
    .if(body('recruiterProfile').exists())
    .trim()
    .notEmpty().withMessage('Full name is required for recruiter accounts'),
  body('email')
    .optional()
    .trim()
    .isEmail().withMessage('Valid email is required')
    .normalizeEmail(),
  body('phone')
    .optional()
    .trim()
    .isLength({ max: 20 }).withMessage('Phone number too long'),
  body('phone')
    .if(body('recruiterProfile').exists())
    .trim()
    .notEmpty().withMessage('Phone number is required for recruiter accounts')
    .custom((value) => {
      const digits = String(value).replace(/\D/g, '');
      return digits.length >= 7 && digits.length <= 15;
    }).withMessage('Enter a valid phone number'),
  body('recruiterProfile')
    .optional()
    .custom((value) => value && typeof value === 'object' && !Array.isArray(value))
    .withMessage('Recruiter profile must be an object'),
  body('recruiterProfile.companyName')
    .if(body('recruiterProfile').exists())
    .trim()
    .notEmpty().withMessage('Company name is required')
    .isLength({ min: 2, max: 120 }).withMessage('Company name must be between 2 and 120 characters'),
  body('recruiterProfile.companyWebsite')
    .optional({ values: 'falsy' })
    .trim()
    .isURL({ require_protocol: true }).withMessage('Enter a valid URL including https://'),
  body('recruiterProfile.industry')
    .if(body('recruiterProfile').exists())
    .trim()
    .notEmpty().withMessage('Industry is required'),
  body('recruiterProfile.jobTitle')
    .if(body('recruiterProfile').exists())
    .trim()
    .notEmpty().withMessage('Recruiter role is required'),
  body('recruiterProfile.country')
    .if(body('recruiterProfile').exists())
    .trim()
    .notEmpty().withMessage('Country is required'),
  body('recruiterProfile.linkedIn')
    .optional({ values: 'falsy' })
    .trim(),
];

// For Forgot Password
export const forgotPasswordValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Valid email is required')
    .normalizeEmail()
];

// For Reset Password
export const resetPasswordValidation = [
  body('token')
    .notEmpty().withMessage('Token is required'),
  body('newPassword')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
];

const handleValidationErrors: RequestHandler = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array({ onlyFirstError: true }).map((error) => ({
        field: 'path' in error && typeof error.path === 'string' ? error.path : 'unknown',
        message: typeof error.msg === 'string' ? error.msg : 'Invalid value',
      })),
    });
    return;
  }

  next();
};

export function validate(validations: ValidationChain[]): RequestHandler[];
export function validate(req: Parameters<RequestHandler>[0], res: Response, next: Parameters<RequestHandler>[2]): void;
export function validate(
  validationsOrReq: ValidationChain[] | Parameters<RequestHandler>[0],
  res?: Response,
  next?: Parameters<RequestHandler>[2]
): RequestHandler[] | void {
  if (Array.isArray(validationsOrReq)) {
    return [...validationsOrReq, handleValidationErrors];
  }

  if (!res || !next) {
    throw new TypeError('validate middleware requires req, res, and next');
  }

  handleValidationErrors(validationsOrReq, res, next);
}
// Used by employerRoutes.ts and recruiterRoutes.ts when creating jobs
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
