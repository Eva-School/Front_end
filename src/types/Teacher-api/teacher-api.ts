/**
 * Teacher API Types
 * Used for teacher dashboard and subject management
 */

export interface TeacherSubject {
  id: number;
  title: string;
  subjectName: string;
  year: "junior" | "wheeler" | "senior";
  route?: string;
}

export interface TeacherProfileResponse {
  name: string;
  subtitle?: string;
  /** Academic-year name as returned by the backend (for example, "2026-2027"). */
  currentAcademicYear?: string;
}

export interface TeacherClassesResponse {
  classes: TeacherClass[];
  year: string;
  subjectName: string;
}

export interface TeacherClass {
  id: number | string;
  className: string;
  studentCount?: number;
  lastModified?: string;
}

export interface TeacherStudent {
  id: number | string;
  name: string;
  q1?: number;
  q2?: number;
  q3?: number;
  q4?: number;
  finalGrade?: number;
  maxQ1?: number;
  maxQ2?: number;
  maxQ3?: number;
  maxQ4?: number;
  status?: string;
}
