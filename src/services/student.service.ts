/**
 * studentService
 * ==============
 * Student Role API abstraction.
 *
 * - Fetches student dashboard cards (and profile when needed)
 * - Grades by academic year (quarter, final, jadarat)
 * - Uses same base URL and credentials as auth
 */

import { StudentCardApi } from "@/types/Student-api/Student-api";
import type {
  StudentYearKey,
  YearOption,
  QuarterGradesResponse,
  FinalGradesResponse,
  JadaratGradesResponse,
} from "@/types/Student-api/grades";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

export interface StudentProfileResponse {
  name: string;
  year?: string;
  subtitle?: string;
  /** Current academic year (e.g. "senior"). Used as default until user selects from Years page. */
  currentAcademicYear?: StudentYearKey;
}

/**
 * Fetch student dashboard cards from API.
 * Used on /student page to render dynamic cards (Quarter, Final, Competencies, etc.)
 */
export async function getStudentCards(): Promise<StudentCardApi[]> {
  const response = await fetch(`${API_BASE_URL}/student/cards`, {
    method: "GET",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    throw new Error("Failed to load student cards");
  }

  const data = await response.json();
  return Array.isArray(data) ? data : data.cards ?? data.data ?? [];
}

/**
 * Fetch current student profile (name, year) for dashboard header.
 * Optional: backend can provide this from /auth/me or a dedicated endpoint.
 */
export async function getStudentProfile(): Promise<StudentProfileResponse> {
  const response = await fetch(`${API_BASE_URL}/student/profile`, {
    method: "GET",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    throw new Error("Failed to load student profile");
  }

  return response.json();
}

/**
 * Fetch list of academic years (Junior, Wheeler, Senior) for Years page.
 */
export async function getStudentYears(): Promise<YearOption[]> {
  const response = await fetch(`${API_BASE_URL}/student/years`, {
    method: "GET",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    throw new Error("Failed to load years");
  }

  const data = await response.json();
  return Array.isArray(data) ? data : data.years ?? data.data ?? [];
}

/**
 * Fetch quarter grades for a given academic year.
 */
export async function getQuarterGrades(year: StudentYearKey): Promise<QuarterGradesResponse> {
  const response = await fetch(
    `${API_BASE_URL}/student/grades/quarter?year=${encodeURIComponent(year)}`,
    { method: "GET", credentials: "include", headers: { "Content-Type": "application/json" } }
  );

  if (!response.ok) {
    throw new Error("Failed to load quarter grades");
  }

  const data = await response.json();
  return {
    grades: data.grades ?? data ?? [],
    averageGrade: data.averageGrade ?? "—",
    year: data.year ?? year,
  };
}

/**
 * Fetch final grades for a given academic year.
 */
export async function getFinalGrades(year: StudentYearKey): Promise<FinalGradesResponse> {
  const response = await fetch(
    `${API_BASE_URL}/student/grades/final?year=${encodeURIComponent(year)}`,
    { method: "GET", credentials: "include", headers: { "Content-Type": "application/json" } }
  );

  if (!response.ok) {
    throw new Error("Failed to load final grades");
  }

  const data = await response.json();
  return {
    grades: data.grades ?? data ?? [],
    averageGrade: data.averageGrade ?? "—",
    year: data.year ?? year,
  };
}

/**
 * Fetch competencies (jadarat) grades for a given academic year.
 */
export async function getJadaratGrades(year: StudentYearKey): Promise<JadaratGradesResponse> {
  const response = await fetch(
    `${API_BASE_URL}/student/grades/jadarat?year=${encodeURIComponent(year)}`,
    { method: "GET", credentials: "include", headers: { "Content-Type": "application/json" } }
  );

  if (!response.ok) {
    throw new Error("Failed to load jadarat grades");
  }

  const data = await response.json();
  return {
    grades: data.grades ?? data ?? [],
    averageGrade: data.averageGrade,
    year: data.year ?? year,
  };
}

export const studentService = {
  getStudentCards,
  getStudentProfile,
  getStudentYears,
  getQuarterGrades,
  getFinalGrades,
  getJadaratGrades,
};
