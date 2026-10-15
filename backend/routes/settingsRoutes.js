import { Router } from 'express';
import { getSystemHealth, updateApiKey } from '../controllers/settingsController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.get('/health', getSystemHealth);
router.post('/api-key', authenticate, updateApiKey);

export default router;
