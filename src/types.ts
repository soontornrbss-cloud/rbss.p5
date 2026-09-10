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
