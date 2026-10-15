import { Router } from 'express';
import { getMetrics, getAuditLogs, getAIInsights } from '../controllers/analyticsController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/metrics', getMetrics);
router.get('/audit-logs', getAuditLogs);
router.get('/ai-insights', getAIInsights);

export default router;
