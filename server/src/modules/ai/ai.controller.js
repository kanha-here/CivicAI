import { param } from 'express-validator';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { successResponse } from '../../utils/apiResponse.js';
import { prisma } from '../../prisma/client.js';
import { buildCompletionReport, getComplaintAIOutputs, rerunAIProcessing } from '../../services/ai-orchestrator.service.js';

export const complaintIdValidation = [param('id').isUUID().withMessage('Valid complaint id is required')];

async function assertComplaintAccess(complaintId, user) {
  const complaint = await prisma.complaint.findUnique({ where: { id: complaintId }, select: { citizenId: true } });
  if (!complaint) {
    const error = new Error('Complaint not found');
    error.statusCode = 404;
    throw error;
  }
  if (user?.role === 'citizen' && complaint.citizenId !== user.id) {
    const error = new Error('Forbidden');
    error.statusCode = 403;
    throw error;
  }
}

export const listOutputsHandler = asyncHandler(async (req, res) => {
  await assertComplaintAccess(req.params.id, req.user);
  const outputs = await getComplaintAIOutputs(req.params.id);
  return successResponse(res, outputs, 'AI outputs loaded');
});

export const rerunAIHandler = asyncHandler(async (req, res) => {
  await assertComplaintAccess(req.params.id, req.user);
  const outputs = await rerunAIProcessing(req.params.id);
  return successResponse(res, outputs, 'AI processing completed');
});

export const completionReportHandler = asyncHandler(async (req, res) => {
  await assertComplaintAccess(req.params.id, req.user);
  const report = await buildCompletionReport(req.params.id);
  return successResponse(res, report, 'Completion report generated');
});
