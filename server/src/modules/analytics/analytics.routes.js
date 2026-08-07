import { Router } from 'express';
import { authenticateToken } from '../../middleware/auth.middleware.js';
import { dashboard, governance, trust } from './analytics.controller.js';

const router = Router();

router.get('/dashboard', dashboard);
router.get('/governance', authenticateToken, governance);
router.get('/trust', trust);

export default router;
