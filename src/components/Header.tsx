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
  RefreshCw,
  User,
  ShieldCheck,
  LogIn,
  LogOut,
  Award,
  FileSpreadsheet
} from 'lucide-react';
import { GradeConfig, AuthSession, SCHOOL_LOGO_URL } from '../types';
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
  currentSession: AuthSession | null;
  onOpenLoginModal: () => void;
  onLogout: () => void;
  onOpenMyReport?: () => void;
  onOpenAdminScores?: () => void;
  onOpenClassroomReport?: () => void;
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
  currentSession,
  onOpenLoginModal,
  onLogout,
  onOpenMyReport,
  onOpenAdminScores,
  onOpenClassroomReport,
}) => {
  const isAdmin = currentSession?.role === 'admin';
  const isStudent = currentSession?.role === 'student';

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs" id="main-header">
      {/* Top Banner with School Emblem, Title, Cloud Status, and Auth Status */}
      <div className="bg-linear-to-r from-blue-900 via-indigo-900 to-blue-950 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
            
            {/* School Emblem & Title */}
            <div className="flex items-center space-x-3.5" id="school-branding">
              {/* Official School Emblem / Logo */}
              <div className="relative flex-shrink-0 w-12 h-12 rounded-2xl bg-white p-0.5 shadow-md flex items-center justify-center overflow-hidden border-2 border-amber-400">
                <img 
                  src={SCHOOL_LOGO_URL} 
                  alt="ตราสัญลักษณ์โรงเรียนราษฎร์บำรุงศิลป์" 
                  className="w-full h-full object-contain rounded-xl"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-800/80 text-amber-300 border border-blue-700/60 flex items-center gap-1">
                    <School className="w-3 h-3" />
                    โรงเรียนราษฎร์บำรุงศิลป์
                  </span>
                  <span className="hidden sm:inline-block text-xs text-blue-200">
                    ฝ่ายการศึกษา อัครสังฆมณฑลกรุงเทพฯ
                  </span>
                </div>
                <h1 className="text-base sm:text-lg md:text-xl font-bold tracking-tight text-white mt-0.5">
                  ระบบคลังเก็บข้อสอบออนไลน์ & รายงานคะแนนมาตรฐาน
                </h1>
              </div>
            </div>

            {/* Right Side: Cloud Badge, User Authentication, and Actions */}
            <div className="flex items-center gap-2 self-start lg:self-auto flex-wrap">
              
              {/* Cloud Real-Time Sync Indicator */}
              <div 
                id="cloud-sync-status-badge"
                className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${
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
                <Cloud className="w-3 h-3" />
                <span className="text-[11px]">
                  {cloudStatus === 'synced' 
                    ? 'คลาวด์สด' 
                    : cloudStatus === 'syncing' 
                    ? 'กำลังอัปเดต...' 
                    : 'ออฟไลน์'}
                </span>
                {onForceSync && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onForceSync();
                    }}
                    title="กดเพื่อซิงค์ข้อมูลขึ้น Cloud ใหม่"
                    className="hover:text-white p-0.5 rounded cursor-pointer transition-colors"
                  >
                    <RefreshCw className={`w-2.5 h-2.5 ${cloudStatus === 'syncing' ? 'animate-spin' : ''}`} />
                  </button>
                )}
              </div>

              {/* USER AUTHENTICATION BADGE & CONTROLS */}
              {currentSession ? (
                <div className="flex items-center gap-1.5 bg-blue-950/90 border border-blue-700/80 rounded-xl p-1 shadow-inner">
                  {isAdmin ? (
                    /* Admin User Badge */
                    <div className="flex items-center gap-1.5 px-2 py-0.5 text-xs">
                      <ShieldCheck className="w-4 h-4 text-amber-400" />
                      <div>
                        <span className="font-bold text-amber-300 block text-[11px] leading-tight">ผู้ดูแลระบบ (Admin)</span>
                        <span className="text-[10px] text-blue-200">{currentSession.adminName || 'Admin'}</span>
                      </div>
                    </div>
                  ) : (
                    /* Student User Badge */
                    <div className="flex items-center gap-1.5 px-2 py-0.5 text-xs">
                      <GraduationCap className="w-4 h-4 text-emerald-400" />
                      <div>
                        <span className="font-bold text-white block text-[11px] leading-tight truncate max-w-[140px]">
                          {currentSession.student?.name}
                        </span>
                        <span className="text-[10px] text-emerald-300">
                          #{currentSession.student?.studentCode} • {currentSession.student?.level} ({currentSession.student?.room})
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Student Standard Score Report Button */}
                  {isStudent && onOpenMyReport && (
                    <button
                      type="button"
                      onClick={onOpenMyReport}
                      id="header-btn-my-report"
                      title="ดูใบรายงานผลคะแนนสอบมาตรฐานของฉัน"
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                    >
                      <Award className="w-3.5 h-3.5 text-amber-300" />
                      <span>ผลสอบของฉัน</span>
                    </button>
                  )}

                  {/* Admin Score Management Dashboard Button */}
                  {isAdmin && onOpenAdminScores && (
                    <button
                      type="button"
                      onClick={onOpenAdminScores}
                      id="header-btn-admin-scores"
                      title="เปิดดูและจัดการรายงานคะแนนสอบนักเรียนทั้งหมด"
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-700 hover:bg-indigo-600 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5 text-amber-300" />
                      <span>บันทึกคะแนนรวม</span>
                    </button>
                  )}

                  {/* Classroom Score Report Button for Teachers/Admins */}
                  {onOpenClassroomReport && (
                    <button
                      type="button"
                      onClick={onOpenClassroomReport}
                      id="header-btn-classroom-scores"
                      title="เปิดดูรายงานผลคะแนนสอบแยกตามรายชั้นเรียนสำหรับครู"
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                    >
                      <GraduationCap className="w-3.5 h-3.5 text-amber-300" />
                      <span>คะแนนรายชั้นเรียน</span>
                    </button>
                  )}

                  {/* Switch Account / Logout */}
                  <button
                    type="button"
                    onClick={onLogout}
                    title="สลับบัญชี หรือ ออกจากระบบ"
                    className="p-1.5 rounded-lg text-slate-300 hover:text-rose-300 hover:bg-rose-950/40 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                /* Login Button when not logged in */
                <button
                  type="button"
                  id="header-btn-login"
                  onClick={onOpenLoginModal}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-blue-950 text-xs font-bold shadow-sm transition-all duration-150 cursor-pointer active:scale-95"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>เข้าสู่ระบบ (Login)</span>
                </button>
              )}

              {/* ADMIN ACTIONS: Only visible when logged in as Admin */}
              {isAdmin && (
                <>
                  {onOpenAdminHtml && (
                    <button
                      type="button"
                      onClick={onOpenAdminHtml}
                      id="header-btn-admin-html"
                      title="บล็อครับค่าข้อสอบออนไลน์ HTML โดย Admin"
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-violet-700 hover:bg-violet-600 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer active:scale-95 border border-violet-500/50"
                    >
                      <Code2 className="w-3.5 h-3.5 text-amber-300" />
                      <span className="hidden sm:inline">รับค่าข้อสอบ HTML</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={onOpenAddSubject}
                    id="header-btn-add-subject"
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-blue-950 text-xs font-bold shadow-sm transition-all cursor-pointer active:scale-95"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>เพิ่มวิชา (+)</span>
                  </button>

                  <button
                    type="button"
                    onClick={onResetData}
                    title="รีเซ็ตเป็นข้อมูลตัวอย่างเริ่มต้น"
                    id="header-btn-reset"
                    className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg bg-blue-800/60 hover:bg-blue-800 text-blue-200 hover:text-white text-xs font-medium border border-blue-700/50 transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span className="hidden xl:inline">คืนค่าตัวอย่าง</span>
                  </button>
                </>
              )}

            </div>

          </div>
        </div>
      </div>

      {/* Control Bar: Search & Academic Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
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
              className="w-full pl-10 pr-4 py-1.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-slate-800 placeholder:text-slate-400"
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
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            <div className="flex items-center gap-1 text-xs text-slate-600 font-medium">
              <BookOpen className="w-3.5 h-3.5 text-slate-500" />
              <span>ปีการศึกษา:</span>
            </div>
            <select
              id="select-academic-year"
              value={selectedYear}
              onChange={(e) => onYearChange(e.target.value)}
              className="bg-white border border-slate-300 text-slate-700 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">ทุกปีการศึกษา</option>
              <option value="2567">ปีการศึกษา 2567</option>
              <option value="2566">ปีการศึกษา 2566</option>
            </select>

            <select
              id="select-academic-term"
              value={selectedTerm}
              onChange={(e) => onTermChange(e.target.value)}
              className="bg-white border border-slate-300 text-slate-700 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">ทุกภาคเรียน</option>
              <option value="1">ภาคเรียนที่ 1</option>
              <option value="2">ภาคเรียนที่ 2</option>
            </select>

            <div className="hidden md:flex items-center gap-2 pl-3 border-l border-slate-200 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md font-semibold">
                <Sparkles className="w-3 h-3" />
                {totalSubjects} วิชา
              </span>
              <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md font-semibold">
                {totalExams} ข้อสอบ
              </span>
            </div>
          </div>

        </div>
      </div>
    </header>
  );
};
