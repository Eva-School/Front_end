/**
 * studentService
 * ==============
 * Student Role API abstraction.
 *
 * - Fetches student dashboard cards, full profile, and enrollment
 * - Grades by academic year (quarter with quizzes, final with GPA, jadarat with attempts)
 * - Profile contact updates
 * - Uses secureFetch connected to real backend endpoints
 */

import { StudentCardApi } from "@/types/Student-api/Student-api";
import type {
  StudentYearKey,
  YearOption,
  QuarterGradesResponse,
  FinalGradesResponse,
  JadaratGradesResponse,
  StudentProfileData,
  UpdateStudentContactData,
  StudentEnrollmentDetails,
} from "@/types/Student-api/grades";
import { API_BASE_URL, secureFetch } from "@/config/api.config";

type ListEnvelope<T> = T[] | { cards?: T[]; years?: T[]; grades?: T[]; data?: T[] };

const getList = <T>(value: ListEnvelope<T>, key: "cards" | "years" | "grades"): T[] => {
  if (Array.isArray(value)) return value;
  return value[key] ?? value.data ?? [];
};

/**
 * Fetch student dashboard cards from API.
 */
export async function getStudentCards(): Promise<StudentCardApi[]> {
  const data = (await secureFetch(`${API_BASE_URL}/student/cards`)) as ListEnvelope<StudentCardApi>;
  return getList(data, "cards");
}

/**
 * Fetch current student profile details (name, code, national ID, class, GPA, etc.).
 */
export async function getStudentProfile(): Promise<StudentProfileData> {
  return secureFetch(`${API_BASE_URL}/student/profile`) as Promise<StudentProfileData>;
}

/**
 * Update student contact information (phone, address, relative contact).
 */
export async function updateStudentProfile(
  payload: UpdateStudentContactData
): Promise<StudentProfileData> {
  return secureFetch(`${API_BASE_URL}/student/profile`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }) as Promise<StudentProfileData>;
}

/**
 * Fetch list of academic years (Junior, Wheeler, Senior).
 */
export async function getStudentYears(): Promise<YearOption[]> {
  const data = (await secureFetch(`${API_BASE_URL}/student/years`)) as ListEnvelope<YearOption>;
  return getList(data, "years");
}

/**
 * Fetch quarter grades and quiz breakdowns for a given academic year and optional term.
 */
export async function getQuarterGrades(
  year: StudentYearKey,
  termId?: number
): Promise<QuarterGradesResponse> {
  const url = new URL(`${API_BASE_URL}/student/grades/quarter`);
  url.searchParams.set("year", year);
  if (termId !== undefined) {
    url.searchParams.set("termId", termId.toString());
  }

  const data = (await secureFetch(url.toString())) as QuarterGradesResponse &
    ListEnvelope<QuarterGradesResponse["grades"][number]>;

  const gradesList = Array.isArray(data) ? data : data.grades ?? (data as any).data ?? [];
  const averageCalc =
    gradesList.length > 0
      ? (
          gradesList.reduce((sum, g) => sum + (g.percentage ?? g.yourGrade ?? 0), 0) /
          gradesList.length
        ).toFixed(1) + "%"
      : "—";

  return {
    grades: gradesList,
    year: data.year ?? year,
    academicYearName: data.academicYearName,
    availableTerms: data.availableTerms ?? [1, 2],
    selectedTerm: data.selectedTerm ?? termId ?? 1,
    averageGrade: data.averageGrade ?? averageCalc,
  };
}

/**
 * Fetch final grades, GPA, standing, and subject transcripts.
 */
export async function getFinalGrades(year: StudentYearKey): Promise<FinalGradesResponse> {
  const data = (await secureFetch(
    `${API_BASE_URL}/student/grades/final?year=${encodeURIComponent(year)}`
  )) as FinalGradesResponse & ListEnvelope<FinalGradesResponse["grades"][number]>;

  const gradesList = Array.isArray(data) ? data : data.grades ?? (data as any).data ?? [];
  const avg =
    gradesList.length > 0
      ? (
          gradesList.reduce((sum, g) => sum + (g.percentage ?? g.totalScore ?? 0), 0) /
          gradesList.length
        ).toFixed(1) + "%"
      : "—";

  return {
    grades: gradesList,
    year: data.year ?? year,
    academicYearName: data.academicYearName,
    termGpa: data.termGpa,
    cumulativeAverage: data.cumulativeAverage,
    totalCredits: data.totalCredits,
    standing: data.standing ?? "Good Standing",
    averageGrade: data.averageGrade ?? avg,
  };
}

/**
 * Fetch competencies (jadarat) grades, evaluation status, and attempt history.
 */
export async function getJadaratGrades(year: StudentYearKey): Promise<JadaratGradesResponse> {
  const data = (await secureFetch(
    `${API_BASE_URL}/student/grades/jadarat?year=${encodeURIComponent(year)}`
  )) as JadaratGradesResponse & ListEnvelope<JadaratGradesResponse["grades"][number]>;

  const gradesList = Array.isArray(data) ? data : data.grades ?? (data as any).data ?? [];

  return {
    grades: gradesList,
    year: data.year ?? year,
    academicYearName: data.academicYearName,
    totalCompetencies: data.totalCompetencies ?? gradesList.length,
    passedCompetencies:
      data.passedCompetencies ??
      gradesList.filter(
        (g) =>
          g.currentStatus?.toLowerCase().includes("pass") ||
          g.Your_Attemps?.toLowerCase().includes("pass")
      ).length,
    pendingCompetencies: data.pendingCompetencies ?? 0,
    averageGrade: data.averageGrade,
  };
}

/**
 * Fetch student class enrollment, assigned teachers, and schedule overview.
 */
export async function getStudentEnrollment(): Promise<StudentEnrollmentDetails> {
  return secureFetch(`${API_BASE_URL}/student/enrollment`) as Promise<StudentEnrollmentDetails>;
}

export const studentService = {
  getStudentCards,
  getStudentProfile,
  updateStudentProfile,
  getStudentYears,
  getQuarterGrades,
  getFinalGrades,
  getJadaratGrades,
  getStudentEnrollment,
};
