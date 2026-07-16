import { API_BASE_URL, secureFetch } from "@/config/api.config";

export interface CreateTeacherAssignmentPayload {
  teacherId: string;
  yearId: string;
  subjectId: string;
  classIds: number[];
}

export interface TeacherAssignmentListItem {
  teacherId: number;
  teacherName: string;
  academicYearId: number;
  yearName: string;
  stage: "junior" | "wheeler" | "senior";
  subjectId: number;
  subjectName: string;
  classId: number;
  className: string;
  isActive: boolean;
  assignedAt?: string;
}

export type TeacherAssignmentKey = Pick<TeacherAssignmentListItem, "teacherId" | "academicYearId" | "subjectId" | "classId">;

export const TeacherAssignmentsAPI = {
  create(payload: CreateTeacherAssignmentPayload): Promise<void> {
    return secureFetch(`${API_BASE_URL}/TeacherAssignments`, {
      method: "POST",
      body: JSON.stringify(payload),
    }) as Promise<void>;
  },
  list(filters?: { yearName?: string; stage?: string }): Promise<TeacherAssignmentListItem[]> {
    const query = new URLSearchParams();
    if (filters?.yearName) query.set("yearName", filters.yearName);
    if (filters?.stage) query.set("stage", filters.stage);
    return secureFetch(`${API_BASE_URL}/TeacherAssignments${query.size ? `?${query.toString()}` : ""}`) as Promise<TeacherAssignmentListItem[]>;
  },
  replace(payload: CreateTeacherAssignmentPayload): Promise<void> {
    return secureFetch(`${API_BASE_URL}/TeacherAssignments`, { method: "PUT", body: JSON.stringify(payload) }) as Promise<void>;
  },
  setStatus(key: TeacherAssignmentKey, isActive: boolean): Promise<void> {
    return secureFetch(`${API_BASE_URL}/TeacherAssignments/status`, { method: "PATCH", body: JSON.stringify({ ...key, isActive }) }) as Promise<void>;
  },
  remove(key: TeacherAssignmentKey): Promise<void> {
    return secureFetch(`${API_BASE_URL}/TeacherAssignments`, { method: "DELETE", body: JSON.stringify(key) }) as Promise<void>;
  },
};
