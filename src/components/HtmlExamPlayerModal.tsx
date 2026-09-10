import React, { useState, useEffect } from 'react';
import { ExamPaper, SubjectBlock } from '../types';
import { 
  X, 
  Clock, 
  Maximize2, 
  Minimize2, 
  Printer, 
  Code2, 
  School, 
  Sparkles,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';

interface HtmlExamPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  exam: ExamPaper | null;
  subject: SubjectBlock | null;
  onOpenEditHtml?: (exam: ExamPaper, subject: SubjectBlock) => void;
}

export const HtmlExamPlayerModal: React.FC<HtmlExamPlayerModalProps> = ({
  isOpen,
  onClose,
  exam,
  subject,
  onOpenEditHtml,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState<number | null>(null);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);

  // Initialize timer
  useEffect(() => {
    if (isOpen && exam) {
      if (exam.timeLimitMinutes && exam.timeLimitMinutes > 0) {
        setSecondsRemaining(exam.timeLimitMinutes * 60);
        setIsTimerRunning(true);
      } else {
        setSecondsRemaining(null);
        setIsTimerRunning(false);
      }
    }
  }, [isOpen, exam]);

  // Timer countdown
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning && secondsRemaining !== null && secondsRemaining > 0) {
      interval = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev === null || prev <= 1) {
            clearInterval(interval!);
            setIsTimerRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, secondsRemaining]);

  if (!isOpen || !exam || !subject) return null;

  // Format MM:SS
  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const handleRestart = () => {
    if (window.confirm('คุณต้องการรีเซ็ตแบบทดสอบและเริ่มทำใหม่ใช่หรือไม่?')) {
      setIframeKey((prev) => prev + 1);
      if (exam.timeLimitMinutes && exam.timeLimitMinutes > 0) {
        setSecondsRemaining(exam.timeLimitMinutes * 60);
        setIsTimerRunning(true);
      }
    }
  };

  const handlePrint = () => {
    const iframe = document.getElementById('html-exam-frame') as HTMLIFrameElement;
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.print();
    } else {
      window.print();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 overflow-hidden bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-0 sm:p-3"
      id="html-exam-player-modal-backdrop"
    >
      <div 
        id="html-exam-player-modal"
        className={`relative bg-white flex flex-col transition-all duration-200 shadow-2xl ${
          isFullscreen 
            ? 'w-screen h-screen rounded-none' 
            : 'max-w-6xl w-full h-[95vh] rounded-2xl border border-slate-300 overflow-hidden'
        }`}
      >
        {/* Top Control Header */}
        <header className="bg-linear-to-r from-blue-900 via-indigo-900 to-violet-950 text-white px-4 sm:px-6 py-3 flex items-center justify-between shrink-0 shadow-md">
          
          {/* Left: Branding & Exam Info */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-blue-950 flex flex-col items-center justify-center font-bold text-xs shrink-0 shadow-xs">
              <School className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-semibold tracking-wider px-2 py-0.5 rounded-full bg-blue-800 text-amber-300 border border-blue-700">
                  ระบบทำข้อสอบออนไลน์ (HTML)
                </span>
                <span className="text-xs text-blue-200 truncate hidden sm:inline">
                  โรงเรียนราษฎร์บำรุงศิลป์
                </span>
              </div>
              <h1 className="text-sm sm:text-base font-bold text-white truncate mt-0.5">
                {exam.title}
              </h1>
            </div>
          </div>

          {/* Center: Active Timer */}
          {secondsRemaining !== null && (
            <div className="hidden md:flex items-center gap-2 bg-slate-950/70 border border-amber-400/40 px-3.5 py-1.5 rounded-full shadow-inner">
              <Clock className={`w-4 h-4 ${secondsRemaining < 300 ? 'text-red-400 animate-pulse' : 'text-amber-400'}`} />
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-300 uppercase tracking-wider font-semibold">
                  เวลาที่เหลือ
                </span>
                <span className={`text-base font-mono font-bold leading-none ${secondsRemaining < 300 ? 'text-red-400 animate-pulse' : 'text-amber-300'}`}>
                  {formatTime(secondsRemaining)}
                </span>
              </div>
            </div>
          )}

          {/* Right: Actions (Restart, Edit HTML for Admin, Print, Fullscreen, Close) */}
          <div className="flex items-center gap-1.5 shrink-0">
            
            {/* Restart button */}
            <button
              type="button"
              onClick={handleRestart}
              title="เริ่มทำข้อสอบใหม่"
              className="p-2 rounded-lg bg-blue-800/80 hover:bg-blue-700 text-blue-100 hover:text-white transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Admin Edit HTML */}
            {onOpenEditHtml && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenEditHtml(exam, subject);
                }}
                className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-violet-700 hover:bg-violet-600 text-white text-xs font-semibold shadow-xs transition-colors"
              >
                <Code2 className="w-3.5 h-3.5 text-amber-300" />
                <span>แก้ไขโค้ด (Admin)</span>
              </button>
            )}

            {/* Print */}
            <button
              type="button"
              onClick={handlePrint}
              title="พิมพ์แบบทดสอบ"
              className="p-2 rounded-lg bg-blue-800/80 hover:bg-blue-700 text-blue-100 hover:text-white transition-colors"
            >
              <Printer className="w-4 h-4" />
            </button>

            {/* Fullscreen Toggle */}
            <button
              type="button"
              onClick={() => setIsFullscreen(!isFullscreen)}
              title={isFullscreen ? 'ย่อหน้าจอ' : 'เต็มหน้าจอ'}
              className="p-2 rounded-lg bg-blue-800/80 hover:bg-blue-700 text-blue-100 hover:text-white transition-colors"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Close */}
            <button
              type="button"
              onClick={onClose}
              title="ปิดหน้าต่างข้อสอบ"
              className="p-2 rounded-lg bg-red-600/80 hover:bg-red-600 text-white transition-colors ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

        </header>

        {/* Informational Sub-header */}
        <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 flex flex-wrap items-center justify-between text-xs text-slate-600">
          <div className="flex items-center gap-3">
            <span><strong>รายวิชา:</strong> {subject.name} ({subject.code})</span>
            <span><strong>ระดับชั้น:</strong> {subject.gradeId.toUpperCase()}</span>
            <span><strong>คะแนนเต็ม:</strong> {exam.maxScore ? `${exam.maxScore} คะแนน` : '-'}</span>
          </div>

          {secondsRemaining !== null && (
            <div className="md:hidden flex items-center gap-1.5 font-mono font-bold text-amber-600">
              <Clock className="w-3.5 h-3.5" />
              <span>{formatTime(secondsRemaining)}</span>
            </div>
          )}

          <div className="text-[11px] text-slate-500">
            {exam.instructions || 'ให้นักเรียนอ่านคำถามให้ละเอียดก่อนตอบคำถาม'}
          </div>
        </div>

        {/* Main Sandboxed HTML Exam Renderer */}
        <div className="flex-1 w-full bg-slate-100 overflow-hidden relative">
          <iframe
            key={iframeKey}
            id="html-exam-frame"
            title={exam.title}
            srcDoc={exam.htmlContent}
            sandbox="allow-scripts allow-forms allow-modals allow-same-origin"
            className="w-full h-full border-none bg-white"
          />
        </div>

      </div>
    </div>
  );
};
