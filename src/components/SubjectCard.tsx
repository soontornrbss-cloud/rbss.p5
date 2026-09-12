import React from 'react';
import { 
  SubjectBlock, 
  ExamPaper, 
  AuthSession,
  ExamSubmissionRecord
} from '../types';
import { LEARNING_AREAS_INFO } from '../data/initialData';
import { 
  FileText, 
  FileCheck, 
  ExternalLink, 
  Plus, 
  Trash2, 
  User, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  FileCode,
  Download,
  Eye,
  Info,
  Code2,
  Play,
  Sparkles,
  Edit3,
  Award
} from 'lucide-react';

interface SubjectCardProps {
  subject: SubjectBlock;
  onAddExamToSubject: (subject: SubjectBlock) => void;
  onOpenAdminHtmlModal: (subject: SubjectBlock, exam?: ExamPaper) => void;
  onPlayHtmlExam: (exam: ExamPaper, subject: SubjectBlock) => void;
  onViewExamDetail: (exam: ExamPaper, subject: SubjectBlock) => void;
  onDeleteSubject: (subjectId: string, subjectName: string) => void;
  onDeleteExam: (subjectId: string, examId: string, examTitle: string) => void;
  currentSession: AuthSession | null;
  allScores?: ExamSubmissionRecord[];
}

