import React, { useMemo } from 'react';
import { 
  StudentRecord, 
  ExamSubmissionRecord,
  SubjectBlock,
  SCHOOL_LOGO_URL,
  SCHOOL_AFFILIATION_ADDRESS
} from '../types';
import { 
  Printer, 
  X, 
  School, 
  GraduationCap, 
  CheckCircle2, 
  AlertCircle, 
  Calendar, 
  Award,
  BookOpen,
  TrendingUp,
  Download,
  ExternalLink
} from 'lucide-react';
import {
  generateStudentReportHtml,
  printDirectly,
  openInNewTabAndPrint,
  downloadHtmlFile
} from '../utils/printUtils';

interface StudentScoreReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: StudentRecord | null;
  allScores?: ExamSubmissionRecord[];
  allSubjects?: SubjectBlock[];
}

export const StudentScoreReportModal: React.FC<StudentScoreReportModalProps> = ({
  isOpen,
  onClose,
  student,
  allScores = [],
  allSubjects = [],
}) => {
  // Listen for Escape key
  React.useEffect(() => {
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

  // Filter scores for this specific student (Unconditionally called)
  const studentScores = useMemo(() => {
    if (!student) return [];
    return (allScores || []).filter(s => s && s.studentCode === student.studentCode);
  }, [allScores, student?.studentCode]);

  // Performance calculations (Unconditionally called)
  const stats = useMemo(() => {
    if (!student || studentScores.length === 0) {
      return {
        totalTests: 0,
        totalScore: 0,
        totalMaxScore: 0,
        averagePercentage: 0,
        passedCount: 0,
        failedCount: 0,
        evaluationGrade: 'ยังไม่มีข้อมูลการสอบ',
      };
    }

    const totalTests = studentScores.length;
    const totalScore = studentScores.reduce((acc, curr) => acc + curr.score, 0);
    const totalMaxScore = studentScores.reduce((acc, curr) => acc + curr.maxScore, 0);
    const averagePercentage = totalMaxScore > 0 ? (totalScore / totalMaxScore) * 100 : 0;
    const passedCount = studentScores.filter(s => s.isPassed).length;
    const failedCount = totalTests - passedCount;

    let evaluationGrade = 'ต้องปรับปรุง';
    if (averagePercentage >= 80) evaluationGrade = 'ดีเยี่ยม (Excellent)';
    else if (averagePercentage >= 70) evaluationGrade = 'ดีมาก (Very Good)';
    else if (averagePercentage >= 60) evaluationGrade = 'ดี (Good)';
    else if (averagePercentage >= 50) evaluationGrade = 'ผ่านเกณฑ์ (Passed)';

    return {
      totalTests,
      totalScore,
      totalMaxScore,
      averagePercentage,
      passedCount,
      failedCount,
      evaluationGrade,
    };
  }, [student, studentScores]);

  const currentDateFormatted = useMemo(() => {
    return new Date().toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }, []);

  const studentReportHtml = useMemo(() => {
    if (!isOpen || !student) return '';
    return generateStudentReportHtml({
      schoolName: 'โรงเรียนราษฎร์บำรุงศิลป์',
      affiliation: SCHOOL_AFFILIATION_ADDRESS,
      studentName: student.name,
      studentCode: student.studentCode,
      level: student.level,
      room: student.room,
      academicYear: '2568 (ภาคเรียนที่ 1)',
      dateStr: currentDateFormatted,
      totalTests: stats.totalTests,
      totalScore: stats.totalScore,
      totalMaxScore: stats.totalMaxScore,
      averagePercentage: stats.averagePercentage,
      passedCount: stats.passedCount,
      evaluationGrade: stats.evaluationGrade,
      scores: studentScores.map(s => ({
        subjectName: s.subjectName || 'แบบทดสอบมาตรฐาน',
        score: s.score,
        maxScore: s.maxScore,
        percentage: s.percentage,
        isPassed: s.isPassed,
        date: s.submittedAt ? new Date(s.submittedAt).toLocaleDateString('th-TH') : '-'
      }))
    });
  }, [isOpen, student, currentDateFormatted, stats, studentScores]);

  const handlePrint = () => {
    printDirectly(studentReportHtml);
  };

  const handleOpenNewTab = () => {
    openInNewTabAndPrint(studentReportHtml);
  };

  const handleDownload = () => {
    if (!student) return;
    downloadHtmlFile(`รายงานคะแนน_${student.studentCode}_${student.name.replace(/\s+/g, '_')}.html`, studentReportHtml);
  };

  // Early return must occur AFTER all hooks have executed
  if (!isOpen || !student) return null;

  return (
    <div 
      className="fixed inset-0 z-50 overflow-hidden bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 print:p-0 print:bg-white print:static print:overflow-visible"
      id="student-score-report-modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Container - Printable Card with strict viewport max-height and internal scrolling */}
      <div 
        id="student-score-report-modal"
        className="relative bg-white w-full max-w-4xl max-h-[92vh] rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto print:max-h-none print:my-0 print:border-none print:shadow-none print:rounded-none print:max-w-none"
      >
        {/* Top Sticky Control Bar (Hidden when printing) */}
        <div className="bg-slate-900 text-white px-4 sm:px-6 py-3 flex items-center justify-between print:hidden shrink-0 border-b border-slate-800 flex-wrap gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-1.5 rounded-lg bg-amber-400 text-blue-950 font-bold shrink-0">
              <Award className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-xs sm:text-sm font-bold text-white block truncate">
                ใบรายงานผลการสอบมาตรฐานรายบุคคล ({student.name})
              </span>
              <span className="text-[10px] text-slate-400 hidden sm:block">
                โรงเรียนราษฎร์บำรุงศิลป์ • รหัสประจำตัว #{student.studentCode}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <button
              type="button"
              onClick={handlePrint}
              id="btn-print-student-report"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-blue-950 text-xs font-bold shadow-xs transition-colors cursor-pointer"
              title="สั่งพิมพ์ A4 ทันที (Direct Print)"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>พิมพ์ A4</span>
            </button>
            <button
              type="button"
              onClick={handleOpenNewTab}
              id="btn-open-tab-student-report"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-700 hover:bg-blue-600 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              title="เปิดหน้าต่างพิมพ์ในแท็บใหม่"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">เปิดแท็บใหม่</span>
            </button>
            <button
              type="button"
              onClick={handleDownload}
              id="btn-download-student-report"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              title="ดาวน์โหลดไฟล์ A4 เพื่อสั่งพิมพ์"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">ดาวน์โหลดไฟล์</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              id="btn-close-student-report-top"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600/90 hover:bg-rose-600 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
              title="ปิดหน้าต่างใบรายงานผล (Close)"
            >
              <X className="w-4 h-4" />
              <span className="hidden sm:inline">ปิด</span>
            </button>
          </div>
        </div>

        {/* PRINTABLE DOCUMENT BODY (Scrolls internally to avoid overflowing viewport) */}
        <div className="p-4 sm:p-6 md:p-8 flex-1 overflow-y-auto print:overflow-visible print:p-4 text-slate-800">
          
          {/* 1. Official Header */}
          <div className="text-center border-b-2 border-blue-900 pb-5 mb-6">
            <div className="flex items-center justify-center gap-3 mb-2">
              <div className="w-14 h-14 rounded-2xl bg-white border-2 border-amber-400 p-0.5 shadow-xs shrink-0 overflow-hidden flex items-center justify-center print:border print:border-slate-800">
                <img 
                  src={SCHOOL_LOGO_URL} 
                  alt="ตราสัญลักษณ์โรงเรียนราษฎร์บำรุงศิลป์" 
                  className="w-full h-full object-contain rounded-xl"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="text-left">
                <h1 className="text-xl sm:text-2xl font-extrabold text-blue-950 tracking-tight leading-tight">
                  โรงเรียนราษฎร์บำรุงศิลป์
                </h1>
                <p className="text-xs text-slate-600 font-medium">
                  {SCHOOL_AFFILIATION_ADDRESS}
                </p>
                <p className="text-[11px] text-slate-500">
                  ระบบบริหารจัดการคลังข้อสอบและประเมินผลการเรียนรู้มาตรฐานออนไลน์
                </p>
              </div>
            </div>

            <div className="inline-block mt-1 px-4 py-1 rounded-full bg-blue-50 border border-blue-200 print:border-slate-400">
              <h2 className="text-sm sm:text-base font-bold text-blue-900">
                ใบรายงานผลการสอบและประเมินผลการเรียนรู้รายบุคคล
              </h2>
            </div>
          </div>

          {/* 2. Student Profile Grid */}
          <div className="bg-slate-50 rounded-xl p-4 sm:p-5 border border-slate-200 mb-6 print:bg-white print:border-slate-400">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 text-xs">
              <div>
                <span className="text-slate-500 block text-[11px]">ชื่อ - นามสกุล นักเรียน:</span>
                <span className="text-sm font-bold text-slate-900">{student.name}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">เลขประจำตัวนักเรียน:</span>
                <span className="text-sm font-mono font-bold text-blue-800">#{student.studentCode}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">ระดับชั้น / ห้อง:</span>
                <span className="text-sm font-bold text-slate-800">{student.level} (ห้อง {student.room})</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">ปีการศึกษา:</span>
                <span className="font-semibold text-slate-800">2567</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">วันที่ออกรายงาน:</span>
                <span className="font-semibold text-slate-800">{currentDateFormatted}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">สถานะการประเมินรวม:</span>
                <span className={`font-bold ${stats.averagePercentage >= 50 ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {stats.evaluationGrade}
                </span>
              </div>
            </div>
          </div>

          {/* 3. Performance Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 print:grid-cols-4">
            <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200 text-center">
              <span className="text-[11px] text-blue-700 font-semibold block">แบบทดสอบที่ทำ</span>
              <span className="text-xl font-bold text-blue-950">{stats.totalTests} ชุด</span>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 text-center">
              <span className="text-[11px] text-amber-800 font-semibold block">คะแนนรวมที่ได้</span>
              <span className="text-xl font-bold text-amber-950">
                {stats.totalScore} <span className="text-xs text-amber-700 font-normal">/ {stats.totalMaxScore}</span>
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-violet-50/70 border border-violet-200 text-center">
              <span className="text-[11px] text-violet-800 font-semibold block">คิดเป็นร้อยละ</span>
              <span className="text-xl font-bold text-violet-950">
                {stats.averagePercentage.toFixed(1)}%
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 text-center">
              <span className="text-[11px] text-emerald-800 font-semibold block">ผ่านเกณฑ์</span>
              <span className="text-xl font-bold text-emerald-950">
                {stats.passedCount} <span className="text-xs text-emerald-700 font-normal">/ {stats.totalTests}</span>
              </span>
            </div>
          </div>

          {/* 4. Table of Scores */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-blue-600" />
              <span>ตารางบันทึกผลการสอบและคะแนนรายวิชา</span>
            </h3>

            {studentScores.length === 0 ? (
              <div className="p-8 text-center rounded-xl border border-dashed border-slate-300 bg-slate-50 text-xs text-slate-500">
                นักเรียนยังไม่ได้ทำแบบทดสอบในระบบ กรุณาเลือกทำแบบทดสอบออนไลน์ในหน้ารายวิชา
              </div>
            ) : (
              <div className="overflow-x-auto border border-slate-200 rounded-xl print:border-slate-400">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 print:bg-slate-200">
                      <th className="py-2.5 px-3 font-bold text-center w-10">ลำดับ</th>
                      <th className="py-2.5 px-3 font-bold">รหัสวิชา / ชื่อวิชา</th>
                      <th className="py-2.5 px-3 font-bold">ชุดแบบทดสอบ</th>
                      <th className="py-2.5 px-3 font-bold text-center">คะแนนเต็ม</th>
                      <th className="py-2.5 px-3 font-bold text-center">คะแนนที่ได้</th>
                      <th className="py-2.5 px-3 font-bold text-center">ร้อยละ</th>
                      <th className="py-2.5 px-3 font-bold text-center">ผลการประเมิน</th>
                      <th className="py-2.5 px-3 font-bold text-center">วันที่ทำสอบ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 print:divide-slate-300">
                    {studentScores.map((sc, idx) => (
                      <tr key={sc.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-2.5 px-3 text-center text-slate-500 font-mono">
                          {idx + 1}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="font-mono text-[11px] font-bold text-blue-700 mr-1">
                            [{sc.subjectCode}]
                          </span>
                          <span className="font-medium text-slate-900">{sc.subjectName}</span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-700 font-medium">
                          {sc.examTitle}
                        </td>
                        <td className="py-2.5 px-3 text-center text-slate-600 font-mono">
                          {sc.maxScore}
                        </td>
                        <td className="py-2.5 px-3 text-center font-bold font-mono text-blue-900">
                          {sc.score}
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
                            {sc.isPassed ? (
                              <>
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                ผ่าน
                              </>
                            ) : (
                              <>
                                <AlertCircle className="w-3 h-3 text-rose-600" />
                                ไม่ผ่าน
                              </>
                            )}
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
                      </tr>
                    ))}
                  </tbody>
                  {/* Total Row */}
                  <tfoot>
                    <tr className="bg-slate-50 border-t-2 border-slate-300 font-bold text-slate-900 print:bg-slate-100">
                      <td colSpan={3} className="py-2.5 px-3 text-right">
                        สรุปผลรวมเฉลี่ยทั้งสิ้น:
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono">{stats.totalMaxScore}</td>
                      <td className="py-2.5 px-3 text-center font-mono text-blue-900">{stats.totalScore}</td>
                      <td className="py-2.5 px-3 text-center font-mono">{stats.averagePercentage.toFixed(1)}%</td>
                      <td colSpan={2} className="py-2.5 px-3 text-center">
                        ผ่าน {stats.passedCount} / {stats.totalTests} ชุด
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>

          {/* 5. Official Signatures Block */}
          <div className="mt-10 pt-6 border-t border-slate-300 grid grid-cols-3 gap-6 text-center text-xs text-slate-700 print:mt-12">
            <div>
              <div className="h-12 border-b border-dashed border-slate-400 mx-auto w-4/5 mb-1.5"></div>
              <p className="font-semibold">( ............................................................ )</p>
              <p className="text-[11px] text-slate-500 mt-0.5">ครูประจำชั้น / ครูผู้ประเมิน</p>
            </div>

            <div>
              <div className="h-12 border-b border-dashed border-slate-400 mx-auto w-4/5 mb-1.5"></div>
              <p className="font-semibold">( ............................................................ )</p>
              <p className="text-[11px] text-slate-500 mt-0.5">หัวหน้าฝ่ายวิชาการ / นายทะเบียน</p>
            </div>

            <div>
              <div className="h-12 border-b border-dashed border-slate-400 mx-auto w-4/5 mb-1.5"></div>
              <p className="font-semibold">( ............................................................ )</p>
              <p className="text-[11px] text-slate-500 mt-0.5">ผู้ปกครอง (ลงนามรับทราบ)</p>
            </div>
          </div>

          <div className="mt-8 text-center text-[10px] text-slate-400 print:mt-6">
            เอกสารนี้ออกโดยระบบคลังข้อสอบออนไลน์ โรงเรียนราษฎร์บำรุงศิลป์ (RBSS Online Examination & Evaluation Repository)
          </div>

        </div>

        {/* Bottom Sticky Action Bar (Hidden when printing, ensures user ALWAYS has a close button at bottom) */}
        <footer className="bg-slate-50 border-t border-slate-200 px-4 sm:px-6 py-3 flex items-center justify-between shrink-0 print:hidden">
          <div className="text-xs text-slate-600 hidden sm:block">
            <span>สรุปผลการสอบ: </span>
            <strong className="text-blue-900">{stats.totalScore}/{stats.totalMaxScore} คะแนน</strong>
            <span className="text-slate-400 mx-1.5">•</span>
            <span>เฉลี่ย: <strong className="text-amber-700">{stats.averagePercentage.toFixed(1)}%</strong></span>
            <span className="text-slate-400 mx-1.5">•</span>
            <span className="font-semibold text-emerald-700">ผ่านเกณฑ์ {stats.passedCount} / {stats.totalTests} ชุด</span>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-blue-950 text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>พิมพ์ใบรายงาน</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              id="btn-close-student-report-bottom"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer active:scale-95"
            >
              <X className="w-4 h-4" />
              <span>ปิดหน้าต่าง (Close)</span>
            </button>
          </div>
        </footer>

      </div>
    </div>
  );
};
