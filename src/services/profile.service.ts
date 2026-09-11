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
 * and enriching it with role-specific domain details (Teacher subject or Student academic/contact info).
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
    let studentDetails: Partial<ProfileData> = {};

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
        // Fallback gracefully
      }
    } else if (normalizedRole === "student") {
      try {
        const studentProfile = await studentService.getStudentProfile();
        if (studentProfile) {
          academicYear = studentProfile.year || studentProfile.academicYearName || "Year 1";
          studentDetails = {
            studentCode: studentProfile.studentCode,
            nationalId: studentProfile.nationalId,
            className: studentProfile.className,
            departmentName: studentProfile.departmentName,
            majorName: studentProfile.majorName,
            phone: studentProfile.phone,
            address: studentProfile.address,
            addressArabic: studentProfile.addressArabic,
            relativeName: studentProfile.relativeName,
            relativePhone: studentProfile.relativePhone,
            overallPercentage: studentProfile.overallPercentage,
            totalEnrolledSubjects: studentProfile.totalEnrolledSubjects,
            completedCompetencies: studentProfile.completedCompetencies,
            totalCompetencies: studentProfile.totalCompetencies,
          };
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
      ...studentDetails,
    };
  },
};
