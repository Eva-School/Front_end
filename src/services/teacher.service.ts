/**
 * teacherService
 * ==============
 * Teacher Role API abstraction.
 *
 * - Fetches teacher dashboard subjects (subjects grouped by year)
 * - Fetches teacher profile
 * - Fetches classes list for a specific year and subject
 * - Uses same base URL and credentials as auth
 * - Calls API endpoints that may be mocked by Next.js routes
 */

import type {
  TeacherSubject,
  TeacherProfileResponse,
  TeacherClassesResponse,
  TeacherStudent,
} from "@/types/Teacher-api/teacher-api";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

/**
 * Fetch teacher dashboard subjects from API.
 * Returns list of subjects grouped by academic year.
 * Used on /teacher page to render dynamic subject cards by year.
 */
export async function getTeacherSubjects(): Promise<TeacherSubject[]> {
  const response = await fetch(`${API_BASE_URL}/teacher/subjects`, {
    method: "GET",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    throw new Error("Failed to load teacher subjects");
  }

  const data = await response.json();
  return Array.isArray(data) ? data : data.subjects ?? data.data ?? [];
}

/**
 * Fetch current teacher profile (name, subtitle) for dashboard header.
 */
export async function getTeacherProfile(): Promise<TeacherProfileResponse> {
  const response = await fetch(`${API_BASE_URL}/teacher/profile`, {
    method: "GET",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    throw new Error("Failed to load teacher profile");
  }

  return response.json();
}

/**
 * Fetch classes list for a specific year and subject from API.
 * Used on /teacher/classes page to display all classes for a selected subject.
 *
 * @param year - Academic year: "junior" | "wheeler" | "senior"
 * @param subjectId - Optional subject ID (or name) to filter classes
 */
export async function getTeacherClasses(
  year: string,
  subjectId?: string | number
): Promise<TeacherClassesResponse> {

  let url = `${API_BASE_URL}/teacher/classes?year=${encodeURIComponent(year)}`;
  if (subjectId !== undefined && subjectId !== null) {
    url += `&subject=${encodeURIComponent(subjectId)}`;
  }

  const response = await fetch(url, {
    method: "GET",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    throw new Error("Failed to load teacher classes");
  }

  return response.json();
}

/**
 * Fetch students for a given class.
 */
export async function getClassStudents(
  classId: string | number
): Promise<{ students: TeacherStudent[] }> {
  const response = await fetch(
    `${API_BASE_URL}/teacher/students?classId=${encodeURIComponent(
      classId.toString()
    )}`,
    { method: "GET", credentials: "include", headers: { "Content-Type": "application/json" } }
  );

  if (!response.ok) {
    throw new Error("Failed to load students");
  }
  return response.json();
}

/**
 * Save a grade for a student (mock/no-op implementation).
 */
export async function saveStudentGrade(
  classId: string | number,
  studentId: string | number,
  grade: number
): Promise<void> {
  await fetch(`${API_BASE_URL}/teacher/grades`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ classId, studentId, grade }),
  });
}

export const teacherService = {
  getTeacherSubjects,
  getTeacherProfile,
  getTeacherClasses,
  getClassStudents,
  saveStudentGrade,
};
