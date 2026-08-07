import { asyncHandler } from '../../utils/asyncHandler.js';
import { successResponse } from '../../utils/apiResponse.js';
import { getSpeechToken } from './speech.service.js';

export const tokenHandler = asyncHandler(async (req, res) => {
  const data = await getSpeechToken();
  return successResponse(res, data, 'Azure Speech token issued');
});
