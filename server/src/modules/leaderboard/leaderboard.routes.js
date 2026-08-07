import { Router } from 'express';
import { authenticateToken } from '../../middleware/auth.middleware.js';
import { leaderboardHandler } from './leaderboard.controller.js';

const router = Router();

router.get('/', authenticateToken, leaderboardHandler);

export default router;
