import React, { useState, useMemo } from 'react';
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
  findStudentByCode 
} from '../services/studentService';
import { deleteExamScore } from '../services/scoreService';
import { 
  Printer, 
  X, 
  School, 
  Search, 
  Filter, 
  Award, 
  Trash2, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle,
  Users,
  BarChart3,
  TrendingUp,
  FileSpreadsheet,
  GraduationCap
} from 'lucide-react';

interface AdminScoreManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  allScores?: ExamSubmissionRecord[];
  allSubjects?: SubjectBlock[];
  onOpenStudentReport: (student: StudentRecord) => void;
  onOpenClassroomReport?: () => void;
}

export const AdminScoreManagementModal: React.FC<AdminScoreManagementModalProps> = ({
  isOpen,
  onClose,
  allScores = [],
  allSubjects = [],
  onOpenStudentReport,
  onOpenClassroomReport,
}) => {
  const [levelFilter, setLevelFilter] = useState('all');
  const [roomFilter, setRoomFilter] = useState('all');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [passFilter, setPassFilter] = useState<'all' | 'passed' | 'failed'>('all');

  const levels = useMemo(() => getAllLevels(), []);
  const availableRooms = useMemo(() => {
    if (levelFilter === 'all') return ['1', '2', '3'];
    return getRoomsForLevel(levelFilter);
  }, [levelFilter]);

  // Filtered scores
  const filteredScores = useMemo(() => {
    return (allScores || []).filter(s => {
      if (levelFilter !== 'all' && s.level !== levelFilter) return false;
      if (roomFilter !== 'all' && s.room !== roomFilter) return false;
      if (subjectFilter !== 'all' && s.subjectId !== subjectFilter && s.subjectCode !== subjectFilter) return false;
      if (passFilter === 'passed' && !s.isPassed) return false;
      if (passFilter === 'failed' && s.isPassed) return false;

      if (searchKeyword.trim()) {
        const kw = searchKeyword.toLowerCase().trim();
        return (
          s.studentCode.includes(kw) ||
          s.studentName.toLowerCase().includes(kw) ||
          s.subjectName.toLowerCase().includes(kw) ||
          s.examTitle.toLowerCase().includes(kw)
        );
      }
      return true;
    });
  }, [allScores, levelFilter, roomFilter, subjectFilter, passFilter, searchKeyword]);

  // Analytical stats
  const stats = useMemo(() => {
    const totalCount = filteredScores.length;
    if (totalCount === 0) {
      return {
        totalSubmissions: 0,
        uniqueStudents: 0,
        averagePercentage: 0,
        passRate: 0,
      };
    }

    const uniqueStudentCodes = new Set(filteredScores.map(s => s.studentCode));
    const totalPct = filteredScores.reduce((acc, curr) => acc + curr.percentage, 0);
    const passedCount = filteredScores.filter(s => s.isPassed).length;

    return {
      totalSubmissions: totalCount,
      uniqueStudents: uniqueStudentCodes.size,
      averagePercentage: totalPct / totalCount,
      passRate: (passedCount / totalCount) * 100,
    };
  }, [filteredScores]);

  if (!isOpen) return null;

  const handleDeleteScore = async (id: string, studentName: string, examTitle: string) => {
    if (window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบผลการสอบ "${examTitle}" ของ ${studentName}?`)) {
      await deleteExamScore(id);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 print:p-0 print:bg-white print:static print:overflow-visible"
      id="admin-score-modal-backdrop"
    >
      <div 
        id="admin-score-modal"
        className="relative bg-white w-full max-w-6xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-4 max-h-[92vh] print:max-h-none print:my-0 print:border-none print:shadow-none print:rounded-none"
      >
        {/* Header (Hidden when printing) */}
        <header className="bg-linear-to-r from-blue-900 via-indigo-900 to-blue-950 text-white px-6 py-4 flex items-center justify-between shrink-0 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-blue-950 flex items-center justify-center font-bold shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-800 text-amber-300 border border-blue-700">
                  ระบบผู้ดูแลระบบ (Admin)
                </span>
                <span className="text-xs text-blue-200">โรงเรียนราษฎร์บำรุงศิลป์</span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white mt-0.5">
                ศูนย์จัดการและรายงานคะแนนสอบนักเรียนทั้งหมด
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenClassroomReport && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenClassroomReport();
                }}
                id="btn-switch-to-classroom-report"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-700 hover:bg-blue-600 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                <GraduationCap className="w-4 h-4 text-amber-300" />
                <span>รายงานรายชั้นเรียน</span>
              </button>
            )}

            <button
              type="button"
              onClick={handlePrint}
              id="btn-print-admin-scores"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-blue-950 text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>พิมพ์รายงานสรุปคะแนน (Print)</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Printable Official Header (Only shown when printing) */}
        <div className="hidden print:block p-6 text-center border-b-2 border-blue-950 mb-4">
          <div className="flex items-center justify-center gap-3 mb-2">
            <img 
              src={SCHOOL_LOGO_URL} 
              alt="ตราโรงเรียนราษฎร์บำรุงศิลป์" 
              className="w-12 h-12 object-contain"
              referrerPolicy="no-referrer"
            />
            <div className="text-left">
              <h1 className="text-2xl font-extrabold text-blue-950">โรงเรียนราษฎร์บำรุงศิลป์</h1>
              <p className="text-xs text-slate-600">{SCHOOL_AFFILIATION_ADDRESS}</p>
            </div>
          </div>
          <h2 className="text-lg font-bold text-blue-900 mt-2">
            รายงานสรุปผลการสอบและคะแนนประเมินผลการเรียนรู้
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            ระดับชั้น: {levelFilter === 'all' ? 'ทุกระดับชั้น' : levelFilter} {roomFilter !== 'all' ? `ห้อง ${roomFilter}` : ''} | 
            จำนวนรายการ: {filteredScores.length} รายการ
          </p>
        </div>

        {/* Filters and Analytics Controls (Hidden when printing) */}
        <div className="p-4 sm:p-6 bg-slate-50 border-b border-slate-200 print:hidden shrink-0 space-y-4">
          {/* Analytics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-xs text-slate-500 font-medium block">ส่งแบบทดสอบทั้งหมด</span>
              <span className="text-xl font-bold text-blue-900">{stats.totalSubmissions} ครั้ง</span>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-xs text-slate-500 font-medium block">นักเรียนที่เข้าสอบ</span>
              <span className="text-xl font-bold text-indigo-900">{stats.uniqueStudents} คน</span>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-xs text-slate-500 font-medium block">คะแนนเฉลี่ยรวม</span>
              <span className="text-xl font-bold text-amber-900">{stats.averagePercentage.toFixed(1)}%</span>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-xs text-slate-500 font-medium block">อัตราการสอบผ่าน</span>
              <span className="text-xl font-bold text-emerald-900">{stats.passRate.toFixed(1)}%</span>
            </div>
          </div>

          {/* Filter Row */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="ค้นหาชื่อนักเรียน, รหัสประจำตัว, หรือชื่อวิชา..."
                className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
              />
            </div>

            {/* Level */}
            <select
              value={levelFilter}
              onChange={(e) => {
                setLevelFilter(e.target.value);
                setRoomFilter('all');
              }}
              className="bg-white border border-slate-300 text-slate-700 text-xs rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">ทุกระดับชั้น</option>
              {levels.map(lvl => (
                <option key={lvl} value={lvl}>{lvl}</option>
              ))}
            </select>

            {/* Room */}
            <select
              value={roomFilter}
              onChange={(e) => setRoomFilter(e.target.value)}
              className="bg-white border border-slate-300 text-slate-700 text-xs rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">ทุกห้อง</option>
              {availableRooms.map(rm => (
                <option key={rm} value={rm}>ห้อง {rm}</option>
              ))}
            </select>

            {/* Subject */}
            <select
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              className="bg-white border border-slate-300 text-slate-700 text-xs rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 max-w-[180px]"
            >
              <option value="all">ทุกรายวิชา</option>
              {allSubjects.map(sub => (
                <option key={sub.id} value={sub.id}>
                  {sub.code} - {sub.name}
                </option>
              ))}
            </select>

            {/* Status */}
            <select
              value={passFilter}
              onChange={(e) => setPassFilter(e.target.value as any)}
              className="bg-white border border-slate-300 text-slate-700 text-xs rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">ทุกผลประเมิน</option>
              <option value="passed">ผ่านเกณฑ์</option>
              <option value="failed">ไม่ผ่านเกณฑ์</option>
            </select>

            {(searchKeyword || levelFilter !== 'all' || roomFilter !== 'all' || subjectFilter !== 'all' || passFilter !== 'all') && (
              <button
                type="button"
                onClick={() => {
                  setSearchKeyword('');
                  setLevelFilter('all');
                  setRoomFilter('all');
                  setSubjectFilter('all');
                  setPassFilter('all');
                }}
                className="text-xs text-slate-500 hover:text-slate-800 underline px-2 py-1"
              >
                ล้างตัวกรอง
              </button>
            )}
          </div>
        </div>

        {/* Scores Table Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 print:p-0 print:overflow-visible">
          {filteredScores.length === 0 ? (
            <div className="p-12 text-center border border-dashed border-slate-300 rounded-2xl bg-slate-50 my-4 text-slate-500 text-xs sm:text-sm">
              <FileSpreadsheet className="w-10 h-10 mx-auto text-slate-400 mb-2" />
              <p className="font-semibold text-slate-700">ไม่พบรายการคะแนนสอบที่ตรงกับเงื่อนไข</p>
              <p className="text-slate-400 mt-1">
                เมื่อนักเรียนเข้าทำแบบทดสอบออนไลน์ HTML คะแนนจะถูกส่งเข้ามาแสดงในหน้านี้ทันทีแบบ Real-time
              </p>
            </div>
          ) : (
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 print:bg-slate-200 font-bold">
                    <th className="py-3 px-3 text-center w-12">ลำดับ</th>
                    <th className="py-3 px-3">รหัสนักเรียน</th>
                    <th className="py-3 px-3">ชื่อ - นามสกุล นักเรียน</th>
                    <th className="py-3 px-3">ระดับชั้น / ห้อง</th>
                    <th className="py-3 px-3">รายวิชา</th>
                    <th className="py-3 px-3">ชุดข้อสอบ</th>
                    <th className="py-3 px-3 text-center">คะแนนที่ได้</th>
                    <th className="py-3 px-3 text-center">ร้อยละ</th>
                    <th className="py-3 px-3 text-center">สถานะ</th>
                    <th className="py-3 px-3 text-center">วัน-เวลาสอบ</th>
                    <th className="py-3 px-3 text-center print:hidden">การจัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredScores.map((sc, idx) => {
                    const studentObj = findStudentByCode(sc.studentCode);
                    return (
                      <tr key={sc.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-2.5 px-3 text-center text-slate-400 font-mono">
                          {idx + 1}
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold text-blue-700">
                          #{sc.studentCode}
                        </td>
                        <td className="py-2.5 px-3 font-medium text-slate-900">
                          {sc.studentName}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600">
                          {sc.level} (ห้อง {sc.room})
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="font-mono text-slate-500 mr-1">[{sc.subjectCode}]</span>
                          <span className="text-slate-800">{sc.subjectName}</span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-700">
                          {sc.examTitle}
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono font-bold text-blue-950">
                          {sc.score} / {sc.maxScore}
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono font-semibold">
                          {sc.percentage.toFixed(1)}%
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            sc.isPassed 
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                              : 'bg-rose-100 text-rose-800 border border-rose-300'
                          }`}>
                            {sc.isPassed ? 'ผ่าน' : 'ไม่ผ่าน'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center text-slate-500 text-[11px]">
                          {new Date(sc.submittedAt).toLocaleDateString('th-TH', {
                            day: '2-digit',
                            month: '2-digit',
                            year: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>
                        <td className="py-2.5 px-3 text-center print:hidden">
                          <div className="flex items-center justify-center gap-1">
                            {studentObj && (
                              <button
                                type="button"
                                onClick={() => onOpenStudentReport(studentObj)}
                                title="เปิดใบรายงานผลมาตรฐานของนักเรียนคนนี้"
                                className="px-2 py-1 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 text-[11px] font-semibold inline-flex items-center gap-1 transition-colors cursor-pointer"
                              >
                                <Printer className="w-3 h-3" />
                                <span>ใบรายงาน</span>
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => handleDeleteScore(sc.id, sc.studentName, sc.examTitle)}
                              title="ลบผลการสอบนี้"
                              className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
