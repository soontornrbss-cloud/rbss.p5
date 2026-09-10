import React from 'react';
import { GradeConfig, SubjectBlock } from '../types';
import { X, Printer, FileText, School, Download } from 'lucide-react';

interface ReportSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  grades: GradeConfig[];
  subjects: SubjectBlock[];
  activeGrade: GradeConfig;
}

export const ReportSummaryModal: React.FC<ReportSummaryModalProps> = ({
  isOpen,
  onClose,
  grades,
  subjects,
  activeGrade,
}) => {
  const [filterGrade, setFilterGrade] = React.useState<string>(activeGrade.id);

  if (!isOpen) return null;

  const filteredSubjects = filterGrade === 'all' 
    ? subjects 
    : subjects.filter(s => s.gradeId === filterGrade);

  const totalExams = filteredSubjects.reduce((acc, curr) => acc + curr.exams.length, 0);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
      id="report-summary-modal-backdrop"
    >
      <div 
        id="report-summary-modal"
        className="relative bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-slate-800 text-amber-300">
              <School className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">
                รายงานสรุปคลังข้อสอบ โรงเรียนราษฎร์บำรุงศิลป์
              </h2>
              <p className="text-xs text-slate-300">
                ตารางแสดงสรุปรายวิชาและฉบับข้อสอบทั้งหมดในระบบ
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-600">เลือกระดับชั้น:</span>
            <select
              value={filterGrade}
              onChange={(e) => setFilterGrade(e.target.value)}
              className="text-xs bg-white border border-slate-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">ทุกระดับชั้น (ป.1 - ม.3)</option>
              {grades.map(g => (
                <option key={g.id} value={g.id}>{g.fullName}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">
              รวม <strong>{filteredSubjects.length}</strong> วิชา / <strong>{totalExams}</strong> ฉบับข้อสอบ
            </span>
            <button
              type="button"
              onClick={handlePrint}
              className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>พิมพ์รายงาน</span>
            </button>
          </div>
        </div>

        {/* Report Content Table */}
        <div className="p-6 overflow-y-auto flex-1">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-300 bg-slate-100 text-slate-700 font-semibold">
                <th className="p-2.5">ระดับชั้น</th>
                <th className="p-2.5">รหัสวิชา</th>
                <th className="p-2.5">ชื่อรายวิชา</th>
                <th className="p-2.5">กลุ่มสาระฯ</th>
                <th className="p-2.5">ครูผู้สอน</th>
                <th className="p-2.5 text-center">จำนวนข้อสอบ</th>
                <th className="p-2.5">รายการข้อสอบในระบบ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredSubjects.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-slate-400">
                    ไม่พบข้อมูลรายวิชาในเงื่อนไขที่เลือก
                  </td>
                </tr>
              ) : (
                filteredSubjects.map((sub) => {
                  const gradeObj = grades.find(g => g.id === sub.gradeId);
                  return (
                    <tr key={sub.id} className="hover:bg-slate-50">
                      <td className="p-2.5 font-semibold text-slate-800">
                        {gradeObj?.shortName || sub.gradeId}
                      </td>
                      <td className="p-2.5 font-mono text-slate-600 font-bold">
                        {sub.code}
                      </td>
                      <td className="p-2.5 font-semibold text-slate-900">
                        {sub.name}
                      </td>
                      <td className="p-2.5 text-slate-600">
                        {sub.learningArea}
                      </td>
                      <td className="p-2.5 text-slate-600">
                        {sub.teacher}
                      </td>
                      <td className="p-2.5 text-center font-bold text-blue-700">
                        {sub.exams.length}
                      </td>
                      <td className="p-2.5 text-slate-500">
                        {sub.exams.length > 0 ? (
                          <ul className="list-disc list-inside space-y-0.5">
                            {sub.exams.map(ex => (
                              <li key={ex.id} className="truncate max-w-xs" title={ex.title}>
                                {ex.title} ({ex.examType})
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <span className="text-slate-400 italic">- ยังไม่มีข้อสอบ -</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold cursor-pointer"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};
