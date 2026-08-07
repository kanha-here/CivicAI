import { Router } from 'express';
import { authenticateToken } from '../../middleware/auth.middleware.js';
import { validateRequest } from '../../middleware/validateRequest.js';
import {
  communityHandler,
  profileHandler,
  profileUpdateValidation,
  supportHandler,
  supportValidation,
  updateProfileHandler,
} from './citizen.controller.js';

const router = Router();

router.use(authenticateToken);
router.get('/profile', profileHandler);
router.put('/profile', profileUpdateValidation, validateRequest, updateProfileHandler);
router.get('/community', communityHandler);
router.post('/support', supportValidation, validateRequest, supportHandler);

export default router;
