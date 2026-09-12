import React from 'react';
import { GradeConfig, GradeId, SubjectBlock } from '../types';
import { BookOpen, Layers } from 'lucide-react';

interface GradeNavigationProps {
  grades?: GradeConfig[];
  activeGradeId: GradeId;
  onSelectGrade: (gradeId: GradeId) => void;
  subjects?: SubjectBlock[];
  allSubjects?: SubjectBlock[];
}

export const GradeNavigation: React.FC<GradeNavigationProps> = ({
  grades = [],
  activeGradeId,
  onSelectGrade,
  subjects,
  allSubjects,
}) => {
  const effectiveSubjects = subjects || allSubjects || [];
  const primaryGrades = (grades || []).filter((g) => g.level === 'primary');
  const secondaryGrades = (grades || []).filter((g) => g.level === 'secondary');

  const getCountsForGrade = (gradeId: GradeId) => {
    const gradeSubjects = effectiveSubjects.filter((s) => s.gradeId === gradeId);
    const examCount = gradeSubjects.reduce((acc, curr) => acc + (curr.exams?.length || 0), 0);
    return {
      subjectsCount: gradeSubjects.length,
      examsCount: examCount,
    };
  };

  return (
    <nav aria-label="เลือกระดับชั้นเรียน" id="grade-navigation-container" className="bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2.5">
          
          {/* Level Switchers */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full">
            
            {/* Primary School Section (ป.1 - ป.6) */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none" id="primary-grades-nav">
              <span className="hidden xl:inline-flex items-center gap-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider pl-1 pr-2 whitespace-nowrap">
                <Layers className="w-3.5 h-3.5 text-blue-500" />
                ประถมฯ:
              </span>
              <div className="inline-flex bg-slate-100 p-1 rounded-xl gap-1">
                {primaryGrades.map((g) => {
                  const isActive = g.id === activeGradeId;
                  const { subjectsCount, examsCount } = getCountsForGrade(g.id);

                  return (
                    <button
                      key={g.id}
                      id={`grade-tab-${g.id}`}
                      type="button"
                      onClick={() => onSelectGrade(g.id)}
                      className={`relative px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-150 flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                        isActive
                          ? 'bg-blue-700 text-white shadow-xs font-semibold'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
                      }`}
                    >
                      <span>{g.shortName}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold transition-colors ${
                          isActive
                            ? 'bg-blue-900 text-amber-300'
                            : 'bg-slate-200 text-slate-600'
                        }`}
                        title={`${subjectsCount} วิชา, ${examsCount} ข้อสอบ`}
                      >
                        {examsCount}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Divider for larger screens */}
            <div className="hidden sm:block h-6 w-px bg-slate-200" />

            {/* Secondary School Section (ม.1 - ม.3) */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none" id="secondary-grades-nav">
              <span className="hidden xl:inline-flex items-center gap-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider pl-1 pr-2 whitespace-nowrap">
                <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                มัธยมฯ:
              </span>
              <div className="inline-flex bg-slate-100 p-1 rounded-xl gap-1">
                {secondaryGrades.map((g) => {
                  const isActive = g.id === activeGradeId;
                  const { subjectsCount, examsCount } = getCountsForGrade(g.id);

                  return (
                    <button
                      key={g.id}
                      id={`grade-tab-${g.id}`}
                      type="button"
                      onClick={() => onSelectGrade(g.id)}
                      className={`relative px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-150 flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                        isActive
                          ? 'bg-indigo-700 text-white shadow-xs font-semibold'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
                      }`}
                    >
                      <span>{g.shortName}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold transition-colors ${
                          isActive
                            ? 'bg-indigo-950 text-amber-300'
                            : 'bg-slate-200 text-slate-600'
                        }`}
                        title={`${subjectsCount} วิชา, ${examsCount} ข้อสอบ`}
                      >
                        {examsCount}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

        </div>
      </div>
    </nav>
  );
};
