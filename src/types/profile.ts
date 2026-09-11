export interface ProfileData {
  fullName: string;
  username: string;
  role: string;
  subject?: string;
  academicYear: string;
  status: "Active" | "Inactive";
  studentCode?: string;
  nationalId?: string;
  className?: string;
  departmentName?: string;
  majorName?: string;
  phone?: string;
  address?: string;
  addressArabic?: string;
  relativeName?: string;
  relativePhone?: string;
  overallPercentage?: number;
  totalEnrolledSubjects?: number;
  completedCompetencies?: number;
  totalCompetencies?: number;
}