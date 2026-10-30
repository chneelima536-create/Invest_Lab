import { memoryDb } from '../db/index.js';
import { LearningModule, Lesson } from '../types/index.js';
import crypto from 'crypto';

export class LearningService {
  static async getAllModules(userId?: string): Promise<LearningModule[]> {
    const rawModules = memoryDb.getLearningModulesList();
    const progressMap = memoryDb.getProgressMap();
    const lessonsList = memoryDb.getLessonsList();

    const modules: LearningModule[] = rawModules.map((m) => {
      const moduleLessons = lessonsList.filter((l) => l.module_id === m.id);
      const totalLessons = moduleLessons.length || 1;

      let completedCount = 0;
      if (userId) {
        for (const l of moduleLessons) {
          if (progressMap.has(`${userId}:${m.id}:${l.id}`)) {
            completedCount++;
          }
        }
      }

      return {
        id: m.id,
        category: m.category,
        title: m.title,
        description: m.description,
        orderIndex: m.order_index,
        readingTimeMins: m.reading_time_mins,
        iconName: m.icon_name || 'BookOpen',
        difficulty: m.difficulty || 'Beginner',
        lessonsCount: totalLessons,
        completedLessonsCount: completedCount,
        isCompleted: completedCount >= totalLessons && totalLessons > 0,
      };
    });

    return modules.sort((a, b) => a.orderIndex - b.orderIndex);
  }

  static async getModuleById(moduleId: string, userId?: string): Promise<{ module: LearningModule; lessons: Lesson[] } | null> {
    const modules = await this.getAllModules(userId);
    const mod = modules.find((m) => m.id === moduleId);
    if (!mod) return null;

    const lessonsList = memoryDb.getLessonsList();
    const progressMap = memoryDb.getProgressMap();

    const lessons: Lesson[] = lessonsList
      .filter((l) => l.module_id === moduleId)
      .map((l) => {
        let isDone = false;
        if (userId && progressMap.has(`${userId}:${moduleId}:${l.id}`)) {
          isDone = true;
        }

        let keyTerms;
        try {
          keyTerms = typeof l.key_terms === 'string' ? JSON.parse(l.key_terms) : l.key_terms;
        } catch {
          keyTerms = [];
        }

        return {
          id: l.id,
          moduleId: l.module_id,
          title: l.title,
          content: l.content,
          practicalExample: l.practical_example,
          keyTerms,
          orderIndex: l.order_index,
          isCompleted: isDone,
        };
      })
      .sort((a, b) => a.orderIndex - b.orderIndex);

    return { module: mod, lessons };
  }

  static async markLessonProgress(userId: string, moduleId: string, lessonId: string, completed: boolean = true) {
    const progressMap = memoryDb.getProgressMap();
    const key = `${userId}:${moduleId}:${lessonId}`;

    if (completed) {
      progressMap.set(key, {
        id: `prg_${crypto.randomUUID()}`,
        user_id: userId,
        userId,
        module_id: moduleId,
        lesson_id: lessonId,
        completed: true,
        completed_at: new Date().toISOString(),
      });
    } else {
      progressMap.delete(key);
    }

    return { success: true, completed };
  }

  static async getUserLearningStats(userId: string) {
    const modules = await this.getAllModules(userId);
    const totalModules = modules.length;
    const completedModules = modules.filter((m) => m.isCompleted).length;

    let totalLessons = 0;
    let completedLessons = 0;
    for (const m of modules) {
      totalLessons += m.lessonsCount || 0;
      completedLessons += m.completedLessonsCount || 0;
    }

    const percent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

    const quizAttempts = memoryDb.getQuizAttemptsList().filter(
      (a) => a.user_id === userId || a.userId === userId
    );

    return {
      totalModules,
      completedModules,
      totalLessons,
      completedLessons,
      overallProgressPercent: percent,
      quizAttemptsCount: quizAttempts.length,
      quizzesPassedCount: quizAttempts.filter((a) => a.passed).length,
    };
  }
}
