import { Router } from 'express';
import { authenticateToken } from '../../middleware/auth.middleware.js';
import { authorizeRoles } from '../../middleware/role.middleware.js';
import { intelligenceHandler, listCitizensHandler, listUsersHandler, officerPerformanceHandler, settingsHandler } from './admin.controller.js';

const router = Router();

router.get('/users', authenticateToken, authorizeRoles('admin', 'super_admin'), listUsersHandler);
router.get('/citizens', authenticateToken, authorizeRoles('officer', 'admin', 'super_admin'), listCitizensHandler);
router.get('/officers/performance', authenticateToken, authorizeRoles('admin', 'super_admin'), officerPerformanceHandler);
router.get('/intelligence', authenticateToken, authorizeRoles('officer', 'admin', 'super_admin'), intelligenceHandler);
router.get('/settings', authenticateToken, authorizeRoles('admin', 'super_admin'), settingsHandler);

export default router;
