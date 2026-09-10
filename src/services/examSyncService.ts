import { 
  collection, 
  doc, 
  onSnapshot, 
  setDoc, 
  deleteDoc, 
  writeBatch,
  getDocs
} from 'firebase/firestore';
import { db } from '../firebase';
import { SubjectBlock, ExamPaper } from '../types';
import { INITIAL_SUBJECTS } from '../data/initialData';

const SUBJECTS_COLLECTION = 'subjects';

/**
 * Remove undefined values to prevent Firestore serialization errors
 */
function sanitizeForFirestore<T>(data: T): T {
  return JSON.parse(JSON.stringify(data));
}

export type CloudSyncStatus = 'connecting' | 'synced' | 'syncing' | 'error' | 'offline';

/**
 * Listen to real-time updates for all subjects from Firestore
 * If the collection is completely empty in Firestore, automatically seeds with initial data.
 */
export function subscribeToSubjects(
  onUpdate: (subjects: SubjectBlock[]) => void,
  onStatusChange: (status: CloudSyncStatus, message?: string) => void
): () => void {
  onStatusChange('connecting');

  const subjectsCol = collection(db, SUBJECTS_COLLECTION);

  let isFirstLoad = true;

  const unsubscribe = onSnapshot(
    subjectsCol,
    async (snapshot) => {
      onStatusChange('syncing');

      // If remote collection is totally empty on first check, seed initial curriculum data
      if (snapshot.empty && isFirstLoad) {
        isFirstLoad = false;
        try {
          console.log('Seeding initial subjects to Firestore...');
          await seedInitialSubjects(INITIAL_SUBJECTS);
          onStatusChange('synced', 'เริ่มต้นฐานข้อมูลคลาวด์เรียบร้อยแล้ว');
          return;
        } catch (err: any) {
          console.error('Failed to seed initial subjects:', err);
          onStatusChange('error', err?.message || 'ไม่สามารถเริ่มต้นข้อมูล Cloud ได้');
          // Fallback to local initial subjects
          onUpdate(INITIAL_SUBJECTS);
          return;
        }
      }

      isFirstLoad = false;

      if (!snapshot.empty) {
        const loadedSubjects: SubjectBlock[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as SubjectBlock;
          loadedSubjects.push({
            ...data,
            id: docSnap.id || data.id,
            exams: Array.isArray(data.exams) ? data.exams : [],
          });
        });

        // Sort by createdAt or grade order
        onUpdate(loadedSubjects);
        onStatusChange('synced', `ซิงค์เรียลไทม์แล้ว (${loadedSubjects.length} รายวิชา)`);
      } else {
        onUpdate([]);
        onStatusChange('synced', 'พร้อมใช้งาน (ไม่มีรายวิชา)');
      }
    },
    (error) => {
      console.error('Firestore onSnapshot error:', error);
      onStatusChange('error', error.message || 'การเชื่อมต่อคลาวด์ขัดข้อง');
    }
  );

  return unsubscribe;
}

/**
 * Seed initial subjects to Firestore using batch write
 */
export async function seedInitialSubjects(subjects: SubjectBlock[]): Promise<void> {
  const batch = writeBatch(db);
  for (const subject of subjects) {
    const docRef = doc(db, SUBJECTS_COLLECTION, subject.id);
    batch.set(docRef, sanitizeForFirestore(subject));
  }
  await batch.commit();
}

/**
 * Save or update a single subject document in Firestore
 */
export async function saveSubjectToCloud(subject: SubjectBlock): Promise<void> {
  const docRef = doc(db, SUBJECTS_COLLECTION, subject.id);
  await setDoc(docRef, sanitizeForFirestore(subject), { merge: true });
}

/**
 * Delete a subject document from Firestore
 */
export async function deleteSubjectFromCloud(subjectId: string): Promise<void> {
  const docRef = doc(db, SUBJECTS_COLLECTION, subjectId);
  await deleteDoc(docRef);
}

/**
 * Save or update an exam inside a subject document in Firestore
 * This triggers real-time updates to ALL other connected machines.
 */
export async function saveExamToSubjectInCloud(
  subjectId: string,
  exam: ExamPaper,
  currentSubjects: SubjectBlock[]
): Promise<void> {
  const targetSubject = currentSubjects.find((s) => s.id === subjectId);
  if (!targetSubject) {
    throw new Error(`ไม่พบรายวิชารหัส ${subjectId}`);
  }

  // Check if exam already exists (updating existing HTML or details)
  const existingExamIndex = targetSubject.exams.findIndex((e) => e.id === exam.id);
  let updatedExams: ExamPaper[];

  if (existingExamIndex >= 0) {
    // Replace with new edited exam
    updatedExams = targetSubject.exams.map((e, index) =>
      index === existingExamIndex ? { ...exam, uploadedAt: exam.uploadedAt || new Date().toISOString().split('T')[0] } : e
    );
  } else {
    // Prepend new exam
    updatedExams = [exam, ...targetSubject.exams];
  }

  const updatedSubject: SubjectBlock = {
    ...targetSubject,
    exams: updatedExams,
  };

  const docRef = doc(db, SUBJECTS_COLLECTION, subjectId);
  await setDoc(docRef, sanitizeForFirestore(updatedSubject), { merge: true });
}

/**
 * Delete an exam from a subject in Firestore
 */
export async function deleteExamFromSubjectInCloud(
  subjectId: string,
  examId: string,
  currentSubjects: SubjectBlock[]
): Promise<void> {
  const targetSubject = currentSubjects.find((s) => s.id === subjectId);
  if (!targetSubject) return;

  const updatedExams = targetSubject.exams.filter((e) => e.id !== examId);
  const updatedSubject: SubjectBlock = {
    ...targetSubject,
    exams: updatedExams,
  };

  const docRef = doc(db, SUBJECTS_COLLECTION, subjectId);
  await setDoc(docRef, sanitizeForFirestore(updatedSubject), { merge: true });
}

/**
 * Force push all current local subjects to Cloud
 */
export async function syncAllSubjectsToCloud(subjects: SubjectBlock[]): Promise<void> {
  const batch = writeBatch(db);
  for (const subject of subjects) {
    const docRef = doc(db, SUBJECTS_COLLECTION, subject.id);
    batch.set(docRef, sanitizeForFirestore(subject), { merge: true });
  }
  await batch.commit();
}
