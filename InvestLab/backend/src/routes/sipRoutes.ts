import { Router } from 'express';
import { SipController } from '../controllers/sipController.js';

const router = Router();

router.post('/calculate', SipController.calculate);

export default router;
