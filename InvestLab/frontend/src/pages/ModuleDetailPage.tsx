import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Clock,
  HelpCircle,
  RotateCcw,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
  Award,
} from 'lucide-react';
import { LearningModule, Lesson, Quiz, QuizResult } from '../types';
import { learningApi, quizApi } from '../services/api';

export const ModuleDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [module, setModule] = useState<LearningModule | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [activeLessonIdx, setActiveLessonIdx] = useState(0);
  const [quiz, setQuiz] = useState<Quiz | null>(null);

  // Quiz state
  const [isQuizMode, setIsQuizMode] = useState(false);
  const [quizQuestionIdx, setQuizQuestionIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, 'A' | 'B' | 'C' | 'D'>>({});
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [isSubmittingQuiz, setIsSubmittingQuiz] = useState(false);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);

    Promise.all([learningApi.getModuleById(id), quizApi.getByModule(id).catch(() => null)])
      .then(([modData, quizData]) => {
        if (modData) {
          setModule(modData.module);
          setLessons(modData.lessons);
        }
        if (quizData) {
          setQuiz(quizData);
        }
      })
      .catch((err) => {
        console.error('Failed to load module details', err);
      })
      .finally(() => setIsLoading(false));
  }, [id]);

  const handleToggleLessonComplete = async (lesson: Lesson) => {
    if (!id) return;
    const newStatus = !lesson.isCompleted;

    try {
      await learningApi.updateProgress(id, lesson.id, newStatus);
      setLessons((prev) =>
        prev.map((l) => (l.id === lesson.id ? { ...l, isCompleted: newStatus } : l))
      );
    } catch (err) {
      console.error('Failed to update lesson progress', err);
    }
  };

  const handleSelectAnswer = (questionId: string, option: 'A' | 'B' | 'C' | 'D') => {
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: option }));
  };

  const handleSubmitQuiz = async () => {
    if (!quiz) return;
    setIsSubmittingQuiz(true);

    try {
      const res = await quizApi.submit(quiz.id, selectedAnswers);
      setQuizResult(res);
    } catch (err) {
      console.error('Quiz submission failed', err);
    } finally {
      setIsSubmittingQuiz(false);
    }
  };

  const handleRetryQuiz = () => {
    setSelectedAnswers({});
    setQuizResult(null);
    setQuizQuestionIdx(0);
  };

  if (isLoading) {
    return <div className="p-12 text-center text-xs text-[#64748B]">Loading lesson material...</div>;
  }

  if (!module) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-[#E2E8F0] text-center space-y-3">
        <h2 className="text-lg font-bold text-[#172B4D]">Module Not Found</h2>
        <button
          onClick={() => navigate('/learn')}
          className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs"
        >
          Back to Curriculum
        </button>
      </div>
    );
  }

  const currentLesson = lessons[activeLessonIdx] || lessons[0];

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div>
        <button
          onClick={() => navigate('/learn')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#64748B] hover:text-[#172B4D] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Learning Center</span>
        </button>
      </div>

      {/* Module Title Banner */}
      <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
            {module.category}
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-[#172B4D] mt-1 tracking-tight">
            {module.title}
          </h1>
          <p className="text-xs text-[#64748B] mt-1">{module.description}</p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {quiz && (
            <button
              onClick={() => {
                setIsQuizMode(!isQuizMode);
                setQuizResult(null);
              }}
              className={`px-4 py-2 rounded-xl font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 ${
                isQuizMode
                  ? 'bg-slate-100 hover:bg-slate-200 text-[#172B4D]'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'
              }`}
            >
              <HelpCircle className="w-4 h-4" />
              <span>{isQuizMode ? 'Read Lesson Content' : 'Take Module Quiz'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area: Lesson Reading vs Quiz Screen */}
      {!isQuizMode ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Lessons Sidebar (4 cols) */}
          <div className="lg:col-span-4 bg-white p-4 rounded-2xl border border-[#E2E8F0] shadow-sm space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#64748B] px-2">
              Lessons in this module
            </h2>

            <div className="space-y-1">
              {lessons.map((les, idx) => (
                <button
                  key={les.id}
                  onClick={() => setActiveLessonIdx(idx)}
                  className={`w-full text-left p-3 rounded-xl text-xs font-medium transition-all flex items-center justify-between ${
                    activeLessonIdx === idx
                      ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200'
                      : 'hover:bg-slate-50 text-[#172B4D]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] shrink-0 font-mono">
                      {idx + 1}
                    </span>
                    <span className="truncate">{les.title}</span>
                  </div>

                  {les.isCompleted && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 ml-2" />
                  )}
                </button>
              ))}
            </div>

            {/* Quiz Banner at bottom of list */}
            {quiz && (
              <div className="pt-3 border-t border-slate-100">
                <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl space-y-2">
                  <span className="text-[11px] font-bold text-indigo-900 block">
                    Ready to test your comprehension?
                  </span>
                  <button
                    onClick={() => setIsQuizMode(true)}
                    className="w-full py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-colors"
                  >
                    Start {quiz.title}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right: Lesson Detailed Reading View (8 cols) */}
          <div className="lg:col-span-8 bg-white p-6 sm:p-8 rounded-2xl border border-[#E2E8F0] shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-[#172B4D]">{currentLesson?.title}</h2>
              <button
                onClick={() => handleToggleLessonComplete(currentLesson)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                  currentLesson?.isCompleted
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                    : 'bg-blue-600 text-white hover:bg-blue-700 shadow-xs'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{currentLesson?.isCompleted ? 'Completed ✓' : 'Mark as Complete'}</span>
              </button>
            </div>

            {/* Lesson Body Content */}
            <div className="text-sm text-[#334155] leading-relaxed whitespace-pre-line space-y-4 font-normal">
              {currentLesson?.content}
            </div>

            {/* Practical Indian Rupee Example Card */}
            {currentLesson?.practicalExample && (
              <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-900 uppercase tracking-wider">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>Practical Example (Indian Market)</span>
                </div>
                <p className="text-xs text-amber-900 leading-relaxed">
                  {currentLesson.practicalExample}
                </p>
              </div>
            )}

            {/* Key Terminology Cards */}
            {currentLesson?.keyTerms && currentLesson.keyTerms.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
                  Important Financial Terms
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {currentLesson.keyTerms.map((t, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="font-bold text-[#172B4D] block">{t.term}</span>
                      <p className="text-[#64748B] text-[11px] mt-0.5">{t.def}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bottom Lesson Navigation */}
            <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
              <button
                disabled={activeLessonIdx === 0}
                onClick={() => setActiveLessonIdx((p) => Math.max(0, p - 1))}
                className="px-4 py-2 rounded-xl border border-[#E2E8F0] hover:bg-slate-50 text-xs font-semibold text-[#64748B] disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous Lesson</span>
              </button>

              {activeLessonIdx < lessons.length - 1 ? (
                <button
                  onClick={() => setActiveLessonIdx((p) => p + 1)}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5"
                >
                  <span>Next Lesson</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                quiz && (
                  <button
                    onClick={() => setIsQuizMode(true)}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5"
                  >
                    <span>Take Module Quiz</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Quiz Mode View */
        <div className="max-w-2xl mx-auto bg-white p-6 sm:p-8 rounded-2xl border border-[#E2E8F0] shadow-sm space-y-6">
          {!quizResult ? (
            /* Quiz Active Questions */
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">
                    Module Knowledge Assessment
                  </span>
                  <h2 className="text-base font-bold text-[#172B4D]">{quiz?.title}</h2>
                </div>
                <span className="text-xs font-semibold text-[#64748B]">
                  Question {quizQuestionIdx + 1} of {quiz?.questions?.length || 0}
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-600 transition-all duration-300"
                  style={{
                    width: `${(((quizQuestionIdx + 1) / (quiz?.questions?.length || 1)) * 100).toFixed(0)}%`,
                  }}
                />
              </div>

              {/* Current Question */}
              {quiz?.questions && quiz.questions[quizQuestionIdx] && (() => {
                const currentQ = quiz.questions![quizQuestionIdx];
                return (
                  <div className="space-y-4">
                    <h3 className="text-base font-bold text-[#172B4D]">
                      {currentQ.question}
                    </h3>

                    {/* 4 Multiple Choice Options */}
                    <div className="space-y-2.5">
                      {(['A', 'B', 'C', 'D'] as const).map((optKey) => {
                        const optField = `option${optKey}` as 'optionA' | 'optionB' | 'optionC' | 'optionD';
                        const optionText = currentQ[optField] as string;
                        const qId = currentQ.id;
                        const isSelected = selectedAnswers[qId] === optKey;

                        return (
                          <button
                            key={optKey}
                            onClick={() => handleSelectAnswer(qId, optKey)}
                            className={`w-full text-left p-3.5 rounded-xl border text-xs font-medium transition-all flex items-center gap-3 ${
                              isSelected
                                ? 'bg-indigo-50 border-indigo-500 text-indigo-900 shadow-xs font-bold'
                                : 'bg-white border-[#E2E8F0] hover:bg-slate-50 text-[#172B4D]'
                            }`}
                          >
                            <span
                              className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 ${
                                isSelected
                                  ? 'bg-indigo-600 text-white'
                                  : 'bg-slate-100 text-[#64748B]'
                              }`}
                            >
                              {optKey}
                            </span>
                            <span>{optionText}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

              {/* Quiz Navigation controls */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  disabled={quizQuestionIdx === 0}
                  onClick={() => setQuizQuestionIdx((p) => Math.max(0, p - 1))}
                  className="px-4 py-2 rounded-xl border border-[#E2E8F0] hover:bg-slate-50 text-xs font-semibold text-[#64748B] disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Previous
                </button>

                {quizQuestionIdx < (quiz?.questions?.length || 1) - 1 ? (
                  <button
                    onClick={() => setQuizQuestionIdx((p) => p + 1)}
                    className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs"
                  >
                    Next Question
                  </button>
                ) : (
                  <button
                    onClick={handleSubmitQuiz}
                    disabled={isSubmittingQuiz}
                    className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all"
                  >
                    {isSubmittingQuiz ? 'Evaluating...' : 'Submit Quiz'}
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* Quiz Results Screen */
            <div className="text-center space-y-6 py-4">
              <div
                className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center ${
                  quizResult.passed
                    ? 'bg-emerald-100 text-emerald-600'
                    : 'bg-amber-100 text-amber-600'
                }`}
              >
                <Award className="w-8 h-8" />
              </div>

              <div>
                <span
                  className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                    quizResult.passed
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}
                >
                  {quizResult.passed ? 'Quiz Passed!' : 'Needs Review'}
                </span>
                <h3 className="text-2xl font-black text-[#172B4D] mt-2">
                  Score: {quizResult.score}%
                </h3>
                <p className="text-xs text-[#64748B] mt-1">
                  You got {quizResult.correctCount} out of {quizResult.totalQuestions} questions correct.
                </p>
              </div>

              {/* Question Explanations Breakdown */}
              <div className="text-left space-y-3 pt-4 border-t border-slate-100">
                <h4 className="text-xs font-bold uppercase text-[#64748B]">Answer Explanations:</h4>
                {quizResult.questionResults.map((r, idx) => (
                  <div
                    key={r.questionId}
                    className={`p-4 rounded-xl border text-xs space-y-1.5 ${
                      r.isCorrect
                        ? 'bg-emerald-50/50 border-emerald-200'
                        : 'bg-red-50/50 border-red-200'
                    }`}
                  >
                    <div className="font-bold text-[#172B4D]">
                      Q{idx + 1}: {r.questionText}
                    </div>
                    <div className="text-[11px] text-[#64748B]">
                      Your Choice: <strong>Option {r.userSelection || 'None'}</strong> | Correct:{' '}
                      <strong className="text-emerald-700">Option {r.correctOption}</strong>
                    </div>
                    <p className="text-[11px] text-slate-700 leading-relaxed bg-white/70 p-2 rounded-lg border border-slate-200/60 mt-1">
                      <strong>Explanation:</strong> {r.explanation}
                    </p>
                  </div>
                ))}
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  onClick={handleRetryQuiz}
                  className="flex-1 py-2.5 rounded-xl border border-[#E2E8F0] hover:bg-slate-50 text-xs font-bold text-[#172B4D] flex items-center justify-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Retry Quiz</span>
                </button>
                <button
                  onClick={() => setIsQuizMode(false)}
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold"
                >
                  Return to Lessons
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
