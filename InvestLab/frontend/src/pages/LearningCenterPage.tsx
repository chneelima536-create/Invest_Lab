import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  BookOpen,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  Building2,
  FileText,
  BarChart2,
  Calculator,
  PieChart,
  ShieldCheck,
  Layers,
  Coins,
} from 'lucide-react';
import { LearningModule } from '../types';
import { learningApi } from '../services/api';

const ICON_MAP: Record<string, any> = {
  TrendingUp,
  Building2,
  FileText,
  BarChart2,
  Calculator,
  PieChart,
  Clock,
  ShieldCheck,
  Layers,
  Coins,
  BookOpen,
};

export const LearningCenterPage: React.FC = () => {
  const navigate = useNavigate();
  const [modules, setModules] = useState<LearningModule[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLearningData = async () => {
    setIsLoading(true);
    try {
      const [moduleList, statsData] = await Promise.all([
        learningApi.getModules(),
        learningApi.getStats(),
      ]);
      setModules(moduleList);
      setStats(statsData);
    } catch (err) {
      console.error('Failed to load learning modules', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLearningData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Learning Stats Hero */}
      <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
              Financial Literacy Curriculum
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#172B4D] tracking-tight">
            Learn Investing by Doing
          </h1>
          <p className="text-xs text-[#64748B] mt-1 max-w-xl leading-relaxed">
            Master stock valuation, balance sheets, compounding, and risk management with bite-sized lessons, Indian Rupee examples, and interactive quizzes.
          </p>
        </div>

        {/* Overall Progress Widget */}
        <div className="p-4 rounded-xl bg-slate-50 border border-[#E2E8F0] min-w-[240px] space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-[#172B4D]">Curriculum Progress</span>
            <span className="font-bold text-blue-600">{stats?.overallProgressPercent || 0}%</span>
          </div>

          <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 rounded-full transition-all duration-500"
              style={{ width: `${stats?.overallProgressPercent || 0}%` }}
            />
          </div>

          <div className="flex justify-between text-[11px] text-[#64748B]">
            <span>{stats?.completedLessons || 0} / {stats?.totalLessons || 0} Lessons</span>
            <span>{stats?.quizzesPassedCount || 0} Quizzes Passed</span>
          </div>
        </div>
      </div>

      {/* 10 Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {modules.map((m) => {
          const IconComponent = ICON_MAP[m.iconName] || BookOpen;

          return (
            <div
              key={m.id}
              onClick={() => navigate(`/learn/${m.id}`)}
              className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-sm hover:shadow-md cursor-pointer transition-all flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <IconComponent className="w-5 h-5" />
                  </div>
                  {m.isCompleted ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Completed
                    </span>
                  ) : (
                    <span className="text-[11px] font-semibold text-[#64748B] bg-slate-100 px-2.5 py-1 rounded-full">
                      {m.difficulty}
                    </span>
                  )}
                </div>

                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600">
                    {m.category}
                  </span>
                  <h3 className="text-base font-bold text-[#172B4D] group-hover:text-blue-600 transition-colors mt-0.5">
                    {m.title}
                  </h3>
                  <p className="text-xs text-[#64748B] line-clamp-2 mt-1 leading-relaxed">
                    {m.description}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-[#64748B]">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {m.readingTimeMins} mins
                  </span>
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5" />
                    {m.completedLessonsCount || 0}/{m.lessonsCount || 1} Lessons
                  </span>
                </div>

                <span className="font-bold text-blue-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  <span>Start Module</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
