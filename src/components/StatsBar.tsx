import React from 'react';
import { GradeConfig, LearningArea } from '../types';
import { 
  BookOpen, 
  FileText, 
  PlusCircle, 
  GraduationCap, 
  Layers,
  Filter
} from 'lucide-react';

interface StatsBarProps {
  activeGrade: GradeConfig;
  subjectCount: number;
  examCount: number;
  selectedAreaFilter: string;
  onAreaFilterChange: (area: string) => void;
  onOpenAddSubject: () => void;
}

const LEARNING_AREAS_LIST: { id: string; name: string }[] = [
  { id: 'all', name: 'ทุกกลุ่มสาระการเรียนรู้' },
  { id: 'ภาษาไทย', name: 'ภาษาไทย' },
  { id: 'คณิตศาสตร์', name: 'คณิตศาสตร์' },
  { id: 'วิทยาศาสตร์และเทคโนโลยี', name: 'วิทยาศาสตร์และเทคโนโลยี' },
  { id: 'ภาษาต่างประเทศ', name: 'ภาษาต่างประเทศ' },
  { id: 'สังคมศึกษา ศาสนา และวัฒนธรรม', name: 'สังคมศึกษาฯ' },
  { id: 'สุขศึกษาและพลศึกษา', name: 'สุขศึกษาและพลศึกษา' },
  { id: 'ศิลปะ', name: 'ศิลปะ' },
  { id: 'การงานอาชีพ', name: 'การงานอาชีพ' },
  { id: 'วิชาเพิ่มเติม/อื่นๆ', name: 'วิชาเพิ่มเติม' },
];

export const StatsBar: React.FC<StatsBarProps> = ({
  activeGrade,
  subjectCount,
  examCount,
  selectedAreaFilter,
  onAreaFilterChange,
  onOpenAddSubject,
}) => {
  return (
    <div className="bg-white border-b border-slate-200 py-4" id="grade-header-bar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Title of Active Grade */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-white shadow-xs ${
              activeGrade.level === 'primary' 
                ? 'bg-linear-to-br from-blue-600 to-blue-800' 
                : 'bg-linear-to-br from-indigo-600 to-indigo-800'
            }`}>
              <span className="text-sm sm:text-base tracking-tight">{activeGrade.shortName}</span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  {activeGrade.levelLabel}
                </span>
                <span className="text-xs text-slate-400">
                  ภาคการเรียนรู้ตามหลักสูตรแกนกลาง
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 mt-0.5">
                {activeGrade.fullName}
              </h2>
            </div>
          </div>

          {/* Quick Metrics & Add Subject Button */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs">
              <BookOpen className="w-4 h-4 text-blue-600" />
              <span className="text-slate-600">รายวิชาทั้งหมด:</span>
              <strong className="text-slate-900 font-bold">{subjectCount} วิชา</strong>
            </div>

            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs">
              <FileText className="w-4 h-4 text-emerald-600" />
              <span className="text-slate-600">ชุดข้อสอบในชั้นนี้:</span>
              <strong className="text-slate-900 font-bold">{examCount} ฉบับ</strong>
            </div>

            <button
              type="button"
              id="btn-add-subject-in-grade"
              onClick={onOpenAddSubject}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs sm:text-sm font-semibold shadow-xs transition-all duration-150 cursor-pointer active:scale-95"
            >
              <PlusCircle className="w-4 h-4 text-amber-300" />
              <span>เพิ่มรายวิชาใน {activeGrade.shortName} (+)</span>
            </button>
          </div>

        </div>

        {/* Filter by Learning Area (กลุ่มสาระ) */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <div className="flex items-center gap-1 text-xs text-slate-500 font-medium shrink-0 pr-1">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>กลุ่มสาระ:</span>
          </div>
          
          <div className="flex items-center gap-1.5 flex-nowrap">
            {LEARNING_AREAS_LIST.map((item) => {
              const isSelected = selectedAreaFilter === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onAreaFilterChange(item.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-900 text-white font-semibold shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {item.name}
                </button>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};
