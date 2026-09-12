import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  onSnapshot,
  query,
  orderBy
} from 'firebase/firestore';
import { db } from '../firebase';
import { ExamSubmissionRecord } from '../types';

const SCORES_COLLECTION = 'exam_results';
const LOCAL_STORAGE_KEY = 'rbss_student_scores_cache_v1';

// Get cached local scores
export function getLocalScores(): ExamSubmissionRecord[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Error reading local scores:', err);
    return [];
  }
}

// Save scores to local cache
export function saveLocalScores(scores: ExamSubmissionRecord[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(scores));
  } catch (err) {
    console.error('Error saving local scores:', err);
  }
}

// Save a new score submission to Firestore and local cache
export async function submitExamScore(record: ExamSubmissionRecord): Promise<void> {
  // Update local cache immediately
  const localScores = getLocalScores();
  const filtered = localScores.filter(s => s.id !== record.id);
  filtered.unshift(record);
  saveLocalScores(filtered);

  // Sync to Firestore
  try {
    const docRef = doc(db, SCORES_COLLECTION, record.id);
    await setDoc(docRef, record);
  } catch (err) {
    console.warn('Failed to sync score to Firestore (will remain in local storage):', err);
  }
}

// Real-time listener for all scores
export function subscribeToScores(onUpdate: (scores: ExamSubmissionRecord[]) => void): () => void {
  try {
    const scoresRef = collection(db, SCORES_COLLECTION);
    const q = query(scoresRef, orderBy('submittedAt', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const cloudScores: ExamSubmissionRecord[] = [];
        snapshot.forEach((doc) => {
          cloudScores.push(doc.data() as ExamSubmissionRecord);
        });

        // Merge with local scores to ensure no loss
        const local = getLocalScores();
        const mergedMap = new Map<string, ExamSubmissionRecord>();
        local.forEach(s => mergedMap.set(s.id, s));
        cloudScores.forEach(s => mergedMap.set(s.id, s));

        const merged = Array.from(mergedMap.values()).sort(
          (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
        );
        saveLocalScores(merged);
        onUpdate(merged);
      },
      (error) => {
        console.warn('Scores real-time listener error, fallback to local storage:', error);
        onUpdate(getLocalScores());
      }
    );

    return unsubscribe;
  } catch (err) {
    console.warn('Error setting up scores snapshot:', err);
    onUpdate(getLocalScores());
    return () => {};
  }
}

// Delete score record (Admin only)
export async function deleteExamScore(id: string): Promise<void> {
  const local = getLocalScores().filter(s => s.id !== id);
  saveLocalScores(local);
  try {
    const { deleteDoc, doc } = await import('firebase/firestore');
    await deleteDoc(doc(db, SCORES_COLLECTION, id));
  } catch (err) {
    console.warn('Error deleting score from firestore:', err);
  }
}
