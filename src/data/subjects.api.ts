import { API_BASE_URL, secureFetch } from "@/config/api.config";
import { Subject, CreateSubjectPayload } from "@/types/subject.types";

export const SubjectsAPI = {
  getByYear(year: string, stage?: string): Promise<Subject[]> {
    const stageQuery = stage ? `&stage=${encodeURIComponent(stage)}` : "";
    return secureFetch(`${API_BASE_URL}/Subjects?year=${encodeURIComponent(year)}${stageQuery}`) as Promise<Subject[]>;
  },

  create(payload: CreateSubjectPayload): Promise<Subject> {
    return secureFetch<Subject>(`${API_BASE_URL}/Subjects`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
};
