import { Router } from 'express';
import { login, register, getProfile, listAllUsers } from '../controllers/authController.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();

router.post('/login', login);
router.post('/register', register);
router.get('/me', authenticate, getProfile);
router.get('/users', authenticate, listAllUsers);

export default router;
