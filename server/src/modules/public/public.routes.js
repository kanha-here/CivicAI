import { Router } from 'express';
import { validateRequest } from '../../middleware/validateRequest.js';
import { analyzeHandler, analyzeValidation, landingHandler } from './public.controller.js';

const router = Router();

router.get('/landing', landingHandler);
router.post('/analyze', analyzeValidation, validateRequest, analyzeHandler);

export default router;
