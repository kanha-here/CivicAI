import { asyncHandler } from '../../utils/asyncHandler.js';
import { successResponse } from '../../utils/apiResponse.js';
import { getIncidentStats, listIncidents } from './incident.service.js';

export const listIncidentHandler = asyncHandler(async (req, res) => {
  const [items, stats] = await Promise.all([listIncidents(req.user), getIncidentStats(req.user)]);
  return successResponse(res, { items, stats }, 'Incidents loaded');
});
