import { asyncHandler } from '../../utils/asyncHandler.js';
import { successResponse } from '../../utils/apiResponse.js';
import { getDashboardSummary, getGovernanceAnalytics, getTrustAnalytics } from './analytics.service.js';

export const dashboard = asyncHandler(async (req, res) => {
  const data = await getDashboardSummary();
  return successResponse(res, data, 'Dashboard analytics loaded');
});

export const governance = asyncHandler(async (req, res) => {
  const data = await getGovernanceAnalytics();
  return successResponse(res, data, 'Governance analytics loaded');
});

export const trust = asyncHandler(async (req, res) => {
  const data = await getTrustAnalytics(req.query.complaintId);
  return successResponse(res, data, 'Trust analytics loaded');
});
