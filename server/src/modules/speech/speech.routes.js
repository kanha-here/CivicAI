import { Router } from 'express';
import { tokenHandler } from './speech.controller.js';

const router = Router();

router.get('/token', tokenHandler);

export default router;
