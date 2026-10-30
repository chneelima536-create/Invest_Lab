import { Router } from 'express';
import { LearningController } from '../controllers/learningController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.get('/module/:moduleId', authenticateToken, LearningController.getQuizByModule);
router.post('/:id/submit', authenticateToken, LearningController.submitQuiz);
router.get('/attempts', authenticateToken, LearningController.getQuizAttempts);

export default router;
