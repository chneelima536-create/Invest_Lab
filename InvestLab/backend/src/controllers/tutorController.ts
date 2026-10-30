import { Request, Response } from 'express';
import { z } from 'zod';
import { TutorService } from '../services/tutorService.js';

const chatSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty').max(1000, 'Message cannot exceed 1000 characters'),
  history: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant', 'system']),
        content: z.string(),
      })
    )
    .optional(),
});

export class TutorController {
  static async chat(req: Request, res: Response) {
    try {
      const parsed = chatSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          error: parsed.error.errors[0]?.message || 'Invalid chat parameters',
        });
      }

      const { message, history } = parsed.data;
      const result = await TutorService.askTutor(message, history || []);

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: err.message || 'AI Tutor failed to respond',
      });
    }
  }
}
