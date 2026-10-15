import { Router } from 'express';
import { chat, getChatHistory, analyze } from '../controllers/aiController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.post('/chat', chat);
router.get('/chat/history', getChatHistory);
router.post('/analyze', analyze);

export default router;
