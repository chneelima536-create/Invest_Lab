import { Router } from 'express';
import { LearningController } from '../controllers/learningController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// Allow optional auth for exploring modules, but require auth for tracking progress
router.get('/modules', authenticateToken, LearningController.getModules);
router.get('/modules/:id', authenticateToken, LearningController.getModuleById);
router.post('/progress', authenticateToken, LearningController.updateProgress);
router.get('/stats', authenticateToken, LearningController.getLearningStats);

export default router;
