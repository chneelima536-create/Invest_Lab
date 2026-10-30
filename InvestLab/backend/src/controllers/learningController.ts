import { Response } from 'express';
import { z } from 'zod';
import { AuthRequest } from '../middleware/auth.js';
import { LearningService } from '../services/learningService.js';
import { QuizService } from '../services/quizService.js';

const progressSchema = z.object({
  moduleId: z.string().min(1, 'Module ID is required'),
  lessonId: z.string().min(1, 'Lesson ID is required'),
  completed: z.boolean().default(true),
});

const quizSubmitSchema = z.object({
  answers: z.record(z.enum(['A', 'B', 'C', 'D'])),
});

export class LearningController {
  static async getModules(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      const modules = await LearningService.getAllModules(userId);
      return res.status(200).json({
        success: true,
        count: modules.length,
        data: modules,
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: err.message || 'Failed to fetch learning modules',
      });
    }
  }

  static async getModuleById(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;
      const data = await LearningService.getModuleById(id, userId);

      if (!data) {
        return res.status(404).json({
          success: false,
          error: `Learning module "${id}" not found`,
        });
      }

      return res.status(200).json({
        success: true,
        data,
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: err.message || 'Failed to fetch learning module',
      });
    }
  }

  static async updateProgress(req: AuthRequest, res: Response) {
    try {
      if (!req.user?.userId) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const parsed = progressSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          error: parsed.error.errors[0]?.message || 'Invalid parameters',
        });
      }

      const { moduleId, lessonId, completed } = parsed.data;
      const result = await LearningService.markLessonProgress(
        req.user.userId,
        moduleId,
        lessonId,
        completed
      );

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: err.message || 'Failed to update progress',
      });
    }
  }

  static async getLearningStats(req: AuthRequest, res: Response) {
    try {
      if (!req.user?.userId) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const stats = await LearningService.getUserLearningStats(req.user.userId);
      return res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: err.message || 'Failed to fetch learning stats',
      });
    }
  }

  static async getQuizByModule(req: AuthRequest, res: Response) {
    try {
      const { moduleId } = req.params;
      const quiz = await QuizService.getQuizByModuleId(moduleId);

      if (!quiz) {
        return res.status(404).json({
          success: false,
          error: `No quiz found for module "${moduleId}"`,
        });
      }

      return res.status(200).json({
        success: true,
        data: quiz,
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: err.message || 'Failed to fetch quiz',
      });
    }
  }

  static async submitQuiz(req: AuthRequest, res: Response) {
    try {
      if (!req.user?.userId) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const { id } = req.params;
      const parsed = quizSubmitSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          error: parsed.error.errors[0]?.message || 'Invalid submission format',
        });
      }

      const result = await QuizService.submitQuiz(req.user.userId, id, parsed.data.answers);

      return res.status(200).json({
        success: true,
        message: result.passed ? 'Congratulations! You passed the quiz.' : 'Quiz completed. Keep learning and try again!',
        data: result,
      });
    } catch (err: any) {
      return res.status(400).json({
        success: false,
        error: err.message || 'Quiz submission failed',
      });
    }
  }

  static async getQuizAttempts(req: AuthRequest, res: Response) {
    try {
      if (!req.user?.userId) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const attempts = await QuizService.getUserAttempts(req.user.userId);
      return res.status(200).json({
        success: true,
        count: attempts.length,
        data: attempts,
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: err.message || 'Failed to fetch quiz attempts',
      });
    }
  }
}
