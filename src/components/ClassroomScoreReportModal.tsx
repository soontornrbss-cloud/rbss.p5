import React, { useState, useMemo, useEffect } from 'react';
import { 
  StudentRecord, 
  ExamSubmissionRecord, 
  SubjectBlock,
  SCHOOL_LOGO_URL,
  SCHOOL_AFFILIATION_ADDRESS
} from '../types';
import { 
  getAllLevels, 
  getRoomsForLevel, 
  getStudentsInClass,
  getAllClassGroups
} from '../services/studentService';
import { 
  Printer, 
  X, 
  School, 
  Search, 
  Filter, 
  Award, 
  Users, 
  BarChart3, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink,
  ChevronRight,
  GraduationCap,
  BookOpen,
  Download
} from 'lucide-react';
import { 
  generateClassroomReportHtml, 
  printDirectly, 
  openInNewTabAndPrint, 
  downloadHtmlFile 
} from '../utils/printUtils';

interface ClassroomScoreReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  allScores?: ExamSubmissionRecord[];
  allSubjects?: SubjectBlock[];
  onOpenStudentReport: (student: StudentRecord) => void;
  initialLevel?: string;
  initialRoom?: string;
}

export const ClassroomScoreReportModal: React.FC<ClassroomScoreReportModalProps> = ({
  isOpen,
  onClose,
  allScores = [],
  allSubjects = [],
  onOpenStudentReport,
  initialLevel,
  initialRoom,
}) => {
  // Listen for Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const levels = useMemo(() => getAllLevels(), []);
  
  // Default to initial or first available level (preferably primary e.g. ประถมศึกษาปีที่ 1 or first in list)
  const defaultLevel = useMemo(() => {
    if (initialLevel) return initialLevel;
    const p1 = levels.find(l => l.includes('ประถมศึกษาปีที่ 1') || l.includes('ป.1'));
    return p1 || levels[0] || 'ประถมศึกษาปีที่ 1';
  }, [levels, initialLevel]);

  const [selectedLevel, setSelectedLevel] = useState<string>(defaultLevel);
  const availableRooms = useMemo(() => getRoomsForLevel(selectedLevel), [selectedLevel]);

  const [selectedRoom, setSelectedRoom] = useState<string>(initialRoom || '1');
  const [subjectFilter, setSubjectFilter] = useState<string>('all');
  const [searchKeyword, setSearchKeyword] = useState<string>('');

  // Keep room valid when level changes
  useEffect(() => {
    if (availableRooms.length > 0 && !availableRooms.includes(selectedRoom)) {
      setSelectedRoom(availableRooms[0]);
    }
  }, [selectedLevel, availableRooms, selectedRoom]);

  // Update when initial props change
  useEffect(() => {
    if (initialLevel) setSelectedLevel(initialLevel);
    if (initialRoom) setSelectedRoom(initialRoom);
  }, [initialLevel, initialRoom]);

  // All students belonging to this class
  const classStudents = useMemo(() => {
    return getStudentsInClass(selectedLevel, selectedRoom);
  }, [selectedLevel, selectedRoom]);

  // All scores belonging to students in this class
  const classScores = useMemo(() => {
    return (allScores || []).filter(s => {
      const matchLevel = s.level === selectedLevel;
      const matchRoom = s.room === selectedRoom;
      return matchLevel && matchRoom;
    });
  }, [allScores, selectedLevel, selectedRoom]);

  // Compute full student gradebook data for the classroom (unfiltered by search for official reporting)
  const fullClassGradebook = useMemo(() => {
    // Map scores by student code
    const scoreMap = new Map<string, ExamSubmissionRecord[]>();
    classScores.forEach(s => {
      if (!scoreMap.has(s.studentCode)) {
        scoreMap.set(s.studentCode, []);
      }
      scoreMap.get(s.studentCode)!.push(s);
    });

    return classStudents.map((student, index) => {
      let studentExams = scoreMap.get(student.studentCode) || [];

      // Filter by subject if specified
      if (subjectFilter !== 'all') {
        studentExams = studentExams.filter(
          e => e.subjectId === subjectFilter || e.subjectCode === subjectFilter
        );
      }

      const examsCount = studentExams.length;
      const totalScore = studentExams.reduce((acc, curr) => acc + curr.score, 0);
      const totalMax = studentExams.reduce((acc, curr) => acc + curr.maxScore, 0);
      const avgPercentage = totalMax > 0 ? (totalScore / totalMax) * 100 : 0;
      const passedCount = studentExams.filter(e => e.isPassed).length;

      let status: 'passed' | 'failed' | 'not_tested' = 'not_tested';
      if (examsCount > 0) {
        status = avgPercentage >= 50 ? 'passed' : 'failed';
      }

      return {
        number: student.number || (index + 1),
        student,
        exams: studentExams,
        examsCount,
        totalScore,
        totalMax,
        avgPercentage,
        passedCount,
        status,
      };
    });
  }, [classStudents, classScores, subjectFilter]);

  // Screen-filtered gradebook (when searching on screen)
  const studentGradebook = useMemo(() => {
    if (!searchKeyword.trim()) return fullClassGradebook;
    const kw = searchKeyword.toLowerCase().trim();
    return fullClassGradebook.filter(r => 
      r.student.studentCode.includes(kw) ||
      r.student.name.toLowerCase().includes(kw)
    );
  }, [fullClassGradebook, searchKeyword]);

  // Classroom Overall Stats
  const classStats = useMemo(() => {
    const totalStudents = classStudents.length;
    const testedStudents = fullClassGradebook.filter(s => s.examsCount > 0);
    const testedCount = testedStudents.length;
    const testedRate = totalStudents > 0 ? (testedCount / totalStudents) * 100 : 0;

    const totalPct = testedStudents.reduce((acc, curr) => acc + curr.avgPercentage, 0);
    const classAveragePct = testedCount > 0 ? totalPct / testedCount : 0;

    const passCount = testedStudents.filter(s => s.status === 'passed').length;
    const passRate = testedCount > 0 ? (passCount / testedCount) * 100 : 0;

    return {
      totalStudents,
      testedCount,
      testedRate,
      classAveragePct,
      passCount,
      passRate,
    };
  }, [classStudents, fullClassGradebook]);

  // Available subjects for the filter dropdown
  const classSubjects = useMemo(() => {
    const set = new Map<string, string>();
    classScores.forEach(s => {
      if (s.subjectId && s.subjectName) {
        set.set(s.subjectId, s.subjectName);
      }
    });
    return Array.from(set.entries()).map(([id, name]) => ({ id, name }));
  }, [classScores]);

  const currentDateStr = useMemo(() => {
    return new Date().toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }, []);

  const classroomReportHtml = useMemo(() => {
    if (!isOpen) return '';
    return generateClassroomReportHtml({
      schoolName: 'โรงเรียนราษฎร์บำรุงศิลป์',
      affiliation: SCHOOL_AFFILIATION_ADDRESS,
      reportTitle: 'แบบรายงานสรุปผลการประเมินและการทดสอบมาตรฐาน (ประจำชั้นเรียน)',
      level: selectedLevel,
      room: selectedRoom,
      academicYear: '2568',
      term: 'ภาคเรียนที่ 1',
      dateStr: currentDateStr,
      totalStudents: classStudents.length,
      testedCount: classStats.testedCount,
      testedRate: classStats.testedRate,
      classAveragePct: classStats.classAveragePct,
      passCount: classStats.passCount,
      passRate: classStats.passRate,
      students: fullClassGradebook.map((row) => ({
        number: row.number,
        studentCode: row.student.studentCode,
        name: row.student.name,
        examsText: row.exams.length === 0 
          ? 'ยังไม่ได้เข้าสอบ' 
          : row.exams.map(e => `${e.subjectName}: ${e.score}/${e.maxScore} (${e.percentage.toFixed(0)}%)`).join(' • '),
        totalScoreText: row.examsCount > 0 ? `${row.totalScore}/${row.totalMax}` : '-',
        avgPctText: row.examsCount > 0 ? `${row.avgPercentage.toFixed(1)}%` : '-',
        statusText: row.status === 'passed' ? 'ผ่านเกณฑ์' : (row.status === 'failed' ? 'ต้องปรับปรุง' : 'ขาดสอบ')
      }))
    });
  }, [isOpen, selectedLevel, selectedRoom, currentDateStr, classStudents.length, classStats, fullClassGradebook]);

  const handlePrint = () => {
    printDirectly(classroomReportHtml);
  };

  const handleOpenNewTab = () => {
    openInNewTabAndPrint(classroomReportHtml);
  };

  const handleDownload = () => {
    downloadHtmlFile(`รายงานคะแนน_${selectedLevel.replace(/\s+/g, '')}_ห้อง${selectedRoom}.html`, classroomReportHtml);
  };

  // Early return MUST occur after ALL React hooks have been called
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 overflow-hidden bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 print:static print:inset-auto print:p-0 print:m-0 print:bg-white print:overflow-visible print:block"
      id="classroom-score-modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* On-screen Modal View (Completely hidden during printing) */}
      <div 
        id="classroom-score-modal"
        className="relative bg-white w-full max-w-6xl max-h-[92vh] rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto rbss-screen-only print:hidden"
      >
        {/* Top Control Bar */}
        <header className="bg-slate-900 text-white px-4 sm:px-6 py-3.5 flex items-center justify-between shrink-0 border-b border-slate-800">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-white p-0.5 flex items-center justify-center shrink-0 shadow-xs border border-amber-400 overflow-hidden">
              <img 
                src={SCHOOL_LOGO_URL} 
                alt="ตราสัญลักษณ์โรงเรียนราษฎร์บำรุงศิลป์" 
                className="w-full h-full object-contain rounded-lg"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  รายงานผลคะแนนรายชั้นเรียน
                </span>
                <span className="text-xs text-slate-400 hidden sm:inline">
                  โรงเรียนราษฎร์บำรุงศิลป์
                </span>
              </div>
              <h2 className="text-sm sm:text-base font-bold text-white truncate mt-0.5">
                สมุดบันทึกคะแนนและการประเมินผล ประจำชั้น {selectedLevel} ห้อง {selectedRoom}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
            <button
              type="button"
              onClick={handlePrint}
              id="btn-print-class-report"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-blue-950 text-xs font-bold shadow-xs transition-colors cursor-pointer"
              title="พิมพ์เอกสาร A4 ทันที (Direct Print)"
            >
              <Printer className="w-4 h-4" />
              <span>พิมพ์ A4 (1 หน้า)</span>
            </button>

            <button
              type="button"
              onClick={handleOpenNewTab}
              id="btn-open-tab-class-report"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-700 hover:bg-blue-600 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              title="เปิดหน้าต่างพิมพ์ในแท็บใหม่ (รองรับกรณีพรีวิว iframe บล็อกการพิมพ์)"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden md:inline">เปิดแท็บพิมพ์ใหม่</span>
            </button>

            <button
              type="button"
              onClick={handleDownload}
              id="btn-download-class-report"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              title="ดาวน์โหลดไฟล์ A4 พร้อมพิมพ์เพื่อเปิดในเบราว์เซอร์หรือแปลงเป็น PDF"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">ดาวน์โหลดไฟล์ A4</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              id="btn-close-class-report-top"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
              title="ปิดหน้าต่าง (Close)"
            >
              <X className="w-4 h-4" />
              <span className="hidden sm:inline">ปิด</span>
            </button>
          </div>
        </header>

        {/* Quick Printing Helper Tip Banner */}
        <div className="bg-amber-50/90 border-b border-amber-200 px-4 sm:px-6 py-2 flex items-center justify-between gap-2 text-xs text-amber-900 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-amber-200 text-amber-800 flex items-center justify-center text-[11px] font-bold shrink-0">💡</span>
            <span>
              <strong>คำแนะนำการพิมพ์:</strong> สามารถกดปุ่ม <strong>"พิมพ์ A4 (1 หน้า)"</strong> ได้ทันที หากระบบเบราว์เซอร์หรือหน้าต่างพรีวิวไม่อนุญาต ให้คลิก <strong>"เปิดแท็บพิมพ์ใหม่"</strong> หรือ <strong>"ดาวน์โหลดไฟล์ A4"</strong> เพื่อเปิดและสั่งพิมพ์ / บันทึก PDF ได้ 100%
            </span>
          </div>
          <div className="hidden lg:flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={handleOpenNewTab}
              className="text-xs text-blue-700 underline font-semibold hover:text-blue-900 cursor-pointer"
            >
              เปิดแท็บพิมพ์ใหม่
            </button>
            <span className="text-slate-300">|</span>
            <button
              type="button"
              onClick={handleDownload}
              className="text-xs text-emerald-700 underline font-semibold hover:text-emerald-900 cursor-pointer"
            >
              ดาวน์โหลดไฟล์
            </button>
          </div>
        </div>

        {/* Classroom & Filter Selectors (Hidden when printing) */}
        <div className="bg-slate-50 border-b border-slate-200 p-4 sm:p-5 shrink-0 print:hidden space-y-3.5">
          {/* Top Row: Class Selector Tabs & Filters */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            
            {/* Grade Level Selector */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <School className="w-3.5 h-3.5 text-blue-700" />
                เลือกระดับชั้น:
              </span>
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer shadow-2xs"
              >
                {levels.map(lvl => (
                  <option key={lvl} value={lvl}>{lvl}</option>
                ))}
              </select>

              {/* Room Selector */}
              <span className="text-xs font-bold text-slate-700 ml-1">ห้องเรียน:</span>
              <div className="inline-flex rounded-lg border border-slate-300 bg-white p-0.5 shadow-2xs">
                {availableRooms.map(rm => (
                  <button
                    key={rm}
                    type="button"
                    onClick={() => setSelectedRoom(rm)}
                    className={`px-3 py-1 rounded-md text-xs font-bold transition-colors cursor-pointer ${
                      selectedRoom === rm
                        ? 'bg-blue-700 text-white shadow-2xs'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    ห้อง {rm}
                  </button>
                ))}
              </div>
            </div>

            {/* Subject Filter & Search Box */}
            <div className="flex items-center gap-2 flex-wrap">
              {classSubjects.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-slate-600 font-medium">วิชา:</span>
                  <select
                    value={subjectFilter}
                    onChange={(e) => setSubjectFilter(e.target.value)}
                    className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer"
                  >
                    <option value="all">ทุกรายวิชา ({classSubjects.length})</option>
                    {classSubjects.map(sub => (
                      <option key={sub.id} value={sub.id}>{sub.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Search input */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="ค้นหาชื่อ / เลขประจำตัว..."
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-44 sm:w-56"
                />
              </div>
            </div>

          </div>

          {/* Classroom Overview Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-blue-50 text-blue-700">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[11px] text-slate-500 block">นักเรียนในห้อง</span>
                <span className="text-base font-bold text-slate-900">{classStats.totalStudents} คน</span>
              </div>
            </div>

            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-indigo-50 text-indigo-700">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[11px] text-slate-500 block">เข้าทำข้อสอบแล้ว</span>
                <span className="text-base font-bold text-slate-900">
                  {classStats.testedCount} คน <span className="text-xs font-normal text-slate-500">({classStats.testedRate.toFixed(0)}%)</span>
                </span>
              </div>
            </div>

            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-amber-50 text-amber-700">
                <BarChart3 className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[11px] text-slate-500 block">คะแนนเฉลี่ยประจำห้อง</span>
                <span className="text-base font-bold text-amber-700">
                  {classStats.classAveragePct.toFixed(1)}%
                </span>
              </div>
            </div>

            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-700">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[11px] text-slate-500 block">อัตราการสอบผ่าน</span>
                <span className="text-base font-bold text-emerald-700">
                  {classStats.passRate.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Gradebook Matrix Table */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 print:p-0">
          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs print:border-slate-400">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-100 text-slate-700 uppercase tracking-wider font-semibold border-b border-slate-200 print:bg-slate-200">
                  <tr>
                    <th className="py-2.5 px-3 text-center w-12">เลขที่</th>
                    <th className="py-2.5 px-3 w-28">รหัสประจำตัว</th>
                    <th className="py-2.5 px-3 min-w-40">ชื่อ - นามสกุล นักเรียน</th>
                    <th className="py-2.5 px-3 min-w-52">ผลการสอบแต่ละรายวิชา</th>
                    <th className="py-2.5 px-3 text-center w-24">คะแนนรวม</th>
                    <th className="py-2.5 px-3 text-center w-24">เฉลี่ย (%)</th>
                    <th className="py-2.5 px-3 text-center w-28">ผลการประเมิน</th>
                    <th className="py-2.5 px-3 text-center w-28 print:hidden">ใบรายงานเดี่ยว</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {studentGradebook.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400">
                        ไม่พบข้อมูลนักเรียนในชั้น {selectedLevel} ห้อง {selectedRoom}
                      </td>
                    </tr>
                  ) : (
                    studentGradebook.map((row) => (
                      <tr key={row.student.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-2.5 px-3 text-center font-bold text-slate-500">
                          {row.number}
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-700">
                          {row.student.studentCode}
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-slate-900">
                          {row.student.name}
                        </td>
                        <td className="py-2.5 px-3">
                          {row.exams.length === 0 ? (
                            <span className="text-[11px] text-slate-400 italic">
                              ยังไม่ได้เข้าสอบ
                            </span>
                          ) : (
                            <div className="flex flex-wrap gap-1.5">
                              {row.exams.map(ex => (
                                <span
                                  key={ex.id}
                                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold border ${
                                    ex.isPassed
                                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                      : 'bg-rose-50 text-rose-800 border-rose-200'
                                  }`}
                                  title={`${ex.subjectName}: ${ex.examTitle} (${ex.percentage.toFixed(0)}%)`}
                                >
                                  <span>{ex.subjectName.split(' ')[0]}:</span>
                                  <strong className="font-mono">{ex.score}/{ex.maxScore}</strong>
                                </span>
                              ))}
                            </div>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono font-bold text-blue-900">
                          {row.examsCount > 0 ? `${row.totalScore}/${row.totalMax}` : '-'}
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono font-bold">
                          {row.examsCount > 0 ? (
                            <span className={row.avgPercentage >= 50 ? 'text-emerald-700' : 'text-rose-600'}>
                              {row.avgPercentage.toFixed(1)}%
                            </span>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          {row.status === 'passed' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              <CheckCircle2 className="w-3 h-3" /> ผ่านเกณฑ์
                            </span>
                          )}
                          {row.status === 'failed' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                              <AlertCircle className="w-3 h-3" /> ต้องปรับปรุง
                            </span>
                          )}
                          {row.status === 'not_tested' && (
                            <span className="text-[11px] text-slate-400 font-medium">
                              ยังไม่สอบ
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-center print:hidden">
                          <button
                            type="button"
                            onClick={() => onOpenStudentReport(row.student)}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold text-blue-700 hover:text-blue-950 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors cursor-pointer"
                            title="เปิดใบรายงานผลคะแนนทางการของนักเรียนคนนี้"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>ดูผลเดี่ยว</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Bottom Sticky Action Bar (Hidden when printing) */}
        <footer className="bg-slate-50 border-t border-slate-200 px-4 sm:px-6 py-3 flex items-center justify-between shrink-0 print:hidden">
          <div className="text-xs text-slate-600 hidden sm:block">
            <span>สรุปประจำห้อง: </span>
            <strong className="text-slate-900">{selectedLevel} ห้อง {selectedRoom}</strong>
            <span className="text-slate-400 mx-1.5">•</span>
            <span>สอบแล้ว {classStats.testedCount}/{classStats.totalStudents} คน</span>
            <span className="text-slate-400 mx-1.5">•</span>
            <span>เฉลี่ย: <strong className="text-amber-700">{classStats.classAveragePct.toFixed(1)}%</strong></span>
            <span className="text-slate-400 mx-1.5">•</span>
            <span className="font-semibold text-emerald-700">ผ่านเกณฑ์ {classStats.passCount} คน</span>
          </div>

          <div className="flex items-center gap-2 ml-auto flex-wrap">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-blue-950 text-xs font-bold shadow-xs transition-colors cursor-pointer"
              title="พิมพ์เอกสาร A4 ทันที (Direct Print)"
            >
              <Printer className="w-4 h-4" />
              <span>พิมพ์ A4 (1 หน้าพอดี)</span>
            </button>

            <button
              type="button"
              onClick={handleOpenNewTab}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-700 hover:bg-blue-600 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              title="เปิดหน้าต่างพิมพ์ในแท็บใหม่"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>เปิดแท็บพิมพ์ใหม่</span>
            </button>

            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              title="ดาวน์โหลดไฟล์ A4 เพื่อสั่งพิมพ์"
            >
              <Download className="w-3.5 h-3.5" />
              <span>ดาวน์โหลดไฟล์ A4</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              id="btn-close-class-report-bottom"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer active:scale-95"
            >
              <X className="w-4 h-4" />
              <span>ปิดหน้าต่าง</span>
            </button>
          </div>
        </footer>

      </div>

      {/* ========================================================================= */}
      {/* STRICT 1-PAGE A4 BLACK & WHITE CLASSROOM SCORE REPORT (1 ห้อง = 1 A4 เท่านั้น) */}
      {/* ========================================================================= */}
      <div 
        id="classroom-a4-sheet" 
        className="rbss-print-only a4-strict-single-page p-2 bg-white text-black text-left font-sans select-text"
      >
        {/* Official School Header */}
        <div className="text-center border-b-2 border-black pb-1 mb-1 shrink-0 text-black">
          <div className="flex items-center justify-center gap-2.5 mb-1">
            <img 
              src={SCHOOL_LOGO_URL} 
              alt="ตราโรงเรียนราษฎร์บำรุงศิลป์" 
              className="w-10 h-10 object-contain"
              referrerPolicy="no-referrer"
            />
            <div className="text-center">
              <div className="text-[12pt] font-extrabold leading-tight tracking-wide">
                โรงเรียนราษฎร์บำรุงศิลป์
              </div>
              <div className="text-[8pt] text-black font-medium mt-0.5">
                {SCHOOL_AFFILIATION_ADDRESS}
              </div>
            </div>
          </div>
          <div className="text-[9.5pt] font-bold text-black mt-0.5 uppercase underline decoration-1 underline-offset-2">
            แบบรายงานสรุปผลการประเมินและการทดสอบมาตรฐาน (ประจำชั้นเรียน)
          </div>
          <div className="flex justify-between items-center text-[8pt] font-semibold text-black mt-1 px-1">
            <span><strong>ระดับชั้น:</strong> {selectedLevel} <strong>ห้อง:</strong> {selectedRoom}</span>
            <span><strong>ปีการศึกษา:</strong> 2568 (ภาคเรียนที่ 1)</span>
            <span><strong>จำนวนนักเรียนทั้งหมด:</strong> {classStudents.length} คน</span>
            <span><strong>วันที่ออกรายงาน:</strong> {currentDateStr}</span>
          </div>
        </div>

        {/* Official Black and White Table (Fits in A4 Page) */}
        <div className="flex-1 overflow-hidden my-0.5">
          <table className="bw-table text-black w-full text-left">
            <thead>
              <tr className="bg-slate-100 text-black text-[8.5pt]">
                <th style={{ width: '28px' }} className="py-1 text-center font-bold">ที่</th>
                <th style={{ width: '68px' }} className="py-1 text-center font-mono font-bold">รหัสประจำตัว</th>
                <th style={{ width: '165px' }} className="py-1 text-left pl-1.5 font-bold">ชื่อ - นามสกุล นักเรียน</th>
                <th className="py-1 text-left pl-1.5 font-bold">วิชาที่ทดสอบ / คะแนนที่ได้</th>
                <th style={{ width: '58px' }} className="py-1 text-center font-mono font-bold">คะแนนรวม</th>
                <th style={{ width: '48px' }} className="py-1 text-center font-mono font-bold">ร้อยละ</th>
                <th style={{ width: '68px' }} className="py-1 text-center font-bold">ผลประเมิน</th>
                <th style={{ width: '55px' }} className="py-1 text-center font-bold">หมายเหตุ</th>
              </tr>
            </thead>
            <tbody>
              {fullClassGradebook.map((row) => {
                const isDense = classStudents.length > 34;
                const rowPadding = isDense ? 'py-[1px]' : 'py-[2px]';
                const rowFontSize = isDense ? 'text-[7.5pt]' : 'text-[8.5pt]';

                return (
                  <tr key={row.student.id} className={`${rowFontSize} leading-tight`}>
                    <td className={`${rowPadding} text-center font-semibold`}>
                      {row.number}
                    </td>
                    <td className={`${rowPadding} text-center font-mono`}>
                      {row.student.studentCode}
                    </td>
                    <td className={`${rowPadding} text-left pl-1.5 font-semibold truncate`}>
                      {row.student.name}
                    </td>
                    <td className={`${rowPadding} text-left pl-1.5 truncate`}>
                      {row.exams.length === 0 ? (
                        <span className="text-neutral-500 italic">ยังไม่ได้เข้าสอบ</span>
                      ) : (
                        <span>
                          {row.exams
                            .map(e => `${e.subjectName}: ${e.score}/${e.maxScore} (${e.percentage.toFixed(0)}%)`)
                            .join(' • ')}
                        </span>
                      )}
                    </td>
                    <td className={`${rowPadding} text-center font-mono font-semibold`}>
                      {row.examsCount > 0 ? `${row.totalScore}/${row.totalMax}` : '-'}
                    </td>
                    <td className={`${rowPadding} text-center font-mono font-semibold`}>
                      {row.examsCount > 0 ? `${row.avgPercentage.toFixed(1)}%` : '-'}
                    </td>
                    <td className={`${rowPadding} text-center font-bold`}>
                      {row.status === 'passed' && 'ผ่านเกณฑ์'}
                      {row.status === 'failed' && 'ต้องปรับปรุง'}
                      {row.status === 'not_tested' && 'ขาดสอบ'}
                    </td>
                    <td className={`${rowPadding} text-center`}></td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-slate-100 font-bold text-[8pt] text-black">
                <td colSpan={3} className="py-1 text-center">
                  สรุปผลประจำชั้น {selectedLevel} ห้อง {selectedRoom}
                </td>
                <td colSpan={5} className="py-1 pl-2 text-left">
                  นักเรียน {classStats.totalStudents} คน | สอบแล้ว {classStats.testedCount} คน ({classStats.testedRate.toFixed(1)}%) | ขาดสอบ {classStats.totalStudents - classStats.testedCount} คน | เฉลี่ย {classStats.classAveragePct.toFixed(1)}% | ผ่านเกณฑ์ {classStats.passCount} คน ({classStats.passRate.toFixed(1)}%)
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Official 3-Signatories Block */}
        <div className="grid grid-cols-3 gap-6 pt-1 shrink-0 text-center text-[8pt] text-black">
          <div>
            <div className="h-8 border-b border-dotted border-black mx-auto w-4/5 mb-1"></div>
            <p className="font-bold">( ............................................................ )</p>
            <p className="text-[7.5pt] text-black mt-0.5">ครูประจำชั้น {selectedLevel} ห้อง {selectedRoom}</p>
            <p className="text-[7pt] text-black mt-0.5">วันที่ ........ / ........ / ................</p>
          </div>

          <div>
            <div className="h-8 border-b border-dotted border-black mx-auto w-4/5 mb-1"></div>
            <p className="font-bold">( ............................................................ )</p>
            <p className="text-[7.5pt] text-black mt-0.5">หัวหน้าฝ่ายวิชาการ / งานวัดผลประเมินผล</p>
            <p className="text-[7pt] text-black mt-0.5">วันที่ ........ / ........ / ................</p>
          </div>

          <div>
            <div className="h-8 border-b border-dotted border-black mx-auto w-4/5 mb-1"></div>
            <p className="font-bold">( ............................................................ )</p>
            <p className="text-[7.5pt] text-black mt-0.5">ผู้อำนวยการโรงเรียนราษฎร์บำรุงศิลป์</p>
            <p className="text-[7pt] text-black mt-0.5">วันที่ ........ / ........ / ................</p>
          </div>
        </div>
      </div>
    </div>
  );
};