export const SubjectCard: React.FC<SubjectCardProps> = ({
  subject,
  onAddExamToSubject,
  onOpenAdminHtmlModal,
  onPlayHtmlExam,
  onViewExamDetail,
  onDeleteSubject,
  onDeleteExam,
  currentSession,
  allScores = [],
}) => {
  const isAdmin = currentSession?.role === 'admin';
  const currentStudent = currentSession?.student;

  const areaInfo = LEARNING_AREAS_INFO[subject.learningArea] || {
    color: '#64748B',
    bgLight: 'bg-slate-50',
    textDark: 'text-slate-700',
    border: 'border-slate-200',
  };

  const renderFileIcon = (type: ExamPaper['fileType']) => {
    switch (type) {
      case 'html':
        return (
          <div className="w-8 h-8 rounded-lg bg-violet-100 text-violet-700 flex items-center justify-center flex-shrink-0 font-bold text-xs border border-violet-200" title="ข้อสอบออนไลน์ HTML">
            <Code2 className="w-4 h-4 text-violet-600" />
          </div>
        );
      case 'pdf':
        return (
          <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center flex-shrink-0 font-bold text-xs" title="ไฟล์ PDF">
            PDF
          </div>
        );
      case 'docx':
        return (
          <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 font-bold text-xs" title="ไฟล์ Word DOCX">
            DOC
          </div>
        );
      case 'google_form':
        return (
          <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center flex-shrink-0 font-bold text-xs" title="Google Forms ออนไลน์">
            <FileCode className="w-4 h-4" />
          </div>
        );
      case 'link':
      default:
        return (
          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0 font-bold text-xs" title="ลิงก์ข้อสอบออนไลน์">
            <ExternalLink className="w-4 h-4" />
          </div>
        );
    }
  };

  return (
    <article
      id={`subject-block-${subject.id}`}
      className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden group"
    >
      {/* 1. Header of the Subject Block */}
      <header className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            {/* Subject Code & Learning Area */}
            <div className="flex items-center gap-2 flex-wrap mb-1.5">
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-slate-800 text-amber-300">
                {subject.code || 'รหัสวิชา'}
              </span>
              <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${areaInfo.bgLight} ${areaInfo.textDark} ${areaInfo.border}`}>
                {subject.learningArea}
              </span>
              {subject.periodsPerWeek && (
                <span className="text-[11px] text-slate-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {subject.periodsPerWeek} ชม./สัปดาห์
                </span>
              )}
            </div>

            {/* Subject Name */}
            <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
              {subject.name}
            </h3>

            {/* Teacher and Academic details */}
            <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-600 flex-wrap">
              <span className="inline-flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>{subject.teacher || 'ไม่ระบุผู้สอน'}</span>
              </span>
              <span className="inline-flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>ภาคเรียนที่ {subject.term} / {subject.academicYear}</span>
              </span>
            </div>
          </div>

          {/* Delete Subject Button: Admin ONLY */}
          {isAdmin && (
            <button
              type="button"
              id={`btn-delete-subject-${subject.id}`}
              onClick={() => onDeleteSubject(subject.id, subject.name)}
              title="ลบรายวิชานี้ (เฉพาะ Admin)"
              className="text-slate-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors opacity-80 hover:opacity-100 cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Optional Subject Description */}
        {subject.description && (
          <p className="mt-2 text-xs text-slate-500 line-clamp-2 leading-relaxed">
            {subject.description}
          </p>
        )}
      </header>

      {/* 2. Body: Exam Repository Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
              <FileText className="w-3.5 h-3.5 text-blue-600" />
              <span>คลังข้อสอบในวิชานี้</span>
              <span className="bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded-full text-[11px] font-bold">
                {subject.exams.length}
              </span>
            </div>

            {/* Admin Quick Actions: Only visible if Admin */}
            {isAdmin && (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  id={`btn-admin-html-${subject.id}`}
                  onClick={() => onOpenAdminHtmlModal(subject)}
                  title="บล็อครับค่าข้อสอบออนไลน์ HTML โดย Admin"
                  className="text-xs text-violet-700 hover:text-violet-900 bg-violet-50 hover:bg-violet-100 font-semibold px-2.5 py-1 rounded-md border border-violet-200 transition-colors inline-flex items-center gap-1 shadow-2xs cursor-pointer"
                >
                  <Code2 className="w-3.5 h-3.5 text-violet-600" />
                  <span>รับค่า HTML (Admin)</span>
                </button>

                <button
                  type="button"
                  id={`btn-add-exam-${subject.id}`}
                  onClick={() => onAddExamToSubject(subject)}
                  className="text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50 font-medium px-2 py-1 rounded-md transition-colors inline-flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>แนบไฟล์</span>
                </button>
              </div>
            )}
          </div>

          {/* List of Attached Exam Papers */}
          {subject.exams.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 p-4 text-center bg-slate-50/50 my-2">
              <p className="text-xs text-slate-400 font-medium">ยังไม่มีไฟล์ข้อสอบในรายวิชานี้</p>
              {isAdmin && (
                <div className="mt-2.5 flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => onOpenAdminHtmlModal(subject)}
                    className="text-xs text-violet-700 bg-violet-50 hover:bg-violet-100 border border-violet-200 font-semibold px-2.5 py-1 rounded-md transition-all inline-flex items-center gap-1"
                  >
                    <Code2 className="w-3.5 h-3.5 text-violet-600" />
                    <span>รับค่าข้อสอบ HTML</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onAddExamToSubject(subject)}
                    className="text-xs text-blue-600 font-semibold hover:underline inline-flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>แนบไฟล์ข้อสอบ</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <ul className="space-y-2.5">
              {subject.exams.map((exam) => {
                // Check if current student has taken this exam
                const studentScore = currentStudent
                  ? allScores.find(
                      (s) =>
                        s.studentCode === currentStudent.studentCode &&
                        (s.examId === exam.id || s.examTitle === exam.title)
                    )
                  : null;

                return (
                  <li
                    key={exam.id}
                    id={`exam-item-${exam.id}`}
                    className={`p-3 rounded-xl border transition-all duration-150 shadow-2xs ${
                      exam.fileType === 'html'
                        ? 'border-violet-200 bg-violet-50/20 hover:border-violet-400 hover:bg-violet-50/40'
                        : 'border-slate-200/80 bg-white hover:border-blue-300 hover:bg-blue-50/30'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {renderFileIcon(exam.fileType)}

                        <div className="flex-1 min-w-0">
                          {/* Exam Title */}
                          <h4 className="text-xs sm:text-sm font-semibold text-slate-900 truncate" title={exam.title}>
                            {exam.title}
                          </h4>

                          {/* Simplified clean metadata */}
                          <div className="flex items-center gap-2 mt-0.5 flex-wrap text-[11px] text-slate-500">
                            <span className="font-medium text-slate-600">
                              {exam.examType}
                            </span>

                            {exam.maxScore && (
                              <span className="px-1.5 py-0.2 bg-slate-100 text-slate-700 rounded font-medium">
                                {exam.maxScore} คะแนน
                              </span>
                            )}

                            {exam.timeLimitMinutes ? (
                              <span className="text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200 inline-flex items-center gap-0.5 font-medium">
                                <Clock className="w-3 h-3" />
                                {exam.timeLimitMinutes} นาที
                              </span>
                            ) : null}

                            {/* Student Score Badge (if already taken) */}
                            {studentScore && (
                              <span className={`inline-flex items-center gap-1 font-bold px-2 py-0.2 rounded-md ${
                                studentScore.isPassed 
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                                  : 'bg-amber-100 text-amber-800 border border-amber-300'
                              }`}>
                                <Award className="w-3 h-3" />
                                <span>ผลสอบ: {studentScore.score}/{studentScore.maxScore} ({studentScore.percentage.toFixed(0)}%) • {studentScore.isPassed ? 'ผ่านเกณฑ์' : 'ไม่ผ่าน'}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Action buttons for this exam item: clean and direct */}
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        
                        {/* Primary Action Button: 'ทำข้อสอบ' for HTML or 'เปิดข้อสอบ' for documents */}
                        {exam.fileType === 'html' ? (
                          <button
                            type="button"
                            onClick={() => onPlayHtmlExam(exam, subject)}
                            title="เข้าทำข้อสอบออนไลน์นี้"
                            className="px-3 py-1.5 bg-violet-700 hover:bg-violet-800 text-white rounded-lg text-xs font-bold inline-flex items-center gap-1.5 shadow-2xs transition-all active:scale-95 cursor-pointer"
                          >
                            <Play className="w-3.5 h-3.5 fill-current text-amber-300" />
                            <span>ทำข้อสอบ</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => onViewExamDetail(exam, subject)}
                            title="เปิดดูฉบับข้อสอบ"
                            className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold inline-flex items-center gap-1.5 shadow-2xs transition-all active:scale-95 cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5 text-amber-300" />
                            <span>เปิดข้อสอบ</span>
                          </button>
                        )}

                        {/* Admin-only controls */}
                        {isAdmin && (
                          <>
                            {exam.fileType === 'html' && (
                              <button
                                type="button"
                                onClick={() => onOpenAdminHtmlModal(subject, exam)}
                                title="แก้ไขโค้ด HTML โดย Admin"
                                className="p-1.5 text-violet-600 hover:text-violet-800 hover:bg-violet-100 rounded-lg transition-colors cursor-pointer"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {exam.fileType === 'html' && (
                              <button
                                type="button"
                                onClick={() => onViewExamDetail(exam, subject)}
                                title="ดูรายละเอียดข้อสอบ"
                                className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => onDeleteExam(subject.id, exam.id, exam.title)}
                              title="ลบข้อสอบนี้ (เฉพาะ Admin)"
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>

                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* 3. Footer: Dynamic Block Controls (Admin Only) */}
        {isAdmin && (
          <footer className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <div className="text-slate-400 flex items-center gap-1 text-[11px]">
              <Info className="w-3 h-3" />
              <span>รหัสบล็อก: #{subject.id.slice(-6)}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => onOpenAdminHtmlModal(subject)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-violet-700 hover:text-violet-900 bg-violet-50 hover:bg-violet-100 px-2 py-1 rounded-lg border border-violet-200 transition-colors cursor-pointer"
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>รับค่า HTML</span>
              </button>

              <button
                type="button"
                onClick={() => onAddExamToSubject(subject)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded-lg transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>แนบข้อสอบ</span>
              </button>
            </div>
          </footer>
        )}
      </div>
    </article>
  );
};
