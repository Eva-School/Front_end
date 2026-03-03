import { TeacherSubject } from "@/types/Teacher-api/teacher-api";

// Fallback data when API fails
export const teacherCardsFallback: TeacherSubject[] = [
  {
    id: 1,
    title: "Junior",
    subjectName: "Mathematics",
    year: "junior",
    route: "/teacher/classes",
  },
  {
    id: 2,
    title: "Wheeler",
    subjectName: "Physics",
    year: "wheeler",
    route: "/teacher/classes",
  },
  {
    id: 3,
    title: "Senior",
    subjectName: "Chemistry",
    year: "senior",
    route: "/teacher/classes",
  },
];