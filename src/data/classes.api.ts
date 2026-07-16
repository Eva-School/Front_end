import { API_BASE_URL, secureFetch } from "@/config/api.config";
import { Class } from "@/types/subject.types";
import type { CreateClassPayload, ViceLevel } from "@/types/vice/students";

export const ClassesAPI = {
  getByYear(yearId: string, stage?: ViceLevel): Promise<Class[]> {
    // Sanitize yearId to prevent URL injection
    const sanitizedYearId = encodeURIComponent(yearId);
    const stageQuery = stage ? `&stage=${encodeURIComponent(stage)}` : "";
    return secureFetch(`${API_BASE_URL}/classes?yearId=${sanitizedYearId}${stageQuery}`) as Promise<Class[]>;
  },

  create(payload: CreateClassPayload): Promise<Class> {
    return secureFetch(`${API_BASE_URL}/classes`, {
      method: "POST",
      body: JSON.stringify(payload),
    }) as Promise<Class>;
  },
};
