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
  /** Current academic year (e.g. "junior", "wheeler", "senior") */
  currentAcademicYear?: "junior" | "wheeler" | "senior";
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
  quarterGrade?: number;
  teacherGrade?: number;
  finalGrade?: number; // Grade from admin (passing grade threshold)
  status?: "pass" | "fail"; // Auto-calculated: pass if studentGrade >= finalGrade
}
