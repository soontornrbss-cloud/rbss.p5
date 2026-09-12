import React, { useState, useMemo } from 'react';
import { 
  AuthSession, 
  StudentRecord, 
  UserRole,
  SCHOOL_LOGO_URL
} from '../types';
import { 
  findStudentByCode 
} from '../services/studentService';
import { 
  GraduationCap, 
  ShieldCheck, 
  KeyRound, 
  School, 
  X, 
  CheckCircle2, 
  AlertCircle,
  ArrowRight,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSession: AuthSession | null;
  onLoginSuccess: (session: AuthSession) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  currentSession,
  onLoginSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<UserRole>('student');

  // Student Login state (Login with student password/code only)
  const [studentPassword, setStudentPassword] = useState('');
  const [showStudentPassword, setShowStudentPassword] = useState(false);

  // Admin Login state
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [adminName, setAdminName] = useState('ครูผู้ดูแลระบบ RBSS');
  const [adminError, setAdminError] = useState('');

  // Selected student resolution by password (student code)
  const resolvedStudent: StudentRecord | undefined = useMemo(() => {
    if (studentPassword.trim()) {
      return findStudentByCode(studentPassword.trim());
    }
    return undefined;
  }, [studentPassword]);

  const isInvalidCode = studentPassword.trim().length >= 4 && !resolvedStudent;

  if (!isOpen) return null;

  const handleStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolvedStudent) {
      alert('กรุณากรอกรหัสผ่าน (เลขประจำตัวนักเรียน 5 หลัก) ให้ถูกต้อง');
      return;
    }

    const newSession: AuthSession = {
      role: 'student',
      student: resolvedStudent,
      loggedInAt: new Date().toISOString(),
    };

    onLoginSuccess(newSession);
    onClose();
  };

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Default admin passwords
    const validPasswords = ['rbssadmin', '1234', 'admin', 'rbss2567'];
    if (validPasswords.includes(adminPassword.trim().toLowerCase())) {
      const newSession: AuthSession = {
        role: 'admin',
        adminName: adminName.trim() || 'ผู้ดูแลระบบ RBSS',
        loggedInAt: new Date().toISOString(),
      };
      setAdminError('');
      onLoginSuccess(newSession);
      onClose();
    } else {
      setAdminError('รหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบรหัสผ่านอีกครั้ง');
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6"
      id="login-modal-backdrop"
    >
      <div 
        id="login-modal"
        className="relative bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header Branding */}
        <div className="bg-linear-to-r from-blue-900 via-indigo-900 to-blue-950 text-white p-6 relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white p-0.5 flex items-center justify-center shadow-md shrink-0 border-2 border-amber-400 overflow-hidden">
              <img 
                src={SCHOOL_LOGO_URL} 
                alt="ตราสัญลักษณ์โรงเรียนราษฎร์บำรุงศิลป์" 
                className="w-full h-full object-contain rounded-xl"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-800 text-amber-300 border border-blue-700">
                โรงเรียนราษฎร์บำรุงศิลป์
              </span>
              <h2 className="text-xl font-bold text-white mt-1">
                เข้าสู่ระบบคลังข้อสอบออนไลน์
              </h2>
              <p className="text-xs text-blue-200">
                ระบบยืนยันตัวตนสำหรับ นักเรียน และ ครูผู้ดูแลระบบ (Admin)
              </p>
            </div>
          </div>

          {/* Role Tabs */}
          <div className="flex bg-blue-950/80 p-1 rounded-xl mt-5 border border-blue-800/80">
            <button
              type="button"
              id="tab-login-student"
              onClick={() => setActiveTab('student')}
              className={`flex-1 py-2 rounded-lg text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                activeTab === 'student'
                  ? 'bg-amber-400 text-blue-950 shadow-md'
                  : 'text-blue-200 hover:text-white hover:bg-white/5'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>นักเรียน (Student)</span>
            </button>

            <button
              type="button"
              id="tab-login-admin"
              onClick={() => setActiveTab('admin')}
              className={`flex-1 py-2 rounded-lg text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                activeTab === 'admin'
                  ? 'bg-amber-400 text-blue-950 shadow-md'
                  : 'text-blue-200 hover:text-white hover:bg-white/5'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>ครู / ผู้ดูแลระบบ (Admin)</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          
          {/* TAB 1: STUDENT LOGIN */}
          {activeTab === 'student' && (
            <form onSubmit={handleStudentSubmit} className="space-y-4" id="form-student-login">
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-xs text-blue-800">
                <p className="font-semibold flex items-center gap-1.5 mb-1">
                  <GraduationCap className="w-4 h-4 text-blue-600" />
                  <span>สิทธิ์การใช้งานของนักเรียน:</span>
                </p>
                <ul className="list-disc pl-5 space-y-0.5 text-blue-700">
                  <li>เลือกทำแบบทดสอบและข้อสอบออนไลน์ได้</li>
                  <li><strong>ไม่สามารถ</strong> เพิ่ม แก้ไข หรือลบข้อสอบและรายวิชาได้</li>
                  <li>ระบบจะบันทึกคะแนนสอบรายบุคคล และออกใบรายงานผลการสอบมาตรฐาน</li>
                </ul>
              </div>

              {/* Password Login Field */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  รหัสผ่านนักเรียน (เลขประจำตัว 5 หลัก)
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showStudentPassword ? "text" : "password"}
                    id="input-student-password"
                    value={studentPassword}
                    onChange={(e) => setStudentPassword(e.target.value)}
                    placeholder="กรอกรหัสผ่านนักเรียน (เลขประจำตัว 5 หลัก)"
                    className="w-full pl-10 pr-20 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono tracking-wider"
                    autoFocus
                    required
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    {studentPassword && (
                      <button
                        type="button"
                        onClick={() => setStudentPassword('')}
                        className="px-2 py-1 text-xs text-slate-400 hover:text-slate-600"
                        title="ล้างข้อมูล"
                      >
                        ล้าง
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setShowStudentPassword(!showStudentPassword)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
                      title={showStudentPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
                    >
                      {showStudentPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  * กรุณาใช้เลขประจำตัวนักเรียน 5 หลักของท่านเป็นรหัสผ่านในการเข้าสู่ระบบ
                </p>
              </div>

              {/* Invalid Password Warning */}
              {isInvalidCode && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2 animate-in fade-in duration-150">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>ไม่พบข้อมูลนักเรียนสำหรับรหัสนี้ กรุณาตรวจสอบเลขประจำตัว 5 หลักอีกครั้ง</span>
                </div>
              )}

              {/* Resolved Student Confirmation Card */}
              {resolvedStudent ? (
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 flex items-center gap-3 animate-in fade-in duration-150">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0 shadow-xs">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] bg-emerald-200 text-emerald-800 font-bold px-1.5 py-0.2 rounded font-mono">
                        #{resolvedStudent.studentCode}
                      </span>
                      <span className="text-xs font-bold text-emerald-950 truncate">
                        {resolvedStudent.name}
                      </span>
                    </div>
                    <p className="text-xs text-emerald-800 mt-0.5">
                      ระดับชั้น: {resolvedStudent.level} (ห้อง {resolvedStudent.room})
                    </p>
                  </div>
                </div>
              ) : (
                !isInvalidCode && (
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-500">
                    กรุณากรอกรหัสผ่าน (เลขประจำตัว 5 หลัก) เพื่อเข้าสู่ระบบ
                  </div>
                )
              )}

              {/* Submit Button */}
              <button
                type="submit"
                id="btn-confirm-student-login"
                disabled={!resolvedStudent}
                className="w-full py-3 px-4 rounded-xl bg-blue-700 hover:bg-blue-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <span>เข้าสู่ระบบในฐานะนักเรียน</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* TAB 2: ADMIN LOGIN */}
          {activeTab === 'admin' && (
            <form onSubmit={handleAdminSubmit} className="space-y-4" id="form-admin-login">
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900">
                <p className="font-semibold flex items-center gap-1.5 mb-1">
                  <ShieldCheck className="w-4 h-4 text-amber-600" />
                  <span>สิทธิ์การใช้งานของผู้ดูแลระบบ (Admin):</span>
                </p>
                <ul className="list-disc pl-5 space-y-0.5 text-amber-800">
                  <li>นำเข้าข้อสอบ HTML, แนบไฟล์ PDF / DOCX, เพิ่มรายวิชา</li>
                  <li>แก้ไขเนื้อหาข้อสอบ รหัสโค้ด และลบข้อสอบ/รายวิชา</li>
                  <li>ดูรายงานคะแนนสอบนักเรียนทั้งหมด และพิมพ์รายงานมาตรฐานประจำชั้น</li>
                </ul>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  ชื่อผู้ดูแลระบบ / คุณครู
                </label>
                <input
                  type="text"
                  id="input-admin-name"
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  placeholder="ระบุชื่อผู้ดูแลระบบ หรือ ครูผู้สอน"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  รหัสผ่าน Admin (Admin Password)
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showAdminPassword ? "text" : "password"}
                    id="input-admin-password"
                    value={adminPassword}
                    onChange={(e) => {
                      setAdminPassword(e.target.value);
                      setAdminError('');
                    }}
                    placeholder="ป้อนรหัสผ่านผู้ดูแลระบบ"
                    className="w-full pl-10 pr-20 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    required
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    {adminPassword && (
                      <button
                        type="button"
                        onClick={() => setAdminPassword('')}
                        className="px-2 py-1 text-xs text-slate-400 hover:text-slate-600"
                        title="ล้างข้อมูล"
                      >
                        ล้าง
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setShowAdminPassword(!showAdminPassword)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
                      title={showAdminPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
                    >
                      {showAdminPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {adminError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{adminError}</span>
                </div>
              )}

              <button
                type="submit"
                id="btn-confirm-admin-login"
                className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-blue-950 text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>เข้าสู่ระบบในฐานะผู้ดูแลระบบ (Admin)</span>
              </button>
            </form>
          )}

          {/* Current Session Indicator */}
          {currentSession && (
            <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
              <span>
                กำลังใช้งานโดย: <strong>{currentSession.role === 'admin' ? currentSession.adminName || 'Admin' : currentSession.student?.name}</strong>
              </span>
              <span className="text-[11px] text-slate-400">
                สิทธิ์: {currentSession.role === 'admin' ? 'ผู้ดูแลระบบ' : 'นักเรียน'}
              </span>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
