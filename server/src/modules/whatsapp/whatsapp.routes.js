import { Router } from 'express';
import { healthHandler, webhookHandler } from './whatsapp.controller.js';

const router = Router();

router.get('/health', healthHandler);
router.post('/webhook', webhookHandler);

export default router;
