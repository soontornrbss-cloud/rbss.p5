/**
 * ระบบคลังเก็บข้อสอบออนไลน์ & ระบบรายงานคะแนนมาตรฐาน
 * โรงเรียนราษฎร์บำรุงศิลป์
 * 
 * 1. Admin: นำเข้า แก้ไข ลบ ข้อสอบ และจัดการผลคะแนนนักเรียน
 * 2. นักเรียน: เลือกทำแบบทดสอบ บันทึกคะแนน และออกใบรายงานผลมาตรฐานรายบุคคล
 * 3. ฐานข้อมูลนักเรียน 1,221 รายชื่อ และระบบ Cloud Real-Time Firebase
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  GradeId, 
  SubjectBlock, 
  ExamPaper, 
  GradeConfig, 
  AuthSession, 
  StudentRecord, 
  ExamSubmissionRecord 
} from './types';
import { GRADE_CONFIGS, INITIAL_SUBJECTS } from './data/initialData';
import { Header } from './components/Header';
import { GradeNavigation } from './components/GradeNavigation';
import { StatsBar } from './components/StatsBar';
import { SubjectCard } from './components/SubjectCard';
import { AddSubjectModal } from './components/AddSubjectModal';
import { AddExamModal } from './components/AddExamModal';
import { ExamDetailModal } from './components/ExamDetailModal';
import { ReportSummaryModal } from './components/ReportSummaryModal';
import { AdminHtmlExamModal } from './components/AdminHtmlExamModal';
import { HtmlExamPlayerModal } from './components/HtmlExamPlayerModal';
import { LoginModal } from './components/LoginModal';
import { StudentScoreReportModal } from './components/StudentScoreReportModal';
import { AdminScoreManagementModal } from './components/AdminScoreManagementModal';
import { ClassroomScoreReportModal } from './components/ClassroomScoreReportModal';
import { Footer } from './components/Footer';

import { 
  subscribeToSubjects, 
  saveSubjectToCloud, 
  deleteSubjectFromCloud, 
  saveExamToSubjectInCloud, 
  deleteExamFromSubjectInCloud, 
  syncAllSubjectsToCloud,
  CloudSyncStatus
} from './services/examSyncService';

import { 
  subscribeToScores, 
  submitExamScore, 
  getLocalScores 
} from './services/scoreService';

import { 
  PlusCircle, 
  FileText, 
  CheckCircle2, 
  Search, 
  BookOpen, 
  FileSpreadsheet, 
  School,
  GraduationCap,
  Code2,
  Sparkles,
  Cloud,
  Award,
  User,
  ShieldCheck,
  Info
} from 'lucide-react';

const STORAGE_KEY = 'rbss_exam_repository_data_v1';
const AUTH_STORAGE_KEY = 'rbss_auth_session';

export default function App() {
  // 1. Authentication State
  const [currentSession, setCurrentSession] = useState<AuthSession | null>(() => {
    try {
      const savedAuth = localStorage.getItem(AUTH_STORAGE_KEY);
      if (savedAuth) {
        return JSON.parse(savedAuth);
      }
    } catch (e) {
      console.warn('Failed to parse saved auth session:', e);
    }
    return null;
  });

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(true);

  // When session changes, sync to localStorage
  const handleLoginSuccess = (session: AuthSession) => {
    setCurrentSession(session);
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
    } catch (e) {
      console.warn('Failed to save auth to localStorage:', e);
    }

    // If student logged in, automatically navigate to their grade!
    if (session.role === 'student' && session.student?.gradeId) {
      setActiveGradeId(session.student.gradeId);
    }

    showToast(`ยินดีต้อนรับ ${session.role === 'admin' ? session.adminName || 'ผู้ดูแลระบบ' : session.student?.name}`);
  };

  const handleLogout = () => {
    setCurrentSession(null);
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch (e) {
      console.warn('Failed to remove auth session:', e);
    }
    showToast('ออกจากระบบเรียบร้อยแล้ว');
    setIsLoginModalOpen(true);
  };

  // 2. Core Exam Data & Cloud State
  const [activeGradeId, setActiveGradeId] = useState<GradeId>('p5'); // Default to P.5 (rbss-p5)
  const [subjects, setSubjects] = useState<SubjectBlock[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to load from localStorage:', e);
    }
    return INITIAL_SUBJECTS;
  });

  // 3. Real-time Student Exam Scores State
  const [allScores, setAllScores] = useState<ExamSubmissionRecord[]>(() => getLocalScores());

  useEffect(() => {
    const unsubScores = subscribeToScores((updatedScores) => {
      setAllScores(updatedScores);
    });
    return () => {
      unsubScores();
    };
  }, []);

  // Cloud Sync Status State
  const [cloudStatus, setCloudStatus] = useState<CloudSyncStatus>('connecting');
  const [cloudMessage, setCloudMessage] = useState<string>('กำลังเชื่อมต่อฐานข้อมูล Cloud (Firebase)...');

  // Real-time Firestore Cloud Synchronization for Subjects & Exams
  useEffect(() => {
    const unsubscribe = subscribeToSubjects(
      (updatedSubjects) => {
        setSubjects(updatedSubjects);
      },
      (status, message) => {
        setCloudStatus(status);
        if (message) {
          setCloudMessage(message);
        }
      }
    );

    return () => {
      unsubscribe();
    };
  }, []);

  // Save subjects to localStorage as a fallback local cache
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(subjects));
    } catch (e) {
      console.warn('Failed to save to localStorage:', e);
    }
  }, [subjects]);

  // 4. Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedYear, setSelectedYear] = useState('all');
  const [selectedTerm, setSelectedTerm] = useState('all');
  const [selectedAreaFilter, setSelectedAreaFilter] = useState('all');

  // 5. Modals State
  const [isAddSubjectOpen, setIsAddSubjectOpen] = useState(false);
  const [isAddExamOpen, setIsAddExamOpen] = useState(false);
  const [targetSubjectForExam, setTargetSubjectForExam] = useState<SubjectBlock | null>(null);
  const [isExamDetailOpen, setIsExamDetailOpen] = useState(false);
  const [selectedExam, setSelectedExam] = useState<ExamPaper | null>(null);
  const [selectedSubjectForDetail, setSelectedSubjectForDetail] = useState<SubjectBlock | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // Admin HTML Exam Modal & Interactive Player States
  const [isAdminHtmlModalOpen, setIsAdminHtmlModalOpen] = useState(false);
  const [targetSubjectForHtml, setTargetSubjectForHtml] = useState<SubjectBlock | null>(null);
  const [editingHtmlExam, setEditingHtmlExam] = useState<ExamPaper | null>(null);

  const [isHtmlPlayerOpen, setIsHtmlPlayerOpen] = useState(false);
  const [playingHtmlExam, setPlayingHtmlExam] = useState<ExamPaper | null>(null);
  const [playingHtmlSubject, setPlayingHtmlSubject] = useState<SubjectBlock | null>(null);

  // Standard Score Report Modals State
  const [isStudentReportOpen, setIsStudentReportOpen] = useState(false);
  const [selectedReportStudent, setSelectedReportStudent] = useState<StudentRecord | null>(null);
  const [isAdminScoresModalOpen, setIsAdminScoresModalOpen] = useState(false);
  const [isClassroomReportOpen, setIsClassroomReportOpen] = useState(false);

  // Notification Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Active Grade Config object
  const activeGrade: GradeConfig = useMemo(() => {
    return GRADE_CONFIGS.find((g) => g.id === activeGradeId) || GRADE_CONFIGS[0];
  }, [activeGradeId]);

  // Total school counts
  const totalSubjectsCount = (subjects || []).length;
  const totalExamsCount = useMemo(() => {
    return (subjects || []).reduce((acc, curr) => acc + (curr?.exams?.length || 0), 0);
  }, [subjects]);

  // Subjects in the current active grade
  const currentGradeSubjects = useMemo(() => {
    return (subjects || []).filter((s) => s && s.gradeId === activeGradeId);
  }, [subjects, activeGradeId]);

  const currentGradeExamsCount = useMemo(() => {
    return currentGradeSubjects.reduce((acc, curr) => acc + (curr?.exams?.length || 0), 0);
  }, [currentGradeSubjects]);

  // Filtered subjects based on search query, academic filters, and learning area
  const filteredGradeSubjects = useMemo(() => {
    return currentGradeSubjects.filter((subject) => {
      // Learning Area filter
      if (selectedAreaFilter !== 'all' && subject.learningArea !== selectedAreaFilter) {
        return false;
      }

      // Academic Year filter
      if (selectedYear !== 'all' && subject.academicYear !== selectedYear) {
        return false;
      }

      // Academic Term filter
      if (selectedTerm !== 'all' && subject.term !== selectedTerm && subject.term !== 'ทั้งปี') {
        return false;
      }

      // Search query (matches subject name, code, teacher, description, or exam titles)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesName = subject.name.toLowerCase().includes(query);
        const matchesCode = subject.code.toLowerCase().includes(query);
        const matchesTeacher = subject.teacher.toLowerCase().includes(query);
        const matchesDescription = subject.description?.toLowerCase().includes(query);
        const matchesExams = subject.exams.some(
          (ex) =>
            ex.title.toLowerCase().includes(query) ||
            ex.examType.toLowerCase().includes(query) ||
            ex.fileName?.toLowerCase().includes(query)
        );

        return matchesName || matchesCode || matchesTeacher || matchesDescription || matchesExams;
      }

      return true;
    });
  }, [currentGradeSubjects, selectedAreaFilter, selectedYear, selectedTerm, searchQuery]);

  // Check Admin Permission helper
  const requireAdmin = (): boolean => {
    if (currentSession?.role !== 'admin') {
      alert('คุณไม่มีสิทธิ์ในการนำเข้า แก้ไข หรือลบข้อสอบ (เฉพาะผู้ดูแลระบบ/Admin เท่านั้น)');
      setIsLoginModalOpen(true);
      return false;
    }
    return true;
  };

  // 6. Action Handlers with Strict RBAC & Cloud Persistence
  // Add new subject dynamically (Admin only)
  const handleAddSubject = async (newSubject: SubjectBlock) => {
    if (!requireAdmin()) return;

    // Optimistic UI update
    setSubjects((prev) => [newSubject, ...prev]);
    if (newSubject.gradeId !== activeGradeId) {
      setActiveGradeId(newSubject.gradeId);
    }
    showToast(`เพิ่มรายวิชา "${newSubject.name}" (${newSubject.code}) สำเร็จ (กำลังซิงค์ขึ้น Cloud)`);

    try {
      await saveSubjectToCloud(newSubject);
      showToast(`บันทึกรายวิชา "${newSubject.name}" ขึ้น Cloud สำเร็จ ทุกเครื่องซิงค์ตรงกัน`);
    } catch (err: any) {
      console.error('Failed to sync new subject to cloud:', err);
      showToast('บันทึกในเครื่องแล้ว แต่เกิดข้อผิดพลาดในการส่งขึ้น Cloud');
    }
  };

  // Delete subject (Admin only)
  const handleDeleteSubject = async (subjectId: string, subjectName: string) => {
    if (!requireAdmin()) return;

    const confirmDelete = window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบรายวิชา "${subjectName}" และข้อสอบทั้งหมดในวิชานี้? (ข้อมูลจะถูกลบออกจาก Cloud ด้วย)`);
    if (confirmDelete) {
      setSubjects((prev) => prev.filter((s) => s.id !== subjectId));
      showToast(`ลบรายวิชา "${subjectName}" ออกจากระบบแล้ว`);

      try {
        await deleteSubjectFromCloud(subjectId);
      } catch (err: any) {
        console.error('Failed to delete subject from cloud:', err);
      }
    }
  };

  // Add exam paper into a specific subject (Admin only)
  const handleAddExam = async (subjectId: string, newExam: ExamPaper) => {
    if (!requireAdmin()) return;

    setSubjects((prev) =>
      prev.map((sub) => {
        if (sub.id === subjectId) {
          return {
            ...sub,
            exams: [newExam, ...sub.exams],
          };
        }
        return sub;
      })
    );
    showToast(`กำลังซิงค์ข้อสอบ "${newExam.title}" ขึ้น Cloud...`);

    try {
      await saveExamToSubjectInCloud(subjectId, newExam, subjects);
      showToast(`ซิงค์ข้อสอบ "${newExam.title}" ขึ้น Cloud สำเร็จ ทุกเครื่องเห็นพร้อมกัน`);
    } catch (err: any) {
      console.error('Failed to sync exam to cloud:', err);
      showToast('บันทึกในเครื่องแล้ว แต่ไม่สามารถซิงค์ Cloud ได้');
    }
  };

  // Delete exam paper from a subject (Admin only)
  const handleDeleteExam = async (subjectId: string, examId: string, examTitle: string) => {
    if (!requireAdmin()) return;

    const confirmDelete = window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบข้อสอบ "${examTitle}"? (จะลบออกจาก Cloud ด้วย)`);
    if (confirmDelete) {
      setSubjects((prev) =>
        prev.map((sub) => {
          if (sub.id === subjectId) {
            return {
              ...sub,
              exams: sub.exams.filter((ex) => ex.id !== examId),
            };
          }
          return sub;
        })
      );
      showToast(`ลบข้อสอบ "${examTitle}" เรียบร้อยแล้ว`);

      try {
        await deleteExamFromSubjectInCloud(subjectId, examId, subjects);
      } catch (err: any) {
        console.error('Failed to delete exam from cloud:', err);
      }
    }
  };

  // Save or update an HTML exam (Admin only)
  const handleSaveHtmlExam = async (subjectId: string, examData: ExamPaper) => {
    if (!requireAdmin()) return;

    let isEdit = false;
    setSubjects((prev) =>
      prev.map((sub) => {
        if (sub.id === subjectId) {
          const existingIndex = sub.exams.findIndex((e) => e.id === examData.id);
          let updatedExams: ExamPaper[];
          if (existingIndex >= 0) {
            isEdit = true;
            updatedExams = [...sub.exams];
            updatedExams[existingIndex] = examData;
          } else {
            updatedExams = [examData, ...sub.exams];
          }
          return {
            ...sub,
            exams: updatedExams,
          };
        }
        return sub;
      })
    );

    showToast(isEdit ? `อัปเดตโค้ดข้อสอบ "${examData.title}" ขึ้น Cloud...` : `บันทึกข้อสอบ HTML "${examData.title}" ขึ้น Cloud...`);

    try {
      await saveExamToSubjectInCloud(subjectId, examData, subjects);
      showToast(`ซิงค์ข้อสอบ "${examData.title}" สำเร็จ ทุกเครื่องเห็นพร้อมกันทันที`);
    } catch (err: any) {
      console.error('Failed to sync HTML exam to cloud:', err);
    }
  };

  // Reset to initial sample data (Admin only)
  const handleResetData = async () => {
    if (!requireAdmin()) return;

    const confirmReset = window.confirm(
      'คุณต้องการรีเซ็ตข้อมูลและซิงค์ข้อมูลตัวอย่างมาตรฐานของโรงเรียนราษฎร์บำรุงศิลป์ขึ้น Cloud ใหม่ทั้งหมดใช่หรือไม่?'
    );
    if (confirmReset) {
      setSubjects(INITIAL_SUBJECTS);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SUBJECTS));
        await syncAllSubjectsToCloud(INITIAL_SUBJECTS);
        showToast('คืนค่าข้อมูลตัวอย่างและซิงค์ขึ้น Cloud เรียบร้อยแล้ว');
      } catch (err: any) {
        console.error('Failed to reset cloud data:', err);
      }
    }
  };

  // Force sync helper
  const handleForceSync = async () => {
    showToast('กำลังบังคับซิงค์ข้อมูลขึ้น Cloud...');
    try {
      await syncAllSubjectsToCloud(subjects);
      showToast('ซิงค์ข้อมูลขึ้น Cloud เรียบร้อยแล้ว');
    } catch (err: any) {
      console.error('Force sync error:', err);
    }
  };

  // Open Exam Detail modal
  const handleOpenExamDetail = (exam: ExamPaper, subject: SubjectBlock) => {
    setSelectedExam(exam);
    setSelectedSubjectForDetail(subject);
    setIsExamDetailOpen(true);
  };

  // Open Add Exam modal (Admin only)
  const handleOpenAddExam = (subject: SubjectBlock) => {
    if (!requireAdmin()) return;
    setTargetSubjectForExam(subject);
    setIsAddExamOpen(true);
  };

  // Open Admin HTML Exam modal (Admin only)
  const handleOpenAdminHtml = (subject?: SubjectBlock, exam?: ExamPaper) => {
    if (!requireAdmin()) return;
    setTargetSubjectForHtml(subject || null);
    setEditingHtmlExam(exam || null);
    setIsAdminHtmlModalOpen(true);
  };

  // Launch interactive HTML exam player (Available to students & admins!)
  const handlePlayHtmlExam = (exam: ExamPaper, subject: SubjectBlock) => {
    setPlayingHtmlExam(exam);
    setPlayingHtmlSubject(subject);
    setIsHtmlPlayerOpen(true);
  };

  // Submit Score from Exam Player
  const handleSubmitExamScore = async (record: ExamSubmissionRecord) => {
    await submitExamScore(record);
    showToast(`บันทึกผลสอบของ ${record.studentName} ในวิชา ${record.subjectName} เรียบร้อยแล้ว!`);
  };

  // Open Standard Student Score Report
  const handleOpenStudentReport = (student: StudentRecord) => {
    setSelectedReportStudent(student);
    setIsStudentReportOpen(true);
  };

  // Handle open own report for current logged-in student
  const handleOpenMyReport = () => {
    if (currentSession?.student) {
      handleOpenStudentReport(currentSession.student);
    } else {
      setIsLoginModalOpen(true);
    }
  };

  const isAdmin = currentSession?.role === 'admin';
  const isStudent = currentSession?.role === 'student';

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 font-sans text-slate-800" id="rbss-app-root">
      
      {/* Real-Time Toast Notification */}
      {toastMessage && (
        <div 
          id="system-toast"
          className="fixed bottom-5 right-5 z-50 bg-slate-950/95 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 border border-slate-700 animate-in fade-in slide-in-from-bottom-5 duration-200"
        >
          <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <span className="text-xs sm:text-sm font-medium pr-2">{toastMessage}</span>
        </div>
      )}

      {/* Main App Layout (Hidden during print so modal reports print cleanly) */}
      <div id="app-main-layout" className="flex-1 flex flex-col print:hidden">
        {/* Main School Header with Login & Real-time Cloud Sync */}
        <Header
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedYear={selectedYear}
          onYearChange={setSelectedYear}
          selectedTerm={selectedTerm}
          onTermChange={setSelectedTerm}
          onOpenAddSubject={() => {
            if (requireAdmin()) setIsAddSubjectOpen(true);
          }}
          onOpenAdminHtml={() => handleOpenAdminHtml()}
          onResetData={handleResetData}
          activeGrade={activeGrade}
          totalSubjects={totalSubjectsCount}
          totalExams={totalExamsCount}
          cloudStatus={cloudStatus}
          cloudMessage={cloudMessage}
          onForceSync={handleForceSync}
          currentSession={currentSession}
          onOpenLoginModal={() => setIsLoginModalOpen(true)}
          onLogout={handleLogout}
          onOpenMyReport={handleOpenMyReport}
          onOpenAdminScores={() => setIsAdminScoresModalOpen(true)}
          onOpenClassroomReport={() => setIsClassroomReportOpen(true)}
        />

        {/* Grade Level Selector (ป.1 - ม.3) */}
        <GradeNavigation
          grades={GRADE_CONFIGS}
          activeGradeId={activeGradeId}
          onSelectGrade={(gradeId) => setActiveGradeId(gradeId)}
          subjects={subjects}
          allSubjects={subjects}
        />

        {/* Active Grade Title & Learning Area Filter */}
        <StatsBar
          activeGrade={activeGrade}
          subjectCount={filteredGradeSubjects.length}
          examCount={currentGradeExamsCount}
          selectedAreaFilter={selectedAreaFilter}
          onAreaFilterChange={setSelectedAreaFilter}
          onOpenAddSubject={() => {
            if (requireAdmin()) setIsAddSubjectOpen(true);
          }}
          isAdmin={isAdmin}
        />

        {/* Student Welcome Banner (if logged in as Student) */}
        {isStudent && currentSession.student && (
          <div className="bg-linear-to-r from-emerald-600 via-teal-700 to-blue-800 text-white shadow-xs">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs">
                <GraduationCap className="w-4 h-4 text-amber-300" />
                <span>
                  ยินดีต้อนรับนักเรียน: <strong>{currentSession.student.name}</strong> 
                  (รหัสประจำตัว #{currentSession.student.studentCode}) • ชั้น {currentSession.student.level} ห้อง {currentSession.student.room}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleOpenMyReport}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-400 hover:bg-amber-300 text-blue-950 font-bold text-xs shadow-xs cursor-pointer"
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>ดูใบรายงานผลคะแนนมาตรฐานของฉัน</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6" id="subject-blocks-container">
          
          {/* Top Grade Status and Role Quick Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <span>รายวิชาและบล็อกข้อสอบ</span>
                <span className="text-xs font-normal text-slate-500">
                  (แสดง {filteredGradeSubjects.length} จาก {currentGradeSubjects.length} วิชา ใน {activeGrade.shortName})
                </span>
              </h3>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Admin only actions */}
              {isAdmin && (
                <>
                  <button
                    type="button"
                    id="btn-global-admin-html"
                    onClick={() => handleOpenAdminHtml()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-700 hover:bg-violet-800 text-white text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                    title="บล็อครับค่าข้อสอบออนไลน์ HTML โดย Admin"
                  >
                    <Code2 className="w-3.5 h-3.5 text-amber-300" />
                    <span>รับค่าข้อสอบ HTML (Admin)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsAdminScoresModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                    title="เปิดดูและจัดการรายงานคะแนนสอบนักเรียนทั้งหมด"
                  >
                    <Award className="w-3.5 h-3.5 text-amber-300" />
                    <span>ศูนย์รายงานคะแนนนักเรียน</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsAddSubjectOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                  >
                    <PlusCircle className="w-3.5 h-3.5 text-amber-300" />
                    <span>เพิ่มวิชา (+)</span>
                  </button>
                </>
              )}

              {/* Student shortcut */}
              {isStudent && (
                <button
                  type="button"
                  onClick={handleOpenMyReport}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-2xs transition-colors cursor-pointer"
                >
                  <Award className="w-3.5 h-3.5 text-amber-300" />
                  <span>ใบรายงานผลคะแนนมาตรฐาน</span>
                </button>
              )}

              {/* General Report Summary */}
              <button
                type="button"
                onClick={() => setIsReportModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-medium transition-colors shadow-2xs cursor-pointer"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-blue-600" />
                <span>พิมพ์รายงานสรุปคลังข้อสอบ</span>
              </button>
            </div>
          </div>

          {/* Dynamic HTML Blocks Grid */}
          {filteredGradeSubjects.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-8 sm:p-12 text-center my-6">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                <BookOpen className="w-7 h-7" />
              </div>
              <h4 className="text-base font-bold text-slate-800 mb-1">
                ไม่พบรายวิชาในเงื่อนไขการค้นหา
              </h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto mb-4">
                {searchQuery || selectedAreaFilter !== 'all' || selectedYear !== 'all' || selectedTerm !== 'all'
                  ? 'ลองปรับเปลี่ยนคำค้นหา หรือล้างตัวกรองเพื่อดูวิชาทั้งหมดในระดับชั้นนี้'
                  : `ยังไม่มีการเพิ่มรายวิชาในระดับชั้น ${activeGrade.fullName}`}
              </p>
              
              {isAdmin && (
                <div className="flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddSubjectOpen(true)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                  >
                    <PlusCircle className="w-4 h-4 text-amber-300" />
                    <span>เพิ่มรายวิชาใหม่ใน {activeGrade.shortName}</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5" id="subjects-grid">
              {filteredGradeSubjects.map((subject) => (
                <SubjectCard
                  key={subject.id}
                  subject={subject}
                  onAddExamToSubject={handleOpenAddExam}
                  onOpenAdminHtmlModal={handleOpenAdminHtml}
                  onPlayHtmlExam={handlePlayHtmlExam}
                  onViewExamDetail={handleOpenExamDetail}
                  onDeleteSubject={handleDeleteSubject}
                  onDeleteExam={handleDeleteExam}
                  currentSession={currentSession}
                  allScores={allScores}
                />
              ))}
            </div>
          )}

        </main>

        {/* Footer */}
        <Footer />
      </div>

      {/* Modals */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Standard Student Score Report Modal */}
      <StudentScoreReportModal
        isOpen={isStudentReportOpen}
        onClose={() => {
          setIsStudentReportOpen(false);
          setSelectedReportStudent(null);
        }}
        student={selectedReportStudent}
        allScores={allScores}
        allSubjects={subjects}
      />

      {/* Admin Score Management Dashboard Modal */}
      <AdminScoreManagementModal
        isOpen={isAdminScoresModalOpen}
        onClose={() => setIsAdminScoresModalOpen(false)}
        allScores={allScores}
        allSubjects={subjects}
        onOpenStudentReport={(student) => {
          setIsAdminScoresModalOpen(false);
          handleOpenStudentReport(student);
        }}
        onOpenClassroomReport={() => {
          setIsAdminScoresModalOpen(false);
          setIsClassroomReportOpen(true);
        }}
      />

      {/* Classroom-based Score Report Modal for Teachers */}
      <ClassroomScoreReportModal
        isOpen={isClassroomReportOpen}
        onClose={() => setIsClassroomReportOpen(false)}
        allScores={allScores}
        allSubjects={subjects}
        onOpenStudentReport={(student) => {
          handleOpenStudentReport(student);
        }}
        initialLevel={activeGrade.name}
      />

      {/* Add Subject Modal (Admin only) */}
      <AddSubjectModal
        isOpen={isAddSubjectOpen}
        onClose={() => setIsAddSubjectOpen(false)}
        activeGrade={activeGrade}
        allGrades={GRADE_CONFIGS}
        onAddSubject={handleAddSubject}
      />

      {/* Add Exam Modal (Admin only) */}
      <AddExamModal
        isOpen={isAddExamOpen}
        onClose={() => {
          setIsAddExamOpen(false);
          setTargetSubjectForExam(null);
        }}
        targetSubject={targetSubjectForExam}
        onAddExam={handleAddExam}
        onOpenAdminHtmlModal={handleOpenAdminHtml}
      />

      {/* Exam Detail Modal */}
      <ExamDetailModal
        isOpen={isExamDetailOpen}
        onClose={() => {
          setIsExamDetailOpen(false);
          setSelectedExam(null);
          setSelectedSubjectForDetail(null);
        }}
        exam={selectedExam}
        subject={selectedSubjectForDetail}
        onPlayHtmlExam={handlePlayHtmlExam}
        onOpenEditHtml={(exam, subject) => handleOpenAdminHtml(subject, exam)}
      />

      {/* Admin HTML Exam Input Modal (Admin only) */}
      <AdminHtmlExamModal
        isOpen={isAdminHtmlModalOpen}
        onClose={() => {
          setIsAdminHtmlModalOpen(false);
          setTargetSubjectForHtml(null);
          setEditingHtmlExam(null);
        }}
        targetSubject={targetSubjectForHtml}
        existingExam={editingHtmlExam}
        onSaveExam={handleSaveHtmlExam}
        allSubjects={subjects}
      />

      {/* Interactive HTML Online Exam Player */}
      <HtmlExamPlayerModal
        isOpen={isHtmlPlayerOpen}
        onClose={() => {
          setIsHtmlPlayerOpen(false);
          setPlayingHtmlExam(null);
          setPlayingHtmlSubject(null);
        }}
        exam={playingHtmlExam}
        subject={playingHtmlSubject}
        currentSession={currentSession}
        onSubmitScore={handleSubmitExamScore}
        onOpenReport={handleOpenStudentReport}
        onOpenLoginPrompt={() => setIsLoginModalOpen(true)}
        onOpenEditHtml={(exam, subject) => {
          setIsHtmlPlayerOpen(false);
          handleOpenAdminHtml(subject, exam);
        }}
      />

      {/* Exam Repository Summary Report */}
      <ReportSummaryModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        grades={GRADE_CONFIGS}
        subjects={subjects}
        activeGrade={activeGrade}
      />
    </div>
  );
}
