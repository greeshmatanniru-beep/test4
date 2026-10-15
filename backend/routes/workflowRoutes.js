import { Router } from 'express';
import { getWorkflows, createWorkflow, toggleWorkflowStatus, triggerWorkflow } from '../controllers/workflowController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/', getWorkflows);
router.post('/', createWorkflow);
router.patch('/:id/status', toggleWorkflowStatus);
router.post('/:id/trigger', triggerWorkflow);

export default router;
