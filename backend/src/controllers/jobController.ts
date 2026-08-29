import { asyncHandler, AppError } from '../utils/errorHandler.js';
import { JobService } from '../services/jobService.js';
import { extractPdfText } from '../utils/pdfParser.js';
import mammoth from 'mammoth';
import fs from 'node:fs/promises';

export const getPublicJob = asyncHandler(async (req, res) => {
  const jobId = Number(req.params.id);
  if (!Number.isInteger(jobId)) throw new AppError('Invalid job id', 400);
  const job = await JobService.getPublicJob(jobId);
  res.json({
    success: true,
    job,
  });
});

export const applyToJob = asyncHandler(async (req, res) => {
  const jobId = Number(req.params.id);
  if (!Number.isInteger(jobId)) throw new AppError('Invalid job id', 400);

  const { fullName, email, resumeText } = req.body;
  let finalResumeText = resumeText || '';

  // 4. CHECK IF FILE WAS UPLOADED
  if (req.file) {
    const filePath = req.file.path;
    const mimetype = req.file.mimetype;

    try {
      if (mimetype === 'application/pdf') {
        finalResumeText = await extractPdfText(filePath);
      } 
      else if (mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || mimetype === 'application/msword') {
        const result = await mammoth.extractRawText({ path: filePath });
        finalResumeText = result.value;
      } else {
        throw new AppError('Only PDF and DOCX files are allowed', 400);
      }
    } finally {
      // always delete temp file
      await fs.unlink(filePath).catch(() => {});
    }
  }

  if (!finalResumeText.trim()) {
    throw new AppError('Resume text or file is required', 400);
  }

  // 5. PASS THE EXTRACTED TEXT TO YOUR SERVICE
  const application = await JobService.apply(jobId, {
    fullName,
    email,
    resumeText: finalResumeText, // service still gets text, not file
  });

  res.status(201).json({
    success: true,
    application: {
      id: application.id,
      matchScore: application.matchScore,
      semanticScore: application.semanticScore,
      skillScore: application.skillScore,
      explanation: application.explanation,
    },
  });
});