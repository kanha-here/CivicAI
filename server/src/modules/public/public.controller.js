import { body } from 'express-validator';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { successResponse } from '../../utils/apiResponse.js';
import { analyzePublicComplaint, getLandingData } from './public.service.js';

export const analyzeValidation = [
  body('complaint').trim().isLength({ min: 5 }).withMessage('Complaint must be at least 5 characters'),
];

export const landingHandler = asyncHandler(async (req, res) => {
  const data = await getLandingData();
  return successResponse(res, data, 'Landing data loaded');
});

export const analyzeHandler = asyncHandler(async (req, res) => {
  const data = await analyzePublicComplaint(req.body.complaint);
  return successResponse(res, data, 'Complaint analyzed');
});
