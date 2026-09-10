import React, { useState } from 'react';
import { GradeConfig, GradeId, LearningArea, SubjectBlock } from '../types';
import { X, PlusCircle, BookPlus, AlertCircle } from 'lucide-react';

interface AddSubjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeGrade: GradeConfig;
  allGrades: GradeConfig[];
  onAddSubject: (newSubject: SubjectBlock) => void;
}

const LEARNING_AREAS: LearningArea[] = [
  'ภาษาไทย',
  'คณิตศาสตร์',
  'วิทยาศาสตร์และเทคโนโลยี',
  'ภาษาต่างประเทศ',
  'สังคมศึกษา ศาสนา และวัฒนธรรม',
  'สุขศึกษาและพลศึกษา',
  'ศิลปะ',
  'การงานอาชีพ',
  'วิชาเพิ่มเติม/อื่นๆ',
];

export const AddSubjectModal: React.FC<AddSubjectModalProps> = ({
  isOpen,
  onClose,
  activeGrade,
  allGrades,
  onAddSubject,
}) => {
  const [selectedGradeId, setSelectedGradeId] = useState<GradeId>(activeGrade.id);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [learningArea, setLearningArea] = useState<LearningArea>('ภาษาไทย');
  const [teacher, setTeacher] = useState('');
  const [term, setTerm] = useState<'1' | '2' | 'ทั้งปี'>('1');
  const [academicYear, setAcademicYear] = useState('2567');
  const [periodsPerWeek, setPeriodsPerWeek] = useState<number>(3);
  const [description, setDescription] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Sync selectedGradeId when activeGrade changes
  React.useEffect(() => {
    if (isOpen) {
      setSelectedGradeId(activeGrade.id);
      setErrorMessage('');
    }
  }, [isOpen, activeGrade.id]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setErrorMessage('กรุณาระบุชื่อวิชา');
      return;
    }

    const newSubject: SubjectBlock = {
      id: `sub_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      gradeId: selectedGradeId,
      code: code.trim() || 'รหัสวิชา',
      name: name.trim(),
      learningArea,
      teacher: teacher.trim() || 'คุณครูผู้สอน',
      term,
      academicYear,
      periodsPerWeek: Number(periodsPerWeek) || 2,
      description: description.trim(),
      exams: [],
      createdAt: new Date().toISOString().split('T')[0],
    };

    onAddSubject(newSubject);
    
    // Reset form
    setName('');
    setCode('');
    setTeacher('');
    setDescription('');
    setErrorMessage('');
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
      id="add-subject-modal-backdrop"
    >
      <div 
        id="add-subject-modal"
        className="relative bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Modal Header */}
        <div className="bg-linear-to-r from-blue-900 to-indigo-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-800 text-amber-300 border border-blue-700">
              <BookPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">
                เพิ่มรายวิชาใหม่ (+)
              </h2>
              <p className="text-xs text-blue-200">
                สร้างบล็อกรายวิชาเข้าสู่ระบบคลังข้อสอบแบบ Dynamic
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-blue-200 hover:text-white p-1 rounded-lg hover:bg-blue-800/80 transition-colors"
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

          {/* Target Grade Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              ระดับชั้นที่ต้องการเพิ่มวิชา <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedGradeId}
              onChange={(e) => setSelectedGradeId(e.target.value as GradeId)}
              className="w-full text-sm bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            >
              {allGrades.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.fullName} ({g.levelLabel})
                </option>
              ))}
            </select>
          </div>

          {/* Subject Name and Code */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ชื่อรายวิชา <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="เช่น ภาษาไทย 1 หรือ คณิตศาสตร์เพิ่มเติม"
                className="w-full text-sm bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                รหัสวิชา
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="เช่น ท11101"
                className="w-full text-sm font-mono bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
            </div>
          </div>

          {/* Learning Area & Teacher */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                กลุ่มสาระการเรียนรู้ <span className="text-red-500">*</span>
              </label>
              <select
                value={learningArea}
                onChange={(e) => setLearningArea(e.target.value as LearningArea)}
                className="w-full text-sm bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              >
                {LEARNING_AREAS.map((area) => (
                  <option key={area} value={area}>
                    {area}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ครูผู้สอน / ผู้รับผิดชอบ
              </label>
              <input
                type="text"
                value={teacher}
                onChange={(e) => setTeacher(e.target.value)}
                placeholder="เช่น คุณครูสมหมาย สุขใจ"
                className="w-full text-sm bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
            </div>
          </div>

          {/* Term, Year & Hours */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ภาคเรียน
              </label>
              <select
                value={term}
                onChange={(e) => setTerm(e.target.value as '1' | '2' | 'ทั้งปี')}
                className="w-full text-sm bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="1">ภาคเรียนที่ 1</option>
                <option value="2">ภาคเรียนที่ 2</option>
                <option value="ทั้งปี">ทั้งปีการศึกษา</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ปีการศึกษา
              </label>
              <input
                type="text"
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                placeholder="2567"
                className="w-full text-sm bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ชม./สัปดาห์
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={periodsPerWeek}
                onChange={(e) => setPeriodsPerWeek(parseInt(e.target.value) || 2)}
                className="w-full text-sm bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              คำอธิบายรายวิชา / ข้อมูลเพิ่มเติม (ถ้ามี)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="ระบุเนื้อหาหลักหรือคำอธิบายของวิชานี้..."
              className="w-full text-sm bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white resize-none"
            />
          </div>

          {/* Form Actions */}
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
              id="btn-submit-new-subject"
              className="px-5 py-2 text-sm font-semibold bg-blue-700 hover:bg-blue-800 text-white rounded-lg shadow-sm transition-all inline-flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>สร้างบล็อกรายวิชา</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
