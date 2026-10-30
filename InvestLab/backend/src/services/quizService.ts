import crypto from 'crypto';
import { memoryDb } from '../db/index.js';
import { Quiz, QuizQuestion } from '../types/index.js';

export class QuizService {
  static async getQuizByModuleId(moduleId: string): Promise<Quiz | null> {
    const quizzes = memoryDb.getQuizzesList();
    const quiz = quizzes.find((q) => q.module_id === moduleId);
    if (!quiz) return null;

    const allQuestions = memoryDb.getQuizQuestionsList();
    const quizQuestions: QuizQuestion[] = allQuestions
      .filter((q) => q.quiz_id === quiz.id)
      .map((q) => ({
        id: q.id,
        quizId: q.quiz_id,
        question: q.question,
        optionA: q.option_a,
        optionB: q.option_b,
        optionC: q.option_c,
        optionD: q.option_d,
        // Notice: correctOption and explanation are intentionally omitted before submission!
        explanation: '',
        orderIndex: q.order_index,
      }))
      .sort((a, b) => a.orderIndex - b.orderIndex);

    return {
      id: quiz.id,
      moduleId: quiz.module_id,
      title: quiz.title,
      description: quiz.description,
      passingScore: quiz.passing_score,
      questions: quizQuestions,
    };
  }

  static async submitQuiz(
    userId: string,
    quizId: string,
    answers: Record<string, 'A' | 'B' | 'C' | 'D'>
  ) {
    const quizzes = memoryDb.getQuizzesList();
    const quiz = quizzes.find((q) => q.id === quizId);
    if (!quiz) {
      throw new Error(`Quiz not found: ${quizId}`);
    }

    const allQuestions = memoryDb.getQuizQuestionsList().filter((q) => q.quiz_id === quizId);
    if (allQuestions.length === 0) {
      throw new Error('No questions found for this quiz.');
    }

    let correctCount = 0;
    const questionResults = allQuestions.map((q) => {
      const selected = answers[q.id];
      const isCorrect = selected === q.correct_option;
      if (isCorrect) correctCount++;

      return {
        questionId: q.id,
        questionText: q.question,
        userSelection: selected || null,
        correctOption: q.correct_option,
        isCorrect,
        explanation: q.explanation,
      };
    });

    const totalQuestions = allQuestions.length;
    const scorePercentage = Math.round((correctCount / totalQuestions) * 100);
    const passed = scorePercentage >= (quiz.passing_score || 70);

    const attempt = {
      id: `att_${crypto.randomUUID()}`,
      user_id: userId,
      userId,
      quiz_id: quizId,
      score: scorePercentage,
      total_questions: totalQuestions,
      passed,
      answers_json: JSON.stringify(answers),
      submitted_at: new Date().toISOString(),
    };

    memoryDb.getQuizAttemptsList().unshift(attempt);

    return {
      quizId,
      title: quiz.title,
      score: scorePercentage,
      correctCount,
      totalQuestions,
      passed,
      passingScore: quiz.passing_score || 70,
      questionResults,
      attemptId: attempt.id,
    };
  }

  static async getUserAttempts(userId: string) {
    const allAttempts = memoryDb.getQuizAttemptsList();
    const userAttempts = allAttempts.filter(
      (a) => a.user_id === userId || a.userId === userId
    );

    const quizzes = memoryDb.getQuizzesList();
    const quizMap = new Map(quizzes.map((q) => [q.id, q]));

    return userAttempts.map((a) => ({
      id: a.id,
      quizId: a.quiz_id || a.quizId,
      quizTitle: quizMap.get(a.quiz_id || a.quizId)?.title || 'FinTech Quiz',
      score: a.score,
      totalQuestions: a.total_questions || a.totalQuestions,
      passed: a.passed,
      submittedAt: a.submitted_at || a.submittedAt,
    }));
  }
}
