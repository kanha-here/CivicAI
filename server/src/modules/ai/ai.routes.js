import { Router } from 'express';
import { authenticateToken } from '../../middleware/auth.middleware.js';
import { authorizeRoles } from '../../middleware/role.middleware.js';
import { validateRequest } from '../../middleware/validateRequest.js';
import { rateLimit } from '../../middleware/rateLimit.middleware.js';
import {
  complaintIdValidation,
  completionReportHandler,
  listOutputsHandler,
  rerunAIHandler,
} from './ai.controller.js';

const router = Router();

router.use(authenticateToken);
router.use(rateLimit({ windowMs: 60_000, max: 40, keyPrefix: 'ai' }));

router.get('/complaints/:id/outputs', complaintIdValidation, validateRequest, listOutputsHandler);
router.get('/complaints/:id/report', complaintIdValidation, validateRequest, completionReportHandler);
router.post(
  '/complaints/:id/rerun',
  authorizeRoles('officer', 'admin', 'super_admin'),
  complaintIdValidation,
  validateRequest,
  rerunAIHandler,
);

export default router;
