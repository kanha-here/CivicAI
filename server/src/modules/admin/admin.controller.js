import { asyncHandler } from '../../utils/asyncHandler.js';
import { successResponse } from '../../utils/apiResponse.js';
import { getIntelligenceOverview, getSettingsOverview, listCitizens, listOfficerPerformance, listUsers } from './admin.service.js';

export const listUsersHandler = asyncHandler(async (req, res) => {
  const data = await listUsers(req.query);
  return successResponse(res, data, 'Users loaded');
});

export const listCitizensHandler = asyncHandler(async (req, res) => {
  const data = await listCitizens(req.query);
  return successResponse(res, data, 'Citizens loaded');
});

export const officerPerformanceHandler = asyncHandler(async (req, res) => {
  const data = await listOfficerPerformance();
  return successResponse(res, data, 'Officer performance loaded');
});

export const intelligenceHandler = asyncHandler(async (req, res) => {
  const data = await getIntelligenceOverview();
  return successResponse(res, data, 'Intelligence overview loaded');
});

export const settingsHandler = asyncHandler(async (req, res) => {
  const data = await getSettingsOverview();
  return successResponse(res, data, 'Settings overview loaded');
});
