import React, { useState, useEffect } from 'react';
import { 
  ExamPaper, 
  SubjectBlock, 
  AuthSession, 
  ExamSubmissionRecord, 
  StudentRecord 
} from '../types';
import { 
  X, 
  Clock, 
  Maximize2, 
  Minimize2, 
  Printer, 
  Code2, 
  School, 
  Sparkles,
  RotateCcw,
  Award,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  Send,
  User
} from 'lucide-react';

interface HtmlExamPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  exam: ExamPaper | null;
  subject: SubjectBlock | null;
  currentSession: AuthSession | null;
  onSubmitScore: (record: ExamSubmissionRecord) => Promise<void>;
  onOpenReport?: (student: StudentRecord) => void;
  onOpenEditHtml?: (exam: ExamPaper, subject: SubjectBlock) => void;
  onOpenLoginPrompt?: () => void;
}

// Helper to inject auto-fill and auto-score transmission bridge into the HTML exam
const getInjectedExamHtml = (
  rawHtml?: string,
  student?: StudentRecord | null,
  currentExam?: ExamPaper | null
) => {
  if (!rawHtml) return '';
  const studentName = student?.name || '';
  const studentRoom = student?.room || '';
  const studentCode = student?.studentCode || '';
  const maxScore = currentExam?.maxScore || 10;

  const bridgeScript = `
<script>
(function() {
  function fillStudentData() {
    try {
      if ('${studentName}') {
        const nameInputs = document.querySelectorAll('input#std-name, input[name="name"], input[placeholder*="ชื่อ"]');
        nameInputs.forEach(function(el) { if (!el.value) el.value = '${studentName}'; });
      }
      if ('${studentRoom}') {
        const roomInputs = document.querySelectorAll('input#std-room, input[name="room"], input[placeholder*="ห้อง"]');
        roomInputs.forEach(function(el) { if (!el.value) el.value = '${studentRoom}'; });
      }
      if ('${studentCode}') {
        const codeInputs = document.querySelectorAll('input#std-no, input#std-code, input[name="code"], input[name="studentCode"], input[placeholder*="เลขที่"]');
        codeInputs.forEach(function(el) { if (!el.value) el.value = '${studentCode}'; });
      }
    } catch(err) {}
  }

  function emitScore(score, max) {
    if (typeof score !== 'number' || isNaN(score)) return;
    try {
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({
          type: 'AUTO_SUBMIT_SCORE',
          score: score,
          maxScore: max || ${maxScore},
          studentName: '${studentName}'
        }, '*');
      }
    } catch(e) {}
  }

  function monitorScores() {
    try {
      var observer = new MutationObserver(function() {
        var scoreElem = document.getElementById('score-display') || 
                        document.getElementById('score') || 
                        document.querySelector('.score-display') || 
                        document.querySelector('.score');
        if (scoreElem && scoreElem.textContent) {
          var txt = scoreElem.textContent.trim();
          var match = txt.match(/(\\d+)\\s*(?:\\/|เต็ม|out of)?\\s*(\\d*)/);
          if (match && match[1]) {
            var sc = parseInt(match[1], 10);
            var mx = match[2] ? parseInt(match[2], 10) : ${maxScore};
            emitScore(sc, mx);
          }
        }
      });
      if (document.body) {
        observer.observe(document.body, { childList: true, subtree: true, characterData: true });
      }
    } catch(e) {}
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      fillStudentData();
      monitorScores();
    });
  } else {
    fillStudentData();
    monitorScores();
  }
})();
</script>
`;

  if (rawHtml.includes('</body>')) {
    return rawHtml.replace('</body>', `${bridgeScript}</body>`);
  } else if (rawHtml.includes('</html>')) {
    return rawHtml.replace('</html>', `${bridgeScript}</html>`);
  } else {
    return `${rawHtml}${bridgeScript}`;
  }
};

