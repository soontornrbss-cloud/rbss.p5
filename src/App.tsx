/**
 * ระบบคลังเก็บข้อสอบออนไลน์ โรงเรียนราษฎร์บำรุงศิลป์
 * รองรับระดับชั้น ป.1 - ม.3 และจัดการบล็อกรายวิชาแบบ Dynamic (Client-Side)
 */

import React, { useState, useEffect, useMemo } from 'react';
import { GradeId, SubjectBlock, ExamPaper, GradeConfig } from './types';
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
import { Footer } from './components/Footer';
import { 
  subscribeToSubjects, 
  saveSubjectToCloud, 
  deleteSubjectFromCloud, 
  saveExamToSubjectInCloud, 
  deleteExamFromSubjectInCloud, 
  seedInitialSubjects, 
  syncAllSubjectsToCloud,
  CloudSyncStatus
} from './services/examSyncService';
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
  Cloud
} from 'lucide-react';

const STORAGE_KEY = 'rbss_exam_repository_data_v1';

export default function App() {
  // 1. Core State
  const [activeGradeId, setActiveGradeId] = useState<GradeId>('p1');
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

  // Cloud Sync State
  const [cloudStatus, setCloudStatus] = useState<CloudSyncStatus>('connecting');
  const [cloudMessage, setCloudMessage] = useState<string>('กำลังเชื่อมต่อฐานข้อมูล Cloud (Firebase)...');

  // Real-time Firestore Cloud Synchronization
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

  // Save to localStorage as a fallback local cache
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(subjects));
    } catch (e) {
      console.warn('Failed to save to localStorage:', e);
    }
  }, [subjects]);

  // 2. Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedYear, setSelectedYear] = useState('all');
  const [selectedTerm, setSelectedTerm] = useState('all');
  const [selectedAreaFilter, setSelectedAreaFilter] = useState('all');

  // 3. Modals State
  const [isAddSubjectOpen, setIsAddSubjectOpen] = useState(false);
  const [isAddExamOpen, setIsAddExamOpen] = useState(false);
  const [targetSubjectForExam, setTargetSubjectForExam] = useState<SubjectBlock | null>(null);
  const [isExamDetailOpen, setIsExamDetailOpen] = useState(false);
  const [selectedExam, setSelectedExam] = useState<ExamPaper | null>(null);
  const [selectedSubjectForDetail, setSelectedSubjectForDetail] = useState<SubjectBlock | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // 4. Admin HTML Exam Modal & Interactive Player States
  const [isAdminHtmlModalOpen, setIsAdminHtmlModalOpen] = useState(false);
  const [targetSubjectForHtml, setTargetSubjectForHtml] = useState<SubjectBlock | null>(null);
  const [editingHtmlExam, setEditingHtmlExam] = useState<ExamPaper | null>(null);

  const [isHtmlPlayerOpen, setIsHtmlPlayerOpen] = useState(false);
  const [playingHtmlExam, setPlayingHtmlExam] = useState<ExamPaper | null>(null);
  const [playingHtmlSubject, setPlayingHtmlSubject] = useState<SubjectBlock | null>(null);

  // 5. Notification Toast State
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
  const totalSubjectsCount = subjects.length;
  const totalExamsCount = useMemo(() => {
    return subjects.reduce((acc, curr) => acc + curr.exams.length, 0);
  }, [subjects]);

  // Subjects in the current active grade
  const currentGradeSubjects = useMemo(() => {
    return subjects.filter((s) => s.gradeId === activeGradeId);
  }, [subjects, activeGradeId]);

  const currentGradeExamsCount = useMemo(() => {
    return currentGradeSubjects.reduce((acc, curr) => acc + curr.exams.length, 0);
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

  // 5. Actions Handlers with Real-Time Cloud Persistence
  // Add new subject dynamically
  const handleAddSubject = async (newSubject: SubjectBlock) => {
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

  // Delete subject
  const handleDeleteSubject = async (subjectId: string, subjectName: string) => {
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

  // Add exam paper into a specific subject
  const handleAddExam = async (subjectId: string, newExam: ExamPaper) => {
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

  // Delete exam paper from a subject
  const handleDeleteExam = async (subjectId: string, examId: string, examTitle: string) => {
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

  // Reset to demo initial data in Cloud
  const handleResetData = async () => {
    const confirmReset = window.confirm('คุณต้องการคืนค่าข้อมูลตัวอย่างเริ่มต้นทั้งหมดใช่หรือไม่? ข้อมูลบนระบบ Cloud จะถูกอัปเดตใหม่เพื่อให้ทุกเครื่องแสดงตรงกัน');
    if (confirmReset) {
      setSubjects(INITIAL_SUBJECTS);
      localStorage.removeItem(STORAGE_KEY);
      showToast('กำลังคืนค่าและซิงค์ข้อมูลเริ่มต้นขึ้น Cloud...');

      try {
        await seedInitialSubjects(INITIAL_SUBJECTS);
        showToast('คืนค่าข้อมูลรายวิชาและคลังข้อสอบตัวอย่างสำเร็จ ทุกเครื่องซิงค์ตรงกันแล้ว');
      } catch (err: any) {
        console.error('Failed to seed cloud subjects:', err);
        showToast('คืนค่าข้อมูลในเครื่องสำเร็จ');
      }
    }
  };

  // Force manual sync all to Cloud
  const handleForceSync = async () => {
    showToast('กำลังส่งข้อมูลรายวิชาและข้อสอบทั้งหมดขึ้น Cloud...');
    try {
      await syncAllSubjectsToCloud(subjects);
      showToast('ซิงค์ข้อมูลทั้งหมดขึ้น Cloud เรียบร้อยแล้ว ทุกเครื่องเห็นข้อมูลเดียวกัน');
    } catch (err: any) {
      console.error('Force sync error:', err);
      showToast(`เกิดข้อผิดพลาดในการซิงค์: ${err?.message || ''}`);
    }
  };

  // Open modal helpers
  const handleOpenAddExam = (subject: SubjectBlock) => {
    setTargetSubjectForExam(subject);
    setIsAddExamOpen(true);
  };

  const handleOpenExamDetail = (exam: ExamPaper, subject: SubjectBlock) => {
    setSelectedExam(exam);
    setSelectedSubjectForDetail(subject);
    setIsExamDetailOpen(true);
  };

  // Open Admin HTML Exam input block
  const handleOpenAdminHtml = (subject?: SubjectBlock, exam?: ExamPaper) => {
    const target = subject || currentGradeSubjects[0] || subjects[0] || null;
    if (!target) {
      showToast('กรุณาสร้างรายวิชาก่อนใช้งานบล็อครับค่าข้อสอบ HTML');
      return;
    }
    setTargetSubjectForHtml(target);
    setEditingHtmlExam(exam || null);
    setIsAdminHtmlModalOpen(true);
  };

  // Save HTML exam (new or update existing) with direct Firestore Cloud sync
  const handleSaveHtmlExam = async (subjectId: string, exam: ExamPaper) => {
    // 1. Optimistic update in state so current screen updates instantly
    setSubjects((prev) =>
      prev.map((sub) => {
        if (sub.id === subjectId) {
          const exists = sub.exams.some((e) => e.id === exam.id);
          if (exists) {
            return {
              ...sub,
              exams: sub.exams.map((e) => (e.id === exam.id ? exam : e)),
            };
          } else {
            return {
              ...sub,
              exams: [exam, ...sub.exams],
            };
          }
        }
        return sub;
      })
    );
    showToast(`กำลังบันทึกและอัปเดตข้อสอบ HTML "${exam.title}" ขึ้น Cloud...`);

    // 2. Persist to Firestore Cloud Database so all other machines get updated immediately
    try {
      await saveExamToSubjectInCloud(subjectId, exam, subjects);
      showToast(`อัปเดตข้อสอบ HTML "${exam.title}" ขึ้น Cloud สำเร็จ! ทุกเครื่องเห็นข้อสอบใหม่ทันที`);
    } catch (err: any) {
      console.error('Failed to save HTML exam to Firestore:', err);
      showToast(`บันทึกในเครื่องแล้ว แต่เกิดปัญหาในการซิงค์ขึ้น Cloud: ${err?.message || ''}`);
    }
  };

  // Open Interactive HTML Player
  const handlePlayHtmlExam = (exam: ExamPaper, subject: SubjectBlock) => {
    setPlayingHtmlExam(exam);
    setPlayingHtmlSubject(subject);
    setIsHtmlPlayerOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 text-slate-800" id="school-exam-app">
      {/* Toast Notification */}
      {toastMessage && (
        <div 
          id="toast-notification"
          className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 text-xs sm:text-sm font-medium border border-slate-700 animate-in fade-in slide-in-from-bottom-5 duration-200"
        >
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Header with school title and search/filters */}
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedYear={selectedYear}
        onYearChange={setSelectedYear}
        selectedTerm={selectedTerm}
        onTermChange={setSelectedTerm}
        onOpenAddSubject={() => setIsAddSubjectOpen(true)}
        onOpenAdminHtml={() => handleOpenAdminHtml()}
        onResetData={handleResetData}
        activeGrade={activeGrade}
        totalSubjects={totalSubjectsCount}
        totalExams={totalExamsCount}
        cloudStatus={cloudStatus}
        cloudMessage={cloudMessage}
        onForceSync={handleForceSync}
      />

      {/* Grade Level Navigation (ป.1 - ม.3 Tabs) */}
      <GradeNavigation
        grades={GRADE_CONFIGS}
        activeGradeId={activeGradeId}
        onSelectGrade={setActiveGradeId}
        subjects={subjects}
      />

      {/* Current Grade Header and Category Filter Bar */}
      <StatsBar
        activeGrade={activeGrade}
        subjectCount={currentGradeSubjects.length}
        examCount={currentGradeExamsCount}
        selectedAreaFilter={selectedAreaFilter}
        onAreaFilterChange={setSelectedAreaFilter}
        onOpenAddSubject={() => setIsAddSubjectOpen(true)}
      />

      {/* Main Content Area: Dynamic HTML Subject Blocks */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6" id="subject-blocks-container">
        
        {/* Top Grade Status and Quick Actions */}
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
              onClick={() => setIsReportModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-medium transition-colors shadow-2xs cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-blue-600" />
              <span>พิมพ์รายงานสรุปคลังข้อสอบ</span>
            </button>

            <button
              type="button"
              onClick={() => setIsAddSubjectOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5 text-amber-300" />
              <span>เพิ่มวิชา (+)</span>
            </button>
          </div>
        </div>

        {/* Dynamic HTML Blocks Grid */}
        {filteredGradeSubjects.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-8 sm:p-12 text-center my-6">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
              <BookOpen className="w-7 h-7" />
            </div>
            <h4 className="text-base font-bold text-slate-800">
              {searchQuery || selectedAreaFilter !== 'all'
                ? 'ไม่พบรายวิชาที่ตรงกับเงื่อนไขการค้นหา'
                : `ยังไม่มีรายวิชาในระดับชั้น ${activeGrade.fullName}`}
            </h4>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mt-1 mb-5">
              {searchQuery || selectedAreaFilter !== 'all'
                ? 'ลองเปลี่ยนคำค้นหา หรือรีเซ็ตตัวกรองกลุ่มสาระการเรียนรู้'
                : 'คุณสามารถกดปุ่ม "เพิ่มรายวิชา (+)" หรือ "รับค่าข้อสอบ HTML (Admin)" เพื่อสร้างบล็อกวิชาและบันทึกข้อสอบได้ทันที'}
            </p>

            <div className="flex items-center justify-center gap-2">
              {(searchQuery || selectedAreaFilter !== 'all') && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedAreaFilter('all');
                  }}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors"
                >
                  ล้างตัวกรองทั้งหมด
                </button>
              )}

              <button
                type="button"
                onClick={() => setIsAddSubjectOpen(true)}
                className="px-4 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold inline-flex items-center gap-1.5 shadow-sm transition-all"
              >
                <PlusCircle className="w-4 h-4 text-amber-300" />
                <span>เพิ่มรายวิชาในชั้นนี้ (+)</span>
              </button>
            </div>
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
              />
            ))}
          </div>
        )}

      </main>

      {/* Footer */}
      <Footer />

      {/* Modals */}
      <AddSubjectModal
        isOpen={isAddSubjectOpen}
        onClose={() => setIsAddSubjectOpen(false)}
        activeGrade={activeGrade}
        allGrades={GRADE_CONFIGS}
        onAddSubject={handleAddSubject}
      />

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

      {/* Admin HTML Exam Input Modal */}
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
        onOpenEditHtml={(exam, subject) => {
          setIsHtmlPlayerOpen(false);
          handleOpenAdminHtml(subject, exam);
        }}
      />

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
