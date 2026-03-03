import { StudentCardApi } from "@/types/Student-api/Student-api";

export const studentCardsApi: StudentCardApi[] = [
  {
    id: 1,
    title: "Quarter Grades",
    description: "View your quarterly performance across all subjects.",
    route: "/student/quarter",
  },
  {
    id: 2,
    title: "Final Grades",
    description: "View your semester final exam grades.",
    route: "/student/final",
  },
  {
    id: 3,
    title: "Competencies Grades",
    description: "View your specialization competency grades.",
    route: "/student/jadarat",
  },
];