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
import { API_BASE_URL, secureFetch } from "@/config/api.config";

type ListEnvelope<T> = T[] | { cards?: T[]; years?: T[]; grades?: T[]; data?: T[] };

const getList = <T>(value: ListEnvelope<T>, key: "cards" | "years" | "grades"): T[] => {
  if (Array.isArray(value)) return value;
  return value[key] ?? value.data ?? [];
};

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
  const data = await secureFetch(`${API_BASE_URL}/student/cards`) as ListEnvelope<StudentCardApi>;
  return getList(data, "cards");
}

/**
 * Fetch current student profile (name, year) for dashboard header.
 * Optional: backend can provide this from /auth/me or a dedicated endpoint.
 */
export async function getStudentProfile(): Promise<StudentProfileResponse> {
  return secureFetch(`${API_BASE_URL}/student/profile`) as Promise<StudentProfileResponse>;
}

/**
 * Fetch list of academic years (Junior, Wheeler, Senior) for Years page.
 */
export async function getStudentYears(): Promise<YearOption[]> {
  const data = await secureFetch(`${API_BASE_URL}/student/years`) as ListEnvelope<YearOption>;
  return getList(data, "years");
}

/**
 * Fetch quarter grades for a given academic year.
 */
export async function getQuarterGrades(year: StudentYearKey): Promise<QuarterGradesResponse> {
  const data = await secureFetch(
    `${API_BASE_URL}/student/grades/quarter?year=${encodeURIComponent(year)}`
  ) as Partial<QuarterGradesResponse> & ListEnvelope<QuarterGradesResponse["grades"][number]>;
  return {
    grades: Array.isArray(data) ? data : data.grades ?? data.data ?? [],
    averageGrade: data.averageGrade ?? "—",
    year: data.year ?? year,
  };
}

/**
 * Fetch final grades for a given academic year.
 */
export async function getFinalGrades(year: StudentYearKey): Promise<FinalGradesResponse> {
  const data = await secureFetch(
    `${API_BASE_URL}/student/grades/final?year=${encodeURIComponent(year)}`
  ) as Partial<FinalGradesResponse> & ListEnvelope<FinalGradesResponse["grades"][number]>;
  return {
    grades: Array.isArray(data) ? data : data.grades ?? data.data ?? [],
    averageGrade: data.averageGrade ?? "—",
    year: data.year ?? year,
  };
}

/**
 * Fetch competencies (jadarat) grades for a given academic year.
 */
export async function getJadaratGrades(year: StudentYearKey): Promise<JadaratGradesResponse> {
  const data = await secureFetch(
    `${API_BASE_URL}/student/grades/jadarat?year=${encodeURIComponent(year)}`
  ) as Partial<JadaratGradesResponse> & ListEnvelope<JadaratGradesResponse["grades"][number]>;
  return {
    grades: Array.isArray(data) ? data : data.grades ?? data.data ?? [],
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
