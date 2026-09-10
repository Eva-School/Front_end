import { API_BASE_URL, secureFetch } from "@/config/api.config";
import type {
  ClassCohortSummary,
  ClassDetails,
  ClassItem,
  CreateClassPayload,
  UpdateClassPayload,
} from "@/types/class-management.types";
import type { ViceLevel } from "@/types/vice/students";

export const ClassesAPI = {
  getCohortsSummary(): Promise<ClassCohortSummary[]> {
    return secureFetch(`${API_BASE_URL}/classes/cohorts-summary`) as Promise<ClassCohortSummary[]>;
  },

  getByYear(yearId?: string, stage?: ViceLevel | string): Promise<ClassItem[]> {
    const params = new URLSearchParams();
    if (yearId) params.set("yearId", yearId);
    if (stage) params.set("stage", stage);
    const queryString = params.toString() ? `?${params.toString()}` : "";
    return secureFetch(`${API_BASE_URL}/classes${queryString}`) as Promise<ClassItem[]>;
  },

  getDetails(classId: number): Promise<ClassDetails> {
    return secureFetch(`${API_BASE_URL}/classes/${classId}/details`) as Promise<ClassDetails>;
  },

  create(payload: CreateClassPayload): Promise<ClassItem> {
    return secureFetch(`${API_BASE_URL}/classes`, {
      method: "POST",
      body: JSON.stringify(payload),
    }) as Promise<ClassItem>;
  },

  update(classId: number, payload: UpdateClassPayload): Promise<ClassItem> {
    return secureFetch(`${API_BASE_URL}/classes/${classId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }) as Promise<ClassItem>;
  },

  delete(classId: number): Promise<{ message: string }> {
    return secureFetch(`${API_BASE_URL}/classes/${classId}`, {
      method: "DELETE",
    }) as Promise<{ message: string }>;
  },
};
