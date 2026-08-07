import { asyncHandler } from '../../utils/asyncHandler.js';
import { successResponse } from '../../utils/apiResponse.js';
import { getLeaderboard } from './leaderboard.service.js';

export const leaderboardHandler = asyncHandler(async (req, res) => {
  const data = await getLeaderboard(req.user);
  return successResponse(res, data, 'Leaderboard loaded');
});
