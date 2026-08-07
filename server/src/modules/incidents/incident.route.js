import { Router } from 'express';
import { authenticateToken } from '../../middleware/auth.middleware.js';
import { listIncidentHandler } from './incident.controller.js';

const router = Router();

router.get('/', authenticateToken, listIncidentHandler);

export default router;
