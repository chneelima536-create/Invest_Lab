import { Router } from 'express';
import { AuthController } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.post('/demo-login', AuthController.demoLogin);
router.get('/me', authenticateToken, AuthController.getProfile);
router.post('/reset-portfolio', authenticateToken, AuthController.resetPortfolio);

export default router;