export const HtmlExamPlayerModal: React.FC<HtmlExamPlayerModalProps> = ({
  isOpen,
  onClose,
  exam,
  subject,
  currentSession,
  onSubmitScore,
  onOpenReport,
  onOpenEditHtml,
  onOpenLoginPrompt,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState<number | null>(null);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);

  // Score submission state
  const [isScoreDialogOpen, setIsScoreDialogOpen] = useState(false);
  const [inputScore, setInputScore] = useState<string>('');
  const [inputMaxScore, setInputMaxScore] = useState<string>('');
  const [submissionSuccess, setSubmissionSuccess] = useState<ExamSubmissionRecord | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize timer and defaults
  useEffect(() => {
    if (isOpen && exam) {
      if (exam.timeLimitMinutes && exam.timeLimitMinutes > 0) {
        setSecondsRemaining(exam.timeLimitMinutes * 60);
        setIsTimerRunning(true);
      } else {
        setSecondsRemaining(null);
        setIsTimerRunning(false);
      }
      setInputMaxScore(exam.maxScore ? String(exam.maxScore) : (exam.totalQuestions ? String(exam.totalQuestions) : '20'));
      setInputScore('');
      setSubmissionSuccess(null);
      setIsScoreDialogOpen(false);
    }
  }, [isOpen, exam]);

  // Auto-submit score to the system without requiring student to type anything
  const handleAutoScoreSubmit = async (numScore: number, numMax: number) => {
    if (!currentSession) {
      if (onOpenLoginPrompt) {
        onOpenLoginPrompt();
      }
      return;
    }

    const pct = numMax > 0 ? (numScore / numMax) * 100 : 0;
    const isPassed = pct >= 50;

    // Student profile info
    const studentInfo = currentSession.student || {
      id: 'admin-tester',
      studentCode: 'ADMIN-01',
      name: currentSession.adminName || 'ผู้ดูแลระบบ (ทดสอบระบบ)',
      level: subject?.gradeId.toUpperCase() || 'ป.1',
      room: '1',
      gradeId: subject?.gradeId || 'p1',
    };

    const record: ExamSubmissionRecord = {
      id: `score_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      studentCode: studentInfo.studentCode,
      studentName: studentInfo.name,
      level: studentInfo.level,
      room: studentInfo.room,
      gradeId: studentInfo.gradeId,
      subjectId: subject?.id || '',
      subjectCode: subject?.code || '',
      subjectName: subject?.name || '',
      examId: exam?.id || '',
      examTitle: exam?.title || '',
      score: numScore,
      maxScore: numMax,
      percentage: pct,
      isPassed,
      submittedAt: new Date().toISOString(),
    };

    setIsSubmitting(true);
    try {
      await onSubmitScore(record);
      setSubmissionSuccess(record);
      setIsScoreDialogOpen(true);
    } catch (err) {
      console.error('Auto submit score error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Listen to postMessage from the iframe in case the HTML quiz script transmits a score
  useEffect(() => {
    const handleWindowMessage = (event: MessageEvent) => {
      try {
        const data = event.data;
        if (!data) return;

        // Common score event patterns from HTML exams
        if (typeof data === 'object' && ('score' in data || 'totalScore' in data || 'result' in data)) {
          const rawScore = Number(data.score ?? data.totalScore ?? data.result);
          const rawMax = Number(data.maxScore ?? data.totalQuestions ?? exam?.maxScore ?? 10);
          if (!isNaN(rawScore)) {
            setInputScore(String(rawScore));
            if (!isNaN(rawMax) && rawMax > 0) {
              setInputMaxScore(String(rawMax));
            }
            // AUTOMATIC FLOW: directly submit without requiring manual keying
            handleAutoScoreSubmit(rawScore, isNaN(rawMax) || rawMax <= 0 ? (exam?.maxScore || 10) : rawMax);
          }
        }
      } catch (err) {
        // Ignore cross-origin issues safely
      }
    };

    window.addEventListener('message', handleWindowMessage);
    return () => {
      window.removeEventListener('message', handleWindowMessage);
    };
  }, [exam, subject, currentSession]);

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
      setSubmissionSuccess(null);
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

  // Submit test score handler
  const handleScoreSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSession) {
      if (onOpenLoginPrompt) {
        onOpenLoginPrompt();
      } else {
        alert('กรุณาเข้าสู่ระบบก่อนบันทึกคะแนนสอบ');
      }
      return;
    }

    const numScore = parseFloat(inputScore);
    const numMax = parseFloat(inputMaxScore) || (exam.maxScore || 20);

    if (isNaN(numScore) || numScore < 0) {
      alert('กรุณาระบุคะแนนที่ได้ให้ถูกต้อง');
      return;
    }

    if (numScore > numMax) {
      alert(`คะแนนที่ได้ (${numScore}) ไม่สามารถมากกว่าคะแนนเต็ม (${numMax})`);
      return;
    }

    const pct = numMax > 0 ? (numScore / numMax) * 100 : 0;
    const isPassed = pct >= 50;

    // Student profile info
    const studentInfo = currentSession.student || {
      id: 'admin-tester',
      studentCode: 'ADMIN-01',
      name: currentSession.adminName || 'ผู้ดูแลระบบ (ทดสอบระบบ)',
      level: subject.gradeId.toUpperCase(),
      room: '1',
      gradeId: subject.gradeId,
    };

    const record: ExamSubmissionRecord = {
      id: `score_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      studentCode: studentInfo.studentCode,
      studentName: studentInfo.name,
      level: studentInfo.level,
      room: studentInfo.room,
      gradeId: studentInfo.gradeId,
      subjectId: subject.id,
      subjectCode: subject.code,
      subjectName: subject.name,
      examId: exam.id,
      examTitle: exam.title,
      score: numScore,
      maxScore: numMax,
      percentage: pct,
      isPassed,
      submittedAt: new Date().toISOString(),
    };

    setIsSubmitting(true);
    try {
      await onSubmitScore(record);
      setSubmissionSuccess(record);
    } catch (err) {
      console.error('Submit score error:', err);
    } finally {
      setIsSubmitting(false);
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

          {/* Right: Actions */}
          <div className="flex items-center gap-1.5 shrink-0">
            
            {/* Submit Score Trigger */}
            <button
              type="button"
              id="btn-trigger-submit-score"
              onClick={() => setIsScoreDialogOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold shadow-md transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <Award className="w-4 h-4 text-slate-950" />
              <span>ส่งผลคะแนนสอบ</span>
            </button>

            {/* Restart button */}
            <button
              type="button"
              onClick={handleRestart}
              title="เริ่มทำข้อสอบใหม่"
              className="p-2 rounded-lg bg-blue-800/80 hover:bg-blue-700 text-blue-100 hover:text-white transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Admin Edit HTML (Only shown to Admin) */}
            {currentSession?.role === 'admin' && onOpenEditHtml && (
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

        {/* Informational Sub-header with Active User Info */}
        <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 flex flex-wrap items-center justify-between text-xs text-slate-700">
          <div className="flex items-center gap-3 flex-wrap">
            <span><strong>รายวิชา:</strong> {subject.name} ({subject.code})</span>
            <span><strong>คะแนนเต็ม:</strong> {exam.maxScore || 20} คะแนน</span>
            {currentSession && (
              <span className="inline-flex items-center gap-1 text-blue-800 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200 font-medium">
                <User className="w-3 h-3 text-blue-600" />
                {currentSession.role === 'admin' ? (
                  <span>ผู้ทดสอบ: <strong>{currentSession.adminName || 'Admin'}</strong></span>
                ) : (
                  <span>ผู้เข้าสอบ: <strong>{currentSession.student?.name}</strong> (#{currentSession.student?.studentCode})</span>
                )}
              </span>
            )}
          </div>

          {secondsRemaining !== null && (
            <div className="md:hidden flex items-center gap-1.5 font-mono font-bold text-amber-600">
              <Clock className="w-3.5 h-3.5" />
              <span>{formatTime(secondsRemaining)}</span>
            </div>
          )}
        </div>

        {/* Main Sandboxed HTML Exam Renderer */}
        <div className="flex-1 w-full bg-slate-100 overflow-hidden relative">
          <iframe
            key={iframeKey}
            id="html-exam-frame"
            title={exam.title}
            srcDoc={getInjectedExamHtml(exam.htmlContent, currentSession?.student, exam)}
            sandbox="allow-scripts allow-forms allow-modals allow-same-origin"
            className="w-full h-full border-none bg-white"
          />
        </div>

        {/* Floating / Pop-up Score Submission Dialog */}
        {isScoreDialogOpen && (
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-40">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
              
              {!submissionSuccess ? (
                <form onSubmit={handleScoreSubmit} className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                        <Award className="w-5 h-5 text-amber-500" />
                        <span>บันทึกและส่งผลคะแนนสอบ</span>
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        คะแนนจะถูกบันทึกลงระบบ Cloud และจัดทำใบรายงานผลมาตรฐาน
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsScoreDialogOpen(false)}
                      className="text-slate-400 hover:text-slate-600 p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Student Identity Verification */}
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs">
                    {currentSession ? (
                      <div>
                        <span className="text-slate-500 block text-[11px]">ผู้บันทึกคะแนน:</span>
                        <p className="font-bold text-blue-950 text-sm">
                          {currentSession.role === 'admin' 
                            ? currentSession.adminName || 'Admin' 
                            : `${currentSession.student?.name} (#${currentSession.student?.studentCode})`}
                        </p>
                        <p className="text-blue-800 text-[11px] mt-0.5">
                          {currentSession.role === 'admin' ? 'โหมดผู้ดูแลระบบ' : `${currentSession.student?.level} ห้อง ${currentSession.student?.room}`}
                        </p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-rose-700 font-semibold">ยังไม่ได้เข้าสู่ระบบ</p>
                        <button
                          type="button"
                          onClick={onOpenLoginPrompt}
                          className="mt-1 text-blue-700 underline font-bold"
                        >
                          คลิกที่นี่เพื่อเข้าสู่ระบบก่อนส่งคะแนน
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Score Inputs */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        คะแนนที่ได้ (Score)
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        required
                        value={inputScore}
                        onChange={(e) => setInputScore(e.target.value)}
                        placeholder="เช่น 18"
                        className="w-full px-3 py-2 text-base font-bold font-mono text-blue-900 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        คะแนนเต็ม (Max)
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        min="1"
                        required
                        value={inputMaxScore}
                        onChange={(e) => setInputMaxScore(e.target.value)}
                        placeholder="เช่น 20"
                        className="w-full px-3 py-2 text-base font-bold font-mono text-slate-700 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                      />
                    </div>
                  </div>

                  {/* Percentage Preview */}
                  {inputScore && inputMaxScore && Number(inputMaxScore) > 0 && (
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center text-xs">
                      <span>คิดเป็น: </span>
                      <strong className="text-sm font-mono text-blue-900">
                        {((Number(inputScore) / Number(inputMaxScore)) * 100).toFixed(1)}%
                      </strong>
                      <span className="ml-2 font-bold">
                        {(Number(inputScore) / Number(inputMaxScore)) >= 0.5 ? (
                          <span className="text-emerald-600">(ผ่านเกณฑ์)</span>
                        ) : (
                          <span className="text-rose-600">(ไม่ผ่านเกณฑ์)</span>
                        )}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsScoreDialogOpen(false)}
                      className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
                    >
                      ยกเลิก
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting || !inputScore}
                      id="btn-confirm-score-submit"
                      className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-300 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{isSubmitting ? 'กำลังบันทึก...' : 'ยืนยันบันทึกคะแนน'}</span>
                    </button>
                  </div>
                </form>
              ) : (
                <div className="text-center space-y-3.5 py-2">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      เชื่อมโยงผลคะแนนสอบเข้าสู่รายงานอัตโนมัติแล้ว!
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      คะแนน <strong className="text-blue-900 font-mono text-sm">{submissionSuccess.score} / {submissionSuccess.maxScore}</strong> ({submissionSuccess.percentage.toFixed(1)}%) 
                      ถูกส่งเข้าสู่ระบบรายงานผลของนักเรียนทันที
                    </p>
                  </div>

                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 font-semibold flex items-center justify-center gap-2">
                    <Award className="w-4 h-4 text-emerald-600" />
                    <span>ผลการประเมิน: {submissionSuccess.isPassed ? 'ผ่านเกณฑ์มาตรฐาน ✓' : 'ต้องปรับปรุง / ไม่ผ่านเกณฑ์ ✗'}</span>
                  </div>

                  <div className="flex flex-col gap-2 pt-2">
                    {currentSession?.student && onOpenReport && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsScoreDialogOpen(false);
                          onClose();
                          onOpenReport(currentSession.student!);
                        }}
                        className="w-full py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md transition-colors cursor-pointer"
                      >
                        <Award className="w-4 h-4 text-amber-300" />
                        <span>เปิดดูใบรายงานผลคะแนนมาตรฐานของฉัน</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setIsScoreDialogOpen(false);
                        onClose();
                      }}
                      className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition-colors cursor-pointer"
                    >
                      เสร็จสิ้น / ปิดหน้าต่างข้อสอบ
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

      </div>
    </div>
  );
};
