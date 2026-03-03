/**
 * Teacher Mock Data
 * Used for development and testing
 */

import type { TeacherSubject, TeacherProfileResponse, TeacherClassesResponse } from "@/types/Teacher-api/teacher-api";

/**
 * Mock teacher profile
 */
export const mockTeacherProfile: TeacherProfileResponse = {
  name: "Ahmed Mahmoud",
  subtitle: "Math Teacher",
  currentAcademicYear: "senior",
};

/**
 * Mock teacher subjects (Dashboard cards)
 */
export const mockTeacherSubjects: TeacherSubject[] = [
  {
    id: 1,
    title: "Junior",
    subjectName: "Mathematics",
    year: "junior",
    route: "/teacher/classes?year=junior&subject=1",
  },
  {
    id: 2,
    title: "Wheeler",
    subjectName: "Science",
    year: "wheeler",
    route: "/teacher/classes?year=wheeler&subject=2",
  },
  {
    id: 3,
    title: "Senior",
    subjectName: "English",
    year: "senior",
    route: "/teacher/classes?year=senior&subject=3",
  },
 
];

/**
 * Mock classes for different years and subjects
 */
export const mockTeacherClasses = {
  junior: {
    subjectName: "Mathematics",
    classes: [
      { id: 101, className: "A1", studentCount: 25, lastModified: "2026-03-01" },
      { id: 102, className: "A2", studentCount: 28, lastModified: "2026-02-28" },
      { id: 103, className: "A3", studentCount: 26, lastModified: "2026-02-27" },
    ],
  },
  wheeler: {
    subjectName: "Science",
    classes: [
      { id: 201, className: "B1", studentCount: 30, lastModified: "2026-03-02" },
      { id: 202, className: "B2", studentCount: 29, lastModified: "2026-03-01" },
    ],
  },
  senior: {
    subjectName: "English",
    classes: [
      { id: 301, className: "C1", studentCount: 24, lastModified: "2026-03-03" },
      { id: 302, className: "C2", studentCount: 27, lastModified: "2026-03-02" },
      { id: 303, className: "C3", studentCount: 25, lastModified: "2026-03-01" },
      { id: 304, className: "C4", studentCount: 28, lastModified: "2026-02-28" },
    ],
  },
};

/**
 * Get mock classes for a specific year
 */
export function getMockClassesForYear(year: string): TeacherClassesResponse {
  const yearData = mockTeacherClasses[year as keyof typeof mockTeacherClasses];
  
  if (!yearData) {
    return {
      classes: [],
      year,
      subjectName: "Unknown Subject",
    };
  }

  return {
    classes: yearData.classes,
    year,
    subjectName: yearData.subjectName,
  };
}
/**
 * Students grouped by class id
 */
import type { TeacherStudent } from "@/types/Teacher-api/teacher-api";

const mockTeacherStudents: Record<number, TeacherStudent[]> = {
  101: [
    { id: 1001, name: "Ali Ahmed", quarterGrade: 22, finalGrade: 20, status: "pass" },
    { id: 1002, name: "Sara Mahmoud", quarterGrade: 24, finalGrade: 20, status: "pass" },
    { id: 1003, name: "Omar Hassan", quarterGrade: 18, finalGrade: 20, status: "fail" },
  ],
  102: [
    { id: 1004, name: "Nadia Adel", quarterGrade: 23, finalGrade: 20, status: "pass" },
    { id: 1005, name: "Khaled Farid", quarterGrade: 19, finalGrade: 20, status: "fail" },
  ],
  201: [
    { id: 2001, name: "Mona Sami", quarterGrade: 25, finalGrade: 20, status: "pass" },
    { id: 2002, name: "Youssef Ali", quarterGrade: 21, finalGrade: 20, status: "pass" },
  ],
};

/**
 * Get students for specific class
 */
export function getMockStudentsForClass(classId: number | string): TeacherStudent[] {
  const id = typeof classId === "string" ? parseInt(classId, 10) : classId;
  return mockTeacherStudents[id] ?? [];
}