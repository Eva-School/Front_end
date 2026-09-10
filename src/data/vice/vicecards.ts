import { ViceCardApi } from "@/types/vice/vice-api";

export const viceCardsApi: ViceCardApi[] = [
  {
    id: 1,
    title: "Teacher",
    description: "Add teachers and assign them to subjects.",
    route: "/vice/teachers",
  },
  {
    id: 2,
    title: "Student",
    description: "Manage classes and student enrollment.",
    route: "/vice/students",
  },
  {
    id: 3,
    title: "Grades",
    description: "Manage quarter and final grades setup.",
    route: "/vice/grades",
  },
  {
    id: 5,
    title: "Class Management",
    description: "Manage cohorts, classes, capacities, rosters, and teacher assignments.",
    route: "/classes",
  },
];
