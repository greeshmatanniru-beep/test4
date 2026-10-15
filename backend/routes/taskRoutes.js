import { Router } from 'express';
import {
  parseRequest,
  getTasks,
  getTaskById,
  createTask,
  updateStatus,
  getMetrics,
  getTaskHistory
} from '../controllers/taskController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.post('/parse', parseRequest);
router.get('/', getTasks);
router.get('/metrics', getMetrics);
router.post('/', createTask);
router.get('/:id', getTaskById);
router.patch('/:id/status', updateStatus);
router.get('/:id/history', getTaskHistory);

export default router;
