// In-memory + localStorage fallback when Supabase is not configured
import type { Student, Course } from './data';

const STORAGE_KEY = 'academy_fallback_db';

interface FallbackRecord {
  students: Student[];
  parents: { studentId: string; type: string; name: string }[];
}

function load(): FallbackRecord {
  if (typeof window === 'undefined') return { students: [], parents: [] };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return { students: [], parents: [] };
}

function save(data: FallbackRecord) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function generateId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function isSupabaseConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  );
}

/** Add a student to the fallback store */
export function fallbackAddStudent(student: Omit<Student, 'id' | 'studentId'> & { studentId?: string }): Student {
  const db = load();
  const newStudent: Student = {
    id: generateId(),
    studentId: student.studentId || `ST-LOCAL-${String(db.students.length + 1).padStart(3, '0')}`,
    fullName: student.fullName,
    nickname: student.nickname || '',
    status: student.status,
    age: student.age,
    level: student.level,
    phone: student.phone || '',
    parents: student.parents || '',
    courses: student.courses || [],
  };
  db.students.unshift(newStudent);
  save(db);
  return newStudent;
}

/** Get all students from fallback store */
export function fallbackGetStudents(): Student[] {
  return load().students;
}
