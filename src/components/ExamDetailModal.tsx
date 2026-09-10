import React, { useState } from 'react';
import { ExamPaper, SubjectBlock } from '../types';
import { 
  X, 
  FileText, 
  Download, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle, 
  Printer, 
  Calendar, 
  User, 
  FileCheck,
  Check,
  Code2,
  Play,
  Copy,
  Clock
} from 'lucide-react';

interface ExamDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  exam: ExamPaper | null;
  subject: SubjectBlock | null;
  onPlayHtmlExam?: (exam: ExamPaper, subject: SubjectBlock) => void;
  onOpenEditHtml?: (exam: ExamPaper, subject: SubjectBlock) => void;
}

export const ExamDetailModal: React.FC<ExamDetailModalProps> = ({
  isOpen,
  onClose,
  exam,
  subject,
  onPlayHtmlExam,
  onOpenEditHtml,
}) => {
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [keySuccess, setKeySuccess] = useState(false);
  const [copiedHtml, setCopiedHtml] = useState(false);

  if (!isOpen || !exam || !subject) return null;

  const handleDownload = () => {
    if (exam.fileType === 'html' && exam.htmlContent) {
      const blob = new Blob([exam.htmlContent], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = exam.fileName || `${subject.code}_${exam.title}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2500);
  };

  const handleCopyHtml = () => {
    if (exam.htmlContent) {
      navigator.clipboard.writeText(exam.htmlContent);
      setCopiedHtml(true);
      setTimeout(() => setCopiedHtml(false), 2000);
    }
  };

  const handleOpenKey = () => {
    setKeySuccess(true);
    setTimeout(() => setKeySuccess(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
      id="exam-detail-modal-backdrop"
    >
      <div 
        id="exam-detail-modal"
        className="relative bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="bg-linear-to-r from-slate-900 via-blue-900 to-indigo-950 text-white px-6 py-4 flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-blue-800/80 text-amber-300 border border-blue-700/60 shrink-0">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-sm bg-blue-950 text-amber-300 border border-blue-800">
                  {subject.code}
                </span>
                <span className="text-xs text-blue-200">
                  {subject.name}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white leading-tight">
                {exam.title}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-blue-200 hover:text-white p-1 rounded-lg hover:bg-blue-800/80 transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-slate-700">
          
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="text-slate-400 block text-[11px]">ประเภทข้อสอบ</span>
              <span className="font-semibold text-slate-800">{exam.examType}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">ภาคเรียน/ปี</span>
              <span className="font-semibold text-slate-800">เทอม {exam.term}/{exam.academicYear}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">จำนวนข้อ</span>
              <span className="font-semibold text-slate-800">{exam.totalQuestions ? `${exam.totalQuestions} ข้อ` : '-'}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">คะแนนเต็ม</span>
              <span className="font-semibold text-slate-800">{exam.maxScore ? `${exam.maxScore} คะแนน` : '-'}</span>
            </div>
          </div>

          {/* File Card Info */}
          <div className="border border-slate-200 rounded-xl p-3.5 bg-white space-y-2">
            <span className="text-xs font-semibold text-slate-600 block">
              เอกสารไฟล์ข้อสอบหลัก:
            </span>
            <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-100">
              <div className="flex items-center gap-2 overflow-hidden">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0">
                  {exam.fileType.toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-800 truncate">
                    {exam.fileName || (exam.fileUrl && exam.fileUrl !== '#' ? exam.fileUrl : `${exam.title}.${exam.fileType}`)}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    ขนาด: {exam.fileSize || '1.2 MB'} • สถานะ: ตรวจสอบแล้ว
                  </p>
                </div>
              </div>

              {exam.fileType === 'html' ? (
                <div className="flex items-center gap-1.5 flex-wrap">
                  {onPlayHtmlExam && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onPlayHtmlExam(exam, subject);
                      }}
                      className="px-3 py-1.5 bg-violet-700 hover:bg-violet-800 text-white rounded-lg text-xs font-semibold inline-flex items-center gap-1 shadow-2xs cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-current text-amber-300" />
                      <span>เข้าทำข้อสอบ</span>
                    </button>
                  )}

                  {onOpenEditHtml && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenEditHtml(exam, subject);
                      }}
                      className="px-2.5 py-1.5 bg-violet-50 hover:bg-violet-100 text-violet-700 border border-violet-200 rounded-lg text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Code2 className="w-3.5 h-3.5" />
                      <span>แก้ไขโค้ด</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleDownload}
                    className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs transition-colors cursor-pointer"
                    title="ดาวน์โหลดไฟล์ .html"
                  >
                    {downloadSuccess ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Download className="w-4 h-4" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyHtml}
                    className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs transition-colors cursor-pointer"
                    title="คัดลอกโค้ด HTML ทั้งหมด"
                  >
                    {copiedHtml ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              ) : exam.fileType === 'google_form' || exam.fileType === 'link' ? (
                <a
                  href={exam.fileUrl || 'https://forms.google.com'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold inline-flex items-center gap-1 shadow-2xs"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  เปิดลิงก์
                </a>
              ) : (
                <button
                  type="button"
                  onClick={handleDownload}
                  className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold inline-flex items-center gap-1 shadow-2xs cursor-pointer"
                >
                  {downloadSuccess ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-300" />
                      <span>ดาวน์โหลดแล้ว</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-3.5 h-3.5" />
                      <span>ดาวน์โหลด</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Answer Key Row */}
            {exam.hasAnswerKey && (
              <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between p-2 bg-emerald-50/60 rounded-lg border border-emerald-100">
                <div className="flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <span className="text-xs font-medium text-emerald-800 block">
                      {exam.answerKeyName || 'เฉลยข้อสอบและเกณฑ์การให้คะแนน'}
                    </span>
                    <span className="text-[10px] text-emerald-600">
                      ไฟล์เฉลยพร้อมใช้งานสำหรับครูผู้สอน
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleOpenKey}
                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-medium inline-flex items-center gap-1 cursor-pointer"
                >
                  {keySuccess ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-white" />
                      <span>เปิดเฉลย</span>
                    </>
                  ) : (
                    <>
                      <FileCheck className="w-3.5 h-3.5" />
                      <span>ดูเฉลย</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Teacher and Note details */}
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-500 py-1 border-b border-slate-100">
              <span className="flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-slate-400" />
                ครูผู้ออกข้อสอบ:
              </span>
              <span className="font-semibold text-slate-700">{exam.uploader}</span>
            </div>

            <div className="flex items-center justify-between text-slate-500 py-1 border-b border-slate-100">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                วันที่อัปโหลดเข้าระบบ:
              </span>
              <span className="text-slate-700">{exam.uploadedAt}</span>
            </div>

            {exam.notes && (
              <div className="p-2.5 bg-amber-50/70 border border-amber-200/70 rounded-lg text-amber-800 text-xs">
                <span className="font-semibold">หมายเหตุจากผู้ออกข้อสอบ: </span>
                {exam.notes}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
            <button
              type="button"
              onClick={handlePrint}
              className="text-xs text-slate-600 hover:text-slate-800 hover:bg-slate-100 px-3 py-2 rounded-lg inline-flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4 text-slate-500" />
              <span>พิมพ์ใบปะหน้าข้อสอบ</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
            >
              ปิดหน้าต่าง
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
