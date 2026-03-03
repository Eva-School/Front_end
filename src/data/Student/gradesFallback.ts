import type { QuarterGradeRow, FinalGradeRow, JadaratGradeRow } from "@/types/Student-api/grades";

export const quarterGradesFallback: QuarterGradeRow[] = [
  { subject: "Mathematics", yourGrade: 25, quarterGrade: 25 },
  { subject: "Physics", yourGrade: 20, quarterGrade: 22 },
  { subject: "Chemistry", yourGrade: 18, quarterGrade: 20 },
  { subject: "Biology", yourGrade: 23, quarterGrade: 24 },
  { subject: "History", yourGrade: 19, quarterGrade: 21 },
  { subject: "English", yourGrade: 22, quarterGrade: 23 },
  { subject: "Geography", yourGrade: 21, quarterGrade: 22 },
  { subject: "Art", yourGrade: 24, quarterGrade: 24 },
  { subject: "Music", yourGrade: 23, quarterGrade: 23 },
  { subject: "PE", yourGrade: 20, quarterGrade: 21 },
  { subject: "Computer Science", yourGrade: 25, quarterGrade: 25 },
  { subject: "Economics", yourGrade: 19, quarterGrade: 20 },
  { subject: "Philosophy", yourGrade: 18, quarterGrade: 19 },
  { subject: "Literature", yourGrade: 22, quarterGrade: 23 },
];

export const finalGradesFallback: FinalGradeRow[] = quarterGradesFallback;

export const jadaratGradesFallback: JadaratGradeRow[] = [
  { Jadarat: "API", Your_Attemps: "Fail", Attemps: "Attemp-one" },
  { Jadarat: "Multi-media", Your_Attemps: "Pass", Attemps: "Attemp-two" },
  { Jadarat: "Flutter", Your_Attemps: "Pass", Attemps: "Attemp-one" },
];

export const averageGradeFallback = "80%";
