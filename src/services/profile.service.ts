import { API_BASE_URL, secureFetch } from "@/config/api.config";
import { ProfileData } from "@/types/profile";
import { teacherService } from "./teacher.service";
import { studentService } from "./student.service";

export interface UserMeResponse {
  userId: number;
  role: string;
  username: string;
  fullName?: string;
  email?: string;
}

export interface ProfileResponse extends ProfileData {
  userId: number;
  email?: string;
}

/**
 * Profile service
 * ===============
 * Responsible for fetching the currently authenticated user's profile
 * and enriching it with role-specific domain details (e.g. Teacher subject / Academic year).
 */
export const profileService = {
  /**
   * Get current user's profile.
   * GET `/api/Auth/me` + optional role enrichment
   */
  async getMyProfile(): Promise<ProfileResponse> {
    const userMe = await secureFetch<UserMeResponse>(`${API_BASE_URL}/Auth/me`);

    let subject: string | undefined = undefined;
    let academicYear = "Not assigned";

    const normalizedRole = userMe.role?.trim().toLowerCase();

    if (normalizedRole === "teacher") {
      try {
        const teacherProfile = await teacherService.getTeacherProfile();
        if (teacherProfile) {
          if (teacherProfile.subtitle && teacherProfile.subtitle !== "Teacher") {
            subject = teacherProfile.subtitle;
          }
          if (teacherProfile.currentAcademicYear) {
            academicYear = teacherProfile.currentAcademicYear;
          }
        }
      } catch {
        // Fallback gracefully without breaking the profile page
      }
    } else if (normalizedRole === "student") {
      try {
        const studentProfile = await studentService.getStudentProfile();
        if (studentProfile) {
          if (studentProfile.year) {
            academicYear = studentProfile.year;
          }
        }
      } catch {
        // Fallback gracefully
      }
    }

    return {
      userId: userMe.userId,
      email: userMe.email,
      fullName: userMe.fullName?.trim() || userMe.username,
      username: userMe.username,
      role: userMe.role,
      subject,
      academicYear,
      status: "Active",
    };
  },
};
