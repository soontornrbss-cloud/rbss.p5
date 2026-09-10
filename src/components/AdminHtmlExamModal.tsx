import React, { useState, useEffect } from 'react';
import { ExamPaper, ExamType, SubjectBlock } from '../types';
import { HTML_EXAM_TEMPLATES, getDefaultHtmlExam } from '../data/htmlExamTemplates';
import { 
  X, 
  Code2, 
  Eye, 
  Upload, 
  Copy, 
  Check, 
  FileCode2, 
  Sparkles, 
  Clock, 
  CheckSquare, 
  AlertCircle, 
  Monitor, 
  Smartphone,
  ShieldAlert,
  GraduationCap
} from 'lucide-react';

interface AdminHtmlExamModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetSubject: SubjectBlock | null;
  initialExam?: ExamPaper | null; // If provided, we are editing an existing HTML exam
  onSaveExam: (subjectId: string, exam: ExamPaper) => void;
}

const EXAM_TYPES: ExamType[] = [
  'สอบกลางภาค',
  'สอบปลายภาค',
  'สอบท้ายหน่วย/เก็บคะแนน',
  'สอบวัดผลระดับชาติ (NT/O-NET)',
  'สอบซ่อมเสริม',
];

export const AdminHtmlExamModal: React.FC<AdminHtmlExamModalProps> = ({
  isOpen,
  onClose,
  targetSubject,
  initialExam,
  onSaveExam,
}) => {
  // Form fields
  const [title, setTitle] = useState('');
  const [examType, setExamType] = useState<ExamType>('สอบกลางภาค');
  const [htmlContent, setHtmlContent] = useState('');
  const [timeLimitMinutes, setTimeLimitMinutes] = useState<number>(45);
  const [totalQuestions, setTotalQuestions] = useState<number>(10);
  const [maxScore, setMaxScore] = useState<number>(10);
  const [passScore, setPassScore] = useState<number>(6);
  const [hasAnswerKey, setHasAnswerKey] = useState(true);
  const [uploader, setUploader] = useState('ผู้ดูแลระบบวิชาการ (Admin)');
  const [instructions, setInstructions] = useState('ให้นักเรียนทำข้อสอบตามเวลาที่กำหนด');
  const [notes, setNotes] = useState('ข้อสอบออนไลน์ในรูปแบบ HTML บันทึกโดย Admin');

  // UI view tabs
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [copied, setCopied] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Prepopulate when modal opens
  useEffect(() => {
    if (isOpen && targetSubject) {
      if (initialExam) {
        // Editing existing exam
        setTitle(initialExam.title);
        setExamType(initialExam.examType);
        setHtmlContent(initialExam.htmlContent || getDefaultHtmlExam(targetSubject.name, targetSubject.code, initialExam.title));
        setTimeLimitMinutes(initialExam.timeLimitMinutes || 45);
        setTotalQuestions(initialExam.totalQuestions || 10);
        setMaxScore(initialExam.maxScore || 10);
        setPassScore(initialExam.passScore || 6);
        setHasAnswerKey(initialExam.hasAnswerKey);
        setUploader(initialExam.uploader || 'ผู้ดูแลระบบวิชาการ (Admin)');
        setInstructions(initialExam.instructions || '');
        setNotes(initialExam.notes || '');
      } else {
        // Creating new HTML exam
        const defaultTitle = `ข้อสอบออนไลน์ (${examType}) วิชา${targetSubject.name} (${targetSubject.code})`;
        setTitle(defaultTitle);
        setHtmlContent(getDefaultHtmlExam(targetSubject.name, targetSubject.code, defaultTitle));
        setTimeLimitMinutes(45);
        setTotalQuestions(10);
        setMaxScore(10);
        setPassScore(6);
        setHasAnswerKey(true);
        setUploader(targetSubject.teacher ? `Admin / ${targetSubject.teacher}` : 'ผู้ดูแลระบบวิชาการ (Admin)');
        setInstructions('ให้นักเรียนทำข้อสอบและกดส่งคำตอบเมื่อเสร็จสิ้น');
        setNotes('นำเข้าข้อสอบในรูปแบบโค้ด HTML โดยผู้ดูแลระบบ');
      }
      setErrorMessage('');
      setActiveTab('editor');
    }
  }, [isOpen, targetSubject, initialExam]);

  if (!isOpen || !targetSubject) return null;

  // Handle uploading .html file
  const handleHtmlFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.html') && !file.name.endsWith('.htm')) {
      setErrorMessage('กรุณาเลือกไฟล์เอกสาร HTML ที่มีนามสกุล .html หรือ .htm');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setHtmlContent(content);
        setErrorMessage('');
      }
    };
    reader.onerror = () => {
      setErrorMessage('ไม่สามารถอ่านไฟล์ HTML ได้ กรุณาลองใหม่อีกครั้ง');
    };
    reader.readAsText(file);
  };

  // Load a preset template
  const handleSelectTemplate = (templateId: string) => {
    const template = HTML_EXAM_TEMPLATES.find((t) => t.id === templateId);
    if (template) {
      setHtmlContent(template.getHtml(targetSubject.name, targetSubject.code, title || 'แบบทดสอบออนไลน์'));
    }
  };

  // Copy code
  const handleCopyCode = () => {
    navigator.clipboard.writeText(htmlContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Form submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setErrorMessage('กรุณาระบุชื่อชุดข้อสอบออนไลน์');
      return;
    }

    if (!htmlContent.trim()) {
      setErrorMessage('กรุณาใส่เนื้อหาโค้ด HTML ของข้อสอบ');
      return;
    }

    const examId = initialExam ? initialExam.id : `ex_html_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    
    // Approximate size of HTML code
    const sizeInKb = (new Blob([htmlContent]).size / 1024).toFixed(1);

    const updatedExam: ExamPaper = {
      id: examId,
      subjectId: targetSubject.id,
      gradeId: targetSubject.gradeId,
      title: title.trim(),
      examType,
      academicYear: targetSubject.academicYear || '2567',
      term: targetSubject.term || '1',
      totalQuestions: Number(totalQuestions) || undefined,
      maxScore: Number(maxScore) || undefined,
      passScore: Number(passScore) || undefined,
      timeLimitMinutes: Number(timeLimitMinutes) || 0,
      fileType: 'html',
      htmlContent: htmlContent.trim(),
      fileName: `${targetSubject.code}_${examType}.html`,
      fileSize: `${sizeInKb} KB`,
      hasAnswerKey,
      answerKeyName: hasAnswerKey ? 'เฉลยในตัวโค้ด HTML / ตรวจคะแนนอัตโนมัติ' : undefined,
      instructions: instructions.trim(),
      notes: notes.trim(),
      uploadedAt: initialExam?.uploadedAt || new Date().toISOString().split('T')[0],
      uploader: uploader.trim() || 'ผู้ดูแลระบบวิชาการ (Admin)',
    };

    onSaveExam(targetSubject.id, updatedExam);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4"
      id="admin-html-exam-modal-backdrop"
    >
      <div 
        id="admin-html-exam-modal"
        className="relative bg-white rounded-2xl max-w-5xl w-full shadow-2xl border border-slate-300 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Top Header */}
        <div className="bg-linear-to-r from-violet-900 via-indigo-900 to-slate-900 text-white px-5 py-3.5 flex items-center justify-between shrink-0 border-b border-indigo-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-violet-800 text-amber-300 border border-violet-700 shadow-xs">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-400 text-blue-950">
                  ADMIN BLOCK
                </span>
                <span className="text-xs text-violet-200">
                  บล็อครับค่าข้อสอบออนไลน์ในรูปแบบ HTML
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white leading-tight mt-0.5">
                {initialExam ? 'แก้ไขข้อสอบออนไลน์ HTML' : 'เพิ่มและรับค่าข้อสอบออนไลน์ HTML โดย Admin'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1 text-[11px] bg-white/10 px-2.5 py-1 rounded-lg text-violet-100 border border-white/10">
              <span>วิชา:</span>
              <span className="font-semibold text-white">{targetSubject.code} - {targetSubject.name}</span>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="text-violet-200 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          
          {/* Main Workspace: Top Config + Split Editor/Preview */}
          <div className="p-4 sm:p-5 flex-1 overflow-y-auto space-y-4">
            
            {/* Error Message */}
            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700 font-medium">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Basic Config Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              
              {/* Title */}
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ชื่อชุดข้อสอบออนไลน์ (HTML) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="เช่น ข้อสอบออนไลน์กลางภาค 1/2567 วิชาภาษาไทย ป.1"
                  className="w-full text-sm bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500 font-medium"
                />
              </div>

              {/* Exam Type */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ประเภทการวัดผล
                </label>
                <select
                  value={examType}
                  onChange={(e) => setExamType(e.target.value as ExamType)}
                  className="w-full text-sm bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500"
                >
                  {EXAM_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              {/* Time Limit, Questions, Scores */}
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-violet-600" />
                    <span>เวลาสอบ (นาที)</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={timeLimitMinutes}
                    onChange={(e) => setTimeLimitMinutes(parseInt(e.target.value) || 0)}
                    placeholder="เช่น 45 (0=ไม่จำกัด)"
                    className="w-full text-sm bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-slate-800 focus:ring-2 focus:ring-violet-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  จำนวนข้อสอบ (ข้อ)
                </label>
                <input
                  type="number"
                  min="1"
                  value={totalQuestions}
                  onChange={(e) => setTotalQuestions(parseInt(e.target.value) || 0)}
                  className="w-full text-sm bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-slate-800 focus:ring-2 focus:ring-violet-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    คะแนนเต็ม
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={maxScore}
                    onChange={(e) => setMaxScore(parseInt(e.target.value) || 0)}
                    className="w-full text-sm bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 focus:ring-2 focus:ring-violet-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    เกณฑ์ผ่าน
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={passScore}
                    onChange={(e) => setPassScore(parseInt(e.target.value) || 0)}
                    className="w-full text-sm bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 focus:ring-2 focus:ring-violet-500"
                  />
                </div>
              </div>

            </div>

            {/* HTML Input/Editor Controls Bar */}
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs bg-white">
              <div className="bg-slate-100 border-b border-slate-200 px-3 py-2 flex flex-wrap items-center justify-between gap-2">
                
                {/* Editor vs Preview Tabs */}
                <div className="flex items-center gap-1 bg-slate-200/80 p-0.5 rounded-lg text-xs font-medium">
                  <button
                    type="button"
                    onClick={() => setActiveTab('editor')}
                    className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-md transition-colors ${
                      activeTab === 'editor'
                        ? 'bg-white text-violet-800 shadow-2xs font-semibold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Code2 className="w-3.5 h-3.5" />
                    <span>แก้ไขโค้ด HTML ({htmlContent.length} ตัวอักษร)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('preview')}
                    className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-md transition-colors ${
                      activeTab === 'preview'
                        ? 'bg-white text-emerald-800 shadow-2xs font-semibold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>ดูตัวอย่างสด (Live Preview)</span>
                  </button>
                </div>

                {/* Templates & Upload Actions */}
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Select Template dropdown */}
                  <div className="flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          handleSelectTemplate(e.target.value);
                          e.target.value = '';
                        }
                      }}
                      defaultValue=""
                      className="text-xs bg-white border border-slate-300 rounded-md px-2 py-1 text-slate-700 hover:border-slate-400 focus:ring-1 focus:ring-violet-500"
                    >
                      <option value="" disabled>
                        ⚡ เลือกแม่แบบ HTML สำเร็จรูป...
                      </option>
                      {HTML_EXAM_TEMPLATES.map((tpl) => (
                        <option key={tpl.id} value={tpl.id}>
                          {tpl.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Upload .html file */}
                  <label className="inline-flex items-center gap-1 px-2.5 py-1 text-xs bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-md cursor-pointer transition-colors shadow-2xs">
                    <Upload className="w-3.5 h-3.5 text-blue-600" />
                    <span>นำเข้าไฟล์ .html</span>
                    <input
                      type="file"
                      accept=".html,.htm"
                      onChange={handleHtmlFileUpload}
                      className="hidden"
                    />
                  </label>

                  {/* Copy Code */}
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-md transition-colors shadow-2xs cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>คัดลอกแล้ว</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-500" />
                        <span>คัดลอกโค้ด</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Tab 1: Code Editor */}
              {activeTab === 'editor' && (
                <div className="relative">
                  <textarea
                    value={htmlContent}
                    onChange={(e) => setHtmlContent(e.target.value)}
                    placeholder="วางโค้ด HTML ของข้อสอบที่นี่ เช่น <html>... <form>... </form> </html>"
                    rows={15}
                    spellCheck={false}
                    className="w-full p-4 font-mono text-xs sm:text-sm bg-slate-900 text-emerald-300 border-none focus:outline-none resize-y selection:bg-violet-700 selection:text-white leading-relaxed"
                  />
                  <div className="bg-slate-950 text-slate-400 px-4 py-1.5 text-[11px] font-mono flex items-center justify-between border-t border-slate-800">
                    <span>ประเภท: Document HTML5 • รองรับ Inline CSS & JavaScript</span>
                    <span>ขนาดโค้ด: ~{(new Blob([htmlContent]).size / 1024).toFixed(1)} KB</span>
                  </div>
                </div>
              )}

              {/* Tab 2: Live Preview in Sandboxed Iframe */}
              {activeTab === 'preview' && (
                <div className="p-3 bg-slate-100 flex flex-col items-center">
                  
                  {/* Device toggle */}
                  <div className="flex items-center gap-2 mb-2 self-end">
                    <span className="text-[11px] text-slate-500 font-medium">มุมมองจำลอง:</span>
                    <button
                      type="button"
                      onClick={() => setPreviewDevice('desktop')}
                      className={`px-2 py-1 rounded text-xs inline-flex items-center gap-1 ${
                        previewDevice === 'desktop' ? 'bg-violet-700 text-white font-semibold' : 'bg-white text-slate-700 border border-slate-300'
                      }`}
                    >
                      <Monitor className="w-3 h-3" />
                      <span>คอมพิวเตอร์ (Desktop)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewDevice('mobile')}
                      className={`px-2 py-1 rounded text-xs inline-flex items-center gap-1 ${
                        previewDevice === 'mobile' ? 'bg-violet-700 text-white font-semibold' : 'bg-white text-slate-700 border border-slate-300'
                      }`}
                    >
                      <Smartphone className="w-3 h-3" />
                      <span>มือถือ (Mobile)</span>
                    </button>
                  </div>

                  {/* Sandboxed Iframe Container */}
                  <div 
                    className={`w-full transition-all duration-200 bg-white rounded-xl shadow-md border border-slate-300 overflow-hidden ${
                      previewDevice === 'mobile' ? 'max-w-md' : 'max-w-full'
                    }`}
                  >
                    <iframe
                      title="HTML Exam Live Preview"
                      srcDoc={htmlContent}
                      sandbox="allow-scripts allow-forms allow-modals"
                      className="w-full h-[460px] border-none bg-white"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Additional Admin Settings */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ผู้บันทึกข้อมูล / ครูผู้จัดทำข้อสอบ
                </label>
                <input
                  type="text"
                  value={uploader}
                  onChange={(e) => setUploader(e.target.value)}
                  placeholder="ชื่อผู้ดูแลระบบ หรือ ครูประจำวิชา"
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:ring-1 focus:ring-violet-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  คำชี้แจงสำหรับผู้เข้าสอบ
                </label>
                <input
                  type="text"
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="เช่น ข้อสอบมี 10 ข้อ เวลา 45 นาที ห้ามเปิดเอกสาร"
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:ring-1 focus:ring-violet-500"
                />
              </div>
            </div>

          </div>

          {/* Modal Footer Actions */}
          <div className="bg-slate-50 px-5 py-3.5 border-t border-slate-200 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <ShieldAlert className="w-4 h-4 text-violet-600" />
              <span>โหมด Admin: โค้ด HTML จะถูกบันทึกและพร้อมให้นักเรียนเข้าทำข้อสอบออนไลน์ได้ทันที</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                ยกเลิก
              </button>
              
              <button
                type="submit"
                id="btn-save-html-exam"
                className="px-5 py-2 text-xs font-bold bg-violet-700 hover:bg-violet-800 text-white rounded-lg shadow-sm transition-all inline-flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <CheckSquare className="w-4 h-4 text-amber-300" />
                <span>{initialExam ? 'บันทึกการแก้ไขข้อสอบ HTML' : 'บันทึกข้อสอบออนไลน์ HTML'}</span>
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
};
