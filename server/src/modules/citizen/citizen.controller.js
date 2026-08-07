import { body } from 'express-validator';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { successResponse } from '../../utils/apiResponse.js';
import { createSupportMessage, getCitizenProfile, getCommunitySummary, updateCitizenProfile } from './citizen.service.js';

export const supportValidation = [
  body('requestType').trim().notEmpty().withMessage('Request type is required'),
  body('message').trim().isLength({ min: 10 }).withMessage('Message must be at least 10 characters'),
  body('email').optional().isEmail().withMessage('Valid email is required'),
  body('subject').optional().trim(),
];

export const profileUpdateValidation = [
  body('phone').optional({ nullable: true }).trim().isLength({ min: 10 }).withMessage('Phone number is too short'),
  body('address').optional({ nullable: true }).trim(),
];

export const profileHandler = asyncHandler(async (req, res) => {
  const data = await getCitizenProfile(req.user.id);
  return successResponse(res, data, 'Citizen profile loaded');
});

export const updateProfileHandler = asyncHandler(async (req, res) => {
  const data = await updateCitizenProfile(req.user.id, req.body);
  return successResponse(res, data, 'Profile updated');
});

export const communityHandler = asyncHandler(async (req, res) => {
  const data = await getCommunitySummary();
  return successResponse(res, data, 'Community summary loaded');
});

export const supportHandler = asyncHandler(async (req, res) => {
  const data = await createSupportMessage(req.user.id, req.body);
  return successResponse(res, data, 'Support message submitted', 201);
});
