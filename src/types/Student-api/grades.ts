/** Academic year key used in API (e.g. junior, senior, wheeler) */
export type StudentYearKey = "junior" | "senior" | "wheeler";

export interface YearOption {
  id: StudentYearKey;
  number: string;
  title: string;
}

export interface QuarterGradeRow {
  subject: string;
  yourGrade: number;
  quarterGrade: number;
}

export interface FinalGradeRow {
  subject: string;
  yourGrade: number;
  quarterGrade: number;
}

export interface JadaratGradeRow {
  Jadarat: string;
  Your_Attemps: string;
  Attemps: string;
}

export interface QuarterGradesResponse {
  grades: QuarterGradeRow[];
  averageGrade: string;
  year: StudentYearKey;
}

export interface FinalGradesResponse {
  grades: FinalGradeRow[];
  averageGrade: string;
  year: StudentYearKey;
}

export interface JadaratGradesResponse {
  grades: JadaratGradeRow[];
  averageGrade?: string;
  year: StudentYearKey;
}
