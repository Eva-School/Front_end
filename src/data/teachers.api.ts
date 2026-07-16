import { API_BASE_URL, secureFetch } from "@/config/api.config";
import { Teacher, CreateTeacherPayload } from "@/types/teacher.types";

export const TeachersAPI = {
  getAll(): Promise<Teacher[]> {
    return secureFetch(`${API_BASE_URL}/teachers`) as Promise<Teacher[]>;
  },

  create(payload: CreateTeacherPayload): Promise<Teacher> {
    return secureFetch<Teacher>(`${API_BASE_URL}/teachers`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
};
