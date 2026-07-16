import { API_BASE_URL, secureFetch } from "@/config/api.config";

export interface AcademicYearOption {
  yearName: string;
  isActive: boolean;
}

export interface CreateAcademicYearPayload {
  yearName: string;
  copyFromYearName?: string;
  copyTerms: boolean;
  copySubjects: boolean;
  copyClasses: boolean;
  copyTeacherAssignments: boolean;
  carryStudents: boolean;
  activateImmediately: boolean;
}

export interface AcademicYearRolloverResult {
  yearName: string;
  isActive: boolean;
  termsCopied: number;
  subjectsCopied: number;
  classesCopied: number;
  teacherAssignmentsCopied: number;
  studentsCarried: number;
}

export const AcademicYearsAPI = {
  list(): Promise<AcademicYearOption[]> {
    return secureFetch<AcademicYearOption[]>(`${API_BASE_URL}/settings/academic-years`);
  },

  create(payload: CreateAcademicYearPayload): Promise<AcademicYearRolloverResult> {
    return secureFetch<AcademicYearRolloverResult>(`${API_BASE_URL}/settings/academic-years`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
};
