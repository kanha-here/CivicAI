import { Router } from 'express';
import { authenticateToken } from '../../middleware/auth.middleware.js';
import { validateRequest } from '../../middleware/validateRequest.js';
import {
  createComplaintHandler,
  createComplaintValidation,
  deleteComplaintHandler,
  feedbackHandler,
  feedbackValidation,
  getComplaintHandler,
  getComplaintValidation,
  listComplaintValidation,
  listComplaintsHandler,
  progressHandler,
  progressValidation,
  updateComplaintHandler,
  updateComplaintValidation,
  workReportHandler,
} from './complaint.controller.js';

const router = Router();

router.use(authenticateToken);

router.post('/', createComplaintValidation, validateRequest, createComplaintHandler);
router.get('/', listComplaintValidation, validateRequest, listComplaintsHandler);
router.get('/:id', getComplaintValidation, validateRequest, getComplaintHandler);
router.get('/:id/work-report', getComplaintValidation, validateRequest, workReportHandler);
router.post('/:id/progress', progressValidation, validateRequest, progressHandler);
router.post('/:id/feedback', feedbackValidation, validateRequest, feedbackHandler);
router.put('/:id', updateComplaintValidation, validateRequest, updateComplaintHandler);
router.delete('/:id', getComplaintValidation, validateRequest, deleteComplaintHandler);

export default router;
