import { Router } from 'express';
import { authenticateToken } from '../../middleware/auth.middleware.js';
import { validateRequest } from '../../middleware/validateRequest.js';
import { login, loginValidation, logout, me, register, registerValidation } from './auth.controller.js';

const router = Router();

router.post('/register', registerValidation, validateRequest, register);
router.post('/login', loginValidation, validateRequest, login);
router.get('/me', authenticateToken, me);
router.post('/logout', authenticateToken, logout);

export default router;
