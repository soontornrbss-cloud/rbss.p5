import rawStudents from '../data/students.json';
import { StudentRecord } from '../types';

export const allStudents: StudentRecord[] = Array.isArray(rawStudents) ? (rawStudents as StudentRecord[]) : [];

export function findStudentByCode(code: string): StudentRecord | undefined {
  if (!code) return undefined;
  const cleanCode = code.trim();
  return allStudents.find(s => s.studentCode === cleanCode);
}

export function searchStudents(query: string, levelFilter?: string, roomFilter?: string): StudentRecord[] {
  const q = query.trim().toLowerCase();
  return allStudents.filter(s => {
    if (levelFilter && levelFilter !== 'all' && s.level !== levelFilter) return false;
    if (roomFilter && roomFilter !== 'all' && s.room !== roomFilter) return false;
    if (!q) return true;
    return (
      s.studentCode.includes(q) ||
      s.name.toLowerCase().includes(q) ||
      s.level.toLowerCase().includes(q) ||
      s.room.includes(q)
    );
  });
}

export function getAllLevels(): string[] {
  const levels = new Set<string>();
  allStudents.forEach(s => levels.add(s.level));
  return Array.from(levels);
}

export function getRoomsForLevel(level: string): string[] {
  const rooms = new Set<string>();
  allStudents
    .filter(s => s.level === level)
    .forEach(s => rooms.add(s.room));
  return Array.from(rooms).sort((a, b) => Number(a) - Number(b));
}

export function getStudentsInClass(level: string, room: string): StudentRecord[] {
  return allStudents.filter(s => s.level === level && s.room === room);
}

export interface ClassGroup {
  level: string;
  room: string;
  count: number;
}

export function getAllClassGroups(): ClassGroup[] {
  const map = new Map<string, { level: string; room: string; count: number }>();
  allStudents.forEach(s => {
    const key = `${s.level}___${s.room}`;
    if (!map.has(key)) {
      map.set(key, { level: s.level, room: s.room, count: 0 });
    }
    map.get(key)!.count++;
  });
  return Array.from(map.values());
}

