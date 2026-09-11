/** Academic year key used in API (e.g. junior, senior, wheeler) */
export type StudentYearKey = "junior" | "senior" | "wheeler";

export interface YearOption {
  id: StudentYearKey;
  number: string;
  title: string;
}

export interface StudentProfileData {
  studentId: number;
  userId?: number;
  studentCode: string;
  nationalId: string;
  name: string;
  nameArabic?: string;
  email?: string;
  phone?: string;
  year: string;
  currentAcademicYear: StudentYearKey;
  academicYearName: string;
  className: string;
  section?: string;
  departmentName: string;
  majorName: string;
  address: string;
  addressArabic?: string;
  fatherName?: string;
  fatherPhone?: string;
  relativeName?: string;
  relativePhone?: string;
  enrollmentDate?: string;
  status: string;
  subtitle: string;
  totalEnrolledSubjects: number;
  completedCompetencies: number;
  totalCompetencies: number;
  overallPercentage?: number;
}

export interface UpdateStudentContactData {
  phone?: string;
  address?: string;
  addressArabic?: string;
  relativeName?: string;
  relativePhone?: string;
}

export interface StudentQuizItem {
  quizId: number;
  title: string;
  score?: number;
  maxScore: number;
  quizDate: string;
  notes?: string;
}

export interface QuarterGradeRow {
  subjectId?: number;
  subject: string;
  subjectArabic?: string;
  subjectCode?: string;
  quarter1?: number | null;
  quarter2?: number | null;
  quarter3?: number | null;
  quarter4?: number | null;
  maxQ1?: number;
  maxQ2?: number;
  maxQ3?: number;
  maxQ4?: number;
  maxQuarter?: number;
  courseworkTotal?: number | null;
  yourGrade?: number | null;
  quarterGrade?: number | null;
  percentage?: number | null;
  quizzes?: StudentQuizItem[];
}

export interface QuarterGradesResponse {
  grades: QuarterGradeRow[];
  year: StudentYearKey;
  academicYearName?: string;
  availableTerms?: number[];
  selectedTerm?: number;
  averageGrade?: string | null;
}

export interface FinalGradeRow {
  subjectId?: number;
  subject: string;
  subjectArabic?: string;
  subjectCode?: string;
  termId?: number;
  termName?: string;
  creditHours?: number;
  courseworkScore?: number | null;
  finalExamScore?: number | null;
  totalScore?: number | null;
  maxScore?: number;
  percentage?: number | null;
  letterGrade?: string | null;
  status?: string;
  isApproved?: boolean;
  yourGrade?: number | null;
  quarterGrade?: number | null;
}

export interface FinalGradesResponse {
  grades: FinalGradeRow[];
  year: StudentYearKey;
  academicYearName?: string;
  cumulativeAverage?: number;
  totalEarnedScore?: number;
  totalMaxScore?: number;
  totalSubjects?: number;
  passedSubjects?: number;
  standing?: string;
  averageGrade?: string | null;
}

export interface CompetencyAttemptHistory {
  attemptId: number;
  attemptNumber: number;
  result: string;
  evaluatedAt?: string;
  evaluatedByName?: string;
}

export interface JadaratGradeRow {
  competencyId?: number;
  jadarat?: string;
  Jadarat: string;
  majorName?: string;
  currentStatus?: string;
  currentAttempt?: number;
  maxAttempts?: number;
  lastEvaluatedAt?: string;
  evaluatorName?: string;
  Your_Attemps: string;
  Attemps: string;
  attemptHistory?: CompetencyAttemptHistory[];
}

export interface JadaratGradesResponse {
  grades: JadaratGradeRow[];
  year: StudentYearKey;
  academicYearName?: string;
  totalCompetencies?: number;
  passedCompetencies?: number;
  pendingCompetencies?: number;
  averageGrade?: string;
}

export interface StudentEnrolledTeacher {
  subjectId: number;
  subjectName: string;
  subjectCode?: string;
  teacherName: string;
  teacherEmail?: string;
}

export interface StudentEnrollmentDetails {
  studentId: number;
  classId?: number;
  className: string;
  section: string;
  academicYearName: string;
  stage: string;
  teachers: StudentEnrolledTeacher[];
}
