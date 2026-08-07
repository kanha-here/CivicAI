import { body } from 'express-validator';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { successResponse } from '../../utils/apiResponse.js';
import { getCurrentUser, loginUser, registerUser } from './auth.service.js';

export const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('phone').optional().trim().isLength({ min: 8 }).withMessage('Phone number is too short'),
  body('role').optional().isIn(['citizen', 'officer', 'admin', 'super_admin']),
];

export const loginValidation = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

export const register = asyncHandler(async (req, res) => {
  const result = await registerUser(req.body);
  return successResponse(res, result, 'User registered successfully', 201);
});

export const login = asyncHandler(async (req, res) => {
  const result = await loginUser(req.body);
  return successResponse(res, result, 'Login successful');
});

export const me = asyncHandler(async (req, res) => {
  const user = await getCurrentUser(req.user.id, req.user);
  return successResponse(res, user, 'Current user loaded');
});

export const logout = asyncHandler(async (req, res) => {
  return successResponse(res, null, 'Logout successful');
});
