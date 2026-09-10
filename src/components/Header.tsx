import React from 'react';
import { 
  GraduationCap, 
  Search, 
  BookOpen, 
  PlusCircle, 
  RotateCcw,
  Sparkles,
  School,
  Code2,
  Cloud,
  RefreshCw
} from 'lucide-react';
import { GradeConfig } from '../types';
import { CloudSyncStatus } from '../services/examSyncService';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedYear: string;
  onYearChange: (year: string) => void;
  selectedTerm: string;
  onTermChange: (term: string) => void;
  onOpenAddSubject: () => void;
  onOpenAdminHtml?: () => void;
  onResetData: () => void;
  activeGrade: GradeConfig;
  totalSubjects: number;
  totalExams: number;
  cloudStatus?: CloudSyncStatus;
  cloudMessage?: string;
  onForceSync?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  onSearchChange,
  selectedYear,
  onYearChange,
  selectedTerm,
  onTermChange,
  onOpenAddSubject,
  onOpenAdminHtml,
  onResetData,
  activeGrade,
  totalSubjects,
  totalExams,
  cloudStatus = 'synced',
  cloudMessage,
  onForceSync,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs" id="main-header">
      {/* Top Banner with School Emblem and Title */}
      <div className="bg-linear-to-r from-blue-900 via-indigo-900 to-blue-950 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            
            {/* School Emblem & Title */}
            <div className="flex items-center space-x-3.5" id="school-branding">
              {/* Simulated School Crest / Emblem */}
              <div className="relative flex-shrink-0 w-13 h-13 rounded-2xl bg-linear-to-br from-amber-400 via-amber-300 to-amber-500 p-0.5 shadow-md flex items-center justify-center">
                <div className="w-full h-full bg-blue-950 rounded-[14px] flex flex-col items-center justify-center p-1 border border-amber-300/40">
                  <GraduationCap className="w-6 h-6 text-amber-300" />
                  <span className="text-[9px] font-bold tracking-wider text-amber-200">ร.บ.ศ.</span>
                </div>
                <div className="absolute -bottom-1 -right-1 bg-amber-400 text-blue-950 text-[9px] font-extrabold px-1.5 py-0.2 rounded-full shadow-xs">
                  RBSS
                </div>
              </div>

              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-800/80 text-amber-300 border border-blue-700/60 flex items-center gap-1">
                    <School className="w-3 h-3" />
                    โรงเรียนราษฎร์บำรุงศิลป์
                  </span>
                  <span className="hidden sm:inline-block text-xs text-blue-200">
                    กลุ่มงานบริหารวิชาการ
                  </span>
                </div>
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-white mt-0.5">
                  ระบบคลังเก็บข้อสอบออนไลน์
                </h1>
                <p className="text-xs text-blue-200 hidden sm:block">
                  คลังรวบรวมข้อสอบ แบบทดสอบ และเอกสารประเมินผลการเรียนรู้ ระดับชั้น ป.1 - ม.3
                </p>
              </div>
            </div>

            {/* Quick Actions & Reset Button */}
            <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
              {/* Cloud Real-Time Sync Indicator */}
              <div 
                id="cloud-sync-status-badge"
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                  cloudStatus === 'synced' 
                    ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/50 shadow-xs'
                    : cloudStatus === 'syncing' || cloudStatus === 'connecting'
                    ? 'bg-amber-950/60 text-amber-300 border-amber-500/50 animate-pulse'
                    : 'bg-rose-950/60 text-rose-300 border-rose-500/50'
                }`}
                title={cloudMessage || 'ระบบซิงค์ Firebase Firestore: เมื่อแก้ไขหรือบันทึกข้อสอบจากเครื่องใด เครื่องอื่นจะเห็นทันที'}
              >
                <span className="relative flex h-2 w-2">
                  {cloudStatus === 'synced' && (
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  )}
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${
                    cloudStatus === 'synced' ? 'bg-emerald-400' : cloudStatus === 'syncing' ? 'bg-amber-400' : 'bg-rose-400'
                  }`}></span>
                </span>
                <Cloud className="w-3.5 h-3.5" />
                <span>
                  {cloudStatus === 'synced' 
                    ? 'คลาวด์สด (Real-time)' 
                    : cloudStatus === 'syncing' 
                    ? 'กำลังอัปเดต Cloud...' 
                    : 'ออฟไลน์'}
                </span>
                {onForceSync && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onForceSync();
                    }}
                    title="กดเพื่อบังคับซิงค์ข้อมูลทั้งหมดขึ้น Cloud ใหม่"
                    className="ml-1 hover:text-white p-0.5 rounded cursor-pointer transition-colors"
                  >
                    <RefreshCw className={`w-3 h-3 ${cloudStatus === 'syncing' ? 'animate-spin' : ''}`} />
                  </button>
                )}
              </div>

              {onOpenAdminHtml && (
                <button
                  type="button"
                  onClick={onOpenAdminHtml}
                  id="header-btn-admin-html"
                  title="บล็อครับค่าข้อสอบออนไลน์ HTML โดย Admin"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-violet-700 hover:bg-violet-600 text-white text-xs font-semibold shadow-sm transition-all duration-150 cursor-pointer active:scale-95 border border-violet-500/50"
                >
                  <Code2 className="w-4 h-4 text-amber-300" />
                  <span>รับค่าข้อสอบ HTML (Admin)</span>
                </button>
              )}

              <button
                type="button"
                onClick={onOpenAddSubject}
                id="header-btn-add-subject"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-blue-950 text-sm font-semibold shadow-sm transition-all duration-150 cursor-pointer active:scale-95"
              >
                <PlusCircle className="w-4 h-4" />
                <span>เพิ่มรายวิชา (+)</span>
              </button>

              <button
                type="button"
                onClick={onResetData}
                title="รีเซ็ตเป็นข้อมูลตัวอย่างเริ่มต้น"
                id="header-btn-reset"
                className="inline-flex items-center gap-1 px-2.5 py-2 rounded-lg bg-blue-800/60 hover:bg-blue-800 text-blue-200 hover:text-white text-xs font-medium border border-blue-700/50 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">คืนค่าข้อมูลตัวอย่าง</span>
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* Control Bar: Search & Academic Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          {/* Search Input */}
          <div className="relative flex-1 max-w-lg">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              id="search-exam-input"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={`ค้นหาวิชา, รหัสวิชา, ครูผู้สอน หรือชุดข้อสอบใน ${activeGrade.shortName}...`}
              className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-slate-800 placeholder:text-slate-400"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 px-1"
              >
                ล้าง
              </button>
            )}
          </div>

          {/* Academic Filters: Year and Term */}
          <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
            <div className="flex items-center gap-1 text-xs text-slate-600 font-medium">
              <BookOpen className="w-4 h-4 text-slate-500" />
              <span>ปีการศึกษา:</span>
            </div>
            <select
              id="select-academic-year"
              value={selectedYear}
              onChange={(e) => onYearChange(e.target.value)}
              className="bg-white border border-slate-300 text-slate-700 text-xs sm:text-sm rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">ทุกปีการศึกษา</option>
              <option value="2567">ปีการศึกษา 2567</option>
              <option value="2566">ปีการศึกษา 2566</option>
            </select>

            <select
              id="select-academic-term"
              value={selectedTerm}
              onChange={(e) => onTermChange(e.target.value)}
              className="bg-white border border-slate-300 text-slate-700 text-xs sm:text-sm rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">ทุกภาคเรียน</option>
              <option value="1">ภาคเรียนที่ 1</option>
              <option value="2">ภาคเรียนที่ 2</option>
            </select>

            <div className="hidden md:flex items-center gap-2 pl-3 border-l border-slate-200 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1 rounded-md font-semibold">
                <Sparkles className="w-3 h-3" />
                {totalSubjects} วิชา
              </span>
              <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2 py-1 rounded-md font-semibold">
                {totalExams} ข้อสอบ
              </span>
            </div>
          </div>

        </div>
      </div>
    </header>
  );
};
