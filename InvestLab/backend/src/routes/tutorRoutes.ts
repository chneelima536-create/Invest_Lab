import { Router } from 'express';
import { TutorController } from '../controllers/tutorController.js';

const router = Router();

router.post('/chat', TutorController.chat);

export default router;
