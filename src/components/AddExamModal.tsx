import React, { useState } from 'react';
import { ExamFileType, ExamPaper, ExamType, SubjectBlock } from '../types';
import { 
  X, 
  UploadCloud, 
  FileText, 
  Link as LinkIcon, 
  CheckSquare, 
  AlertCircle,
  FileCheck,
  Code2,
  Sparkles
} from 'lucide-react';
import { getDefaultHtmlExam } from '../data/htmlExamTemplates';

interface AddExamModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetSubject: SubjectBlock | null;
  onAddExam: (subjectId: string, exam: ExamPaper) => void;
  onOpenAdminHtmlModal?: (subject: SubjectBlock) => void;
}

const EXAM_TYPES: ExamType[] = [
  'สอบกลางภาค',
  'สอบปลายภาค',
  'สอบท้ายหน่วย/เก็บคะแนน',
  'สอบวัดผลระดับชาติ (NT/O-NET)',
  'สอบซ่อมเสริม',
];

export const AddExamModal: React.FC<AddExamModalProps> = ({
  isOpen,
  onClose,
  targetSubject,
  onAddExam,
  onOpenAdminHtmlModal,
}) => {
  const [title, setTitle] = useState('');
  const [examType, setExamType] = useState<ExamType>('สอบกลางภาค');
  const [fileType, setFileType] = useState<ExamFileType>('pdf');
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState('1.5 MB');
  const [linkUrl, setLinkUrl] = useState('');
  const [htmlCode, setHtmlCode] = useState('');
  const [hasAnswerKey, setHasAnswerKey] = useState(true);
  const [answerKeyName, setAnswerKeyName] = useState('');
  const [totalQuestions, setTotalQuestions] = useState<number>(30);
  const [maxScore, setMaxScore] = useState<number>(20);
  const [uploader, setUploader] = useState('');
  const [notes, setNotes] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Pre-fill teacher name and title suggestion when modal opens
  React.useEffect(() => {
    if (isOpen && targetSubject) {
      setTitle(`ข้อสอบ${examType} ${targetSubject.name} (${targetSubject.code})`);
      setUploader(targetSubject.teacher || 'คุณครูประจำวิชา');
      setFileName(`ข้อสอบ_${targetSubject.code}_${examType}.pdf`);
      setAnswerKeyName(`เฉลย_${targetSubject.code}_${examType}.pdf`);
      setErrorMessage('');
    }
  }, [isOpen, targetSubject, examType]);

  if (!isOpen || !targetSubject) return null;

  const handleSimulatedFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      // Format file size
      const sizeInMb = (file.size / (1024 * 1024)).toFixed(1);
      setFileSize(`${sizeInMb} MB`);
      if (file.name.endsWith('.docx') || file.name.endsWith('.doc')) {
        setFileType('docx');
      } else {
        setFileType('pdf');
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setErrorMessage('กรุณาระบุชื่อชุดข้อสอบ');
      return;
    }

    const finalHtml = fileType === 'html' 
      ? (htmlCode.trim() || getDefaultHtmlExam(targetSubject.name, targetSubject.code, targetSubject.gradeId))
      : undefined;

    const newExam: ExamPaper = {
      id: `ex_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      subjectId: targetSubject.id,
      gradeId: targetSubject.gradeId,
      title: title.trim(),
      examType,
      academicYear: targetSubject.academicYear || '2567',
      term: targetSubject.term || '1',
      totalQuestions: Number(totalQuestions) || undefined,
      maxScore: Number(maxScore) || undefined,
      fileType,
      fileUrl: fileType === 'link' || fileType === 'google_form' ? linkUrl.trim() || 'https://forms.google.com' : '#',
      fileName: fileType === 'html' 
        ? `${targetSubject.code}_ข้อสอบออนไลน์.html`
        : fileType === 'pdf' || fileType === 'docx' ? fileName.trim() || `ข้อสอบ_${targetSubject.code}.${fileType}` : undefined,
      fileSize: fileType === 'html' ? `${(finalHtml?.length ? (finalHtml.length / 1024).toFixed(1) : 4.5)} KB` : (fileType === 'pdf' || fileType === 'docx' ? fileSize : undefined),
      htmlContent: finalHtml,
      timeLimitMinutes: fileType === 'html' ? 60 : undefined,
      hasAnswerKey,
      answerKeyName: hasAnswerKey ? (fileType === 'html' ? 'ตรวจคะแนนอัตโนมัติในตัว' : answerKeyName.trim() || `เฉลย_${targetSubject.code}.${fileType}`) : undefined,
      answerKeyUrl: hasAnswerKey ? '#' : undefined,
      notes: notes.trim(),
      uploadedAt: new Date().toISOString().split('T')[0],
      uploader: uploader.trim() || targetSubject.teacher || 'คุณครูผู้สอน',
    };

    onAddExam(targetSubject.id, newExam);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
      id="add-exam-modal-backdrop"
    >
      <div 
        id="add-exam-modal"
        className="relative bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Modal Header */}
        <div className="bg-linear-to-r from-blue-800 to-indigo-800 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-700 text-amber-300 border border-blue-600">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">
                แนบไฟล์ / ลิงก์ข้อสอบ
              </h2>
              <p className="text-xs text-blue-200">
                เพิ่มข้อสอบเข้าสู่รายวิชา: {targetSubject.name} ({targetSubject.code})
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-blue-200 hover:text-white p-1 rounded-lg hover:bg-blue-700/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700 font-medium">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Exam Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              ชื่อชุดข้อสอบ / เอกสารวัดผล <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="เช่น ข้อสอบกลางภาค ภาคเรียนที่ 1/2567"
              className="w-full text-sm bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
          </div>

          {/* Exam Type & File Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ประเภทการวัดผล
              </label>
              <select
                value={examType}
                onChange={(e) => setExamType(e.target.value as ExamType)}
                className="w-full text-sm bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {EXAM_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                รูปแบบของไฟล์ / แหล่งที่มา
              </label>
              <select
                value={fileType}
                onChange={(e) => setFileType(e.target.value as ExamFileType)}
                className="w-full text-sm bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              >
                <option value="html">ข้อสอบออนไลน์ HTML (Admin / ตรวจคะแนนอัตโนมัติ)</option>
                <option value="pdf">เอกสาร PDF (.pdf)</option>
                <option value="docx">เอกสาร Word (.docx)</option>
                <option value="google_form">แบบทดสอบ Google Forms</option>
                <option value="link">ลิงก์ภายนอก / Google Drive</option>
              </select>
            </div>
          </div>

          {/* File Upload Box, HTML Code Box, or Link URL Box */}
          {fileType === 'html' ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-violet-900">
                  บล็อครับค่าข้อสอบ HTML (Admin)
                </label>
                {onOpenAdminHtmlModal && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenAdminHtmlModal(targetSubject);
                    }}
                    className="text-[11px] text-violet-700 hover:text-violet-900 bg-violet-100 hover:bg-violet-200 px-2.5 py-1 rounded-md font-semibold inline-flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    <span>เปิดโหมด Admin HTML แบบเต็มจอ</span>
                  </button>
                )}
              </div>

              <div className="border border-violet-200 rounded-xl p-3 bg-violet-50/50 space-y-2">
                <p className="text-xs text-slate-600">
                  วางโค้ดข้อสอบ HTML ที่นี่ (ระบบจะใส่ชุดข้อสอบมาตรฐานให้อัตโนมัติหากเว้นว่างไว้)
                </p>
                <textarea
                  value={htmlCode}
                  onChange={(e) => setHtmlCode(e.target.value)}
                  placeholder="<!DOCTYPE html>&#10;<html>&#10;<body>...วางโค้ดข้อสอบ HTML...</body>&#10;</html>"
                  rows={4}
                  className="w-full font-mono text-xs p-2.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-violet-700 font-medium">
                    {htmlCode ? `ขนาดโค้ด: ${(htmlCode.length / 1024).toFixed(1)} KB` : 'พร้อมใช้เทมเพลตมาตรฐาน'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setHtmlCode(getDefaultHtmlExam(targetSubject.name, targetSubject.code, targetSubject.gradeId))}
                    className="text-violet-700 hover:underline font-semibold"
                  >
                    ใส่โค้ดตัวอย่างทดสอบ
                  </button>
                </div>
              </div>
            </div>
          ) : fileType === 'pdf' || fileType === 'docx' ? (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                เลือกไฟล์ข้อสอบ ({fileType.toUpperCase()})
              </label>
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-3 text-center bg-slate-50 hover:bg-slate-100/70 transition-colors">
                <input
                  type="file"
                  id="exam-file-input"
                  accept={fileType === 'pdf' ? '.pdf' : '.docx,.doc'}
                  onChange={handleSimulatedFileUpload}
                  className="hidden"
                />
                <label
                  htmlFor="exam-file-input"
                  className="cursor-pointer flex flex-col items-center justify-center gap-1.5"
                >
                  <FileText className="w-7 h-7 text-blue-500" />
                  <span className="text-xs font-medium text-blue-700 hover:underline">
                    คลิกเพื่อเลือกไฟล์ หรือ ลากวางไฟล์ที่นี่
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {fileName || `ตัวอย่าง: ข้อสอบ_${targetSubject.code}.${fileType}`} ({fileSize})
                  </span>
                </label>
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                URL ลิงก์ข้อสอบออนไลน์ <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder={
                    fileType === 'google_form'
                      ? 'https://forms.gle/...'
                      : 'https://drive.google.com/...'
                  }
                  className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {/* Questions & Score */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                จำนวนข้อสอบ (ข้อ)
              </label>
              <input
                type="number"
                min="1"
                value={totalQuestions}
                onChange={(e) => setTotalQuestions(parseInt(e.target.value) || 0)}
                className="w-full text-sm bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                คะแนนเต็ม (คะแนน)
              </label>
              <input
                type="number"
                min="1"
                value={maxScore}
                onChange={(e) => setMaxScore(parseInt(e.target.value) || 0)}
                className="w-full text-sm bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Answer Key Option */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={hasAnswerKey}
                onChange={(e) => setHasAnswerKey(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded-sm border-slate-300 focus:ring-blue-500"
              />
              <span className="text-xs font-semibold text-slate-800 flex items-center gap-1">
                <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
                มีไฟล์เฉลย / คู่มือการตรวจ
              </span>
            </label>

            {hasAnswerKey && (
              <div className="mt-2.5 pt-2 border-t border-slate-200">
                <input
                  type="text"
                  value={answerKeyName}
                  onChange={(e) => setAnswerKeyName(e.target.value)}
                  placeholder="ชื่อไฟล์เฉลย เช่น เฉลย_ข้อสอบกลางภาค.pdf"
                  className="w-full text-xs bg-white border border-slate-300 rounded-md px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            )}
          </div>

          {/* Uploader & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ครูผู้ออกข้อสอบ / ผู้บันทึก
              </label>
              <input
                type="text"
                value={uploader}
                onChange={(e) => setUploader(e.target.value)}
                placeholder="ชื่อครูผู้ออกข้อสอบ"
                className="w-full text-sm bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                หมายเหตุเพิ่มเติม
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="เช่น ข้อสอบฉบับปรับปรุง มีข้อเขียน 2 ข้อ"
                className="w-full text-sm bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              id="btn-submit-new-exam"
              className="px-5 py-2 text-sm font-semibold bg-blue-700 hover:bg-blue-800 text-white rounded-lg shadow-sm transition-all inline-flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <CheckSquare className="w-4 h-4" />
              <span>บันทึกข้อสอบ</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
