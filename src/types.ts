export type GradeId = 'p1' | 'p2' | 'p3' | 'p4' | 'p5' | 'p6' | 'm1' | 'm2' | 'm3';

export type EducationLevel = 'primary' | 'secondary';

export interface GradeConfig {
  id: GradeId;
  name: string;
  shortName: string;
  fullName: string;
  level: EducationLevel;
  levelLabel: string;
  order: number;
}

export type LearningArea =
  | 'ภาษาไทย'
  | 'คณิตศาสตร์'
  | 'วิทยาศาสตร์และเทคโนโลยี'
  | 'ภาษาต่างประเทศ'
  | 'สังคมศึกษา ศาสนา และวัฒนธรรม'
  | 'สุขศึกษาและพลศึกษา'
  | 'ศิลปะ'
  | 'การงานอาชีพ'
  | 'วิชาเพิ่มเติม/อื่นๆ';

export type ExamType = 
  | 'สอบกลางภาค'
  | 'สอบปลายภาค'
  | 'สอบท้ายหน่วย/เก็บคะแนน'
  | 'สอบวัดผลระดับชาติ (NT/O-NET)'
  | 'สอบซ่อมเสริม';

export type ExamFileType = 'pdf' | 'docx' | 'link' | 'google_form' | 'html';

export interface ExamPaper {
  id: string;
  subjectId: string;
  gradeId: GradeId;
  title: string;
  examType: ExamType;
  academicYear: string; // เช่น 2567
  term: '1' | '2' | 'ทั้งปี';
  totalQuestions?: number;
  maxScore?: number;
  passScore?: number;
  timeLimitMinutes?: number; // เวลาสอบ (นาที)
  fileType: ExamFileType;
  fileUrl?: string;
  fileName?: string;
  fileSize?: string;
  htmlContent?: string; // เนื้อหาโค้ด HTML ของข้อสอบออนไลน์
  hasAnswerKey: boolean;
  answerKeyUrl?: string;
  answerKeyName?: string;
  instructions?: string;
  notes?: string;
  uploadedAt: string;
  uploader: string;
}

export interface SubjectBlock {
  id: string;
  gradeId: GradeId;
  code: string; // เช่น ท11101, ค12101
  name: string; // เช่น ภาษาไทย 1
  learningArea: LearningArea;
  teacher: string; // ครูผู้สอน
  term: '1' | '2' | 'ทั้งปี';
  academicYear: string;
  credit?: number; // หน่วยกิต หรือ น้ำหนัก
  periodsPerWeek?: number; // ชั่วโมง/สัปดาห์
  description?: string;
  exams: ExamPaper[];
  createdAt: string;
}

export type UserRole = 'admin' | 'student';

export interface StudentRecord {
  id: string;
  studentCode: string;
  name: string;
  level: string;
  room: string;
  gradeId: string;
}

export interface AuthSession {
  role: UserRole;
  student?: StudentRecord;
  adminName?: string;
  loggedInAt: string;
}

export interface ExamSubmissionRecord {
  id: string;
  studentCode: string;
  studentName: string;
  level: string;
  room: string;
  gradeId: string;
  subjectId: string;
  subjectCode: string;
  subjectName: string;
  examId: string;
  examTitle: string;
  score: number;
  maxScore: number;
  percentage: number;
  isPassed: boolean;
  timeSpentSeconds?: number;
  submittedAt: string; // ISO string
  notes?: string;
}

export const SCHOOL_LOGO_URL = "https://i.postimg.cc/Jz7Dv2fH/LOGO-rong-re-y-nra-s'dr-bar-ngs-lp-ph-nhl-ng.jpg";
export const SCHOOL_NAME = "โรงเรียนราษฎร์บำรุงศิลป์";
export const SCHOOL_AFFILIATION_ADDRESS = "สังกัดฝ่ายการศึกษา อัครสังฆมณฑลกรุงเทพฯ • อ.เสนา จ.พระนครศรีอยุธยา";

