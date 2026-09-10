export type CohortStage = "junior" | "wheeler" | "senior";

export interface ClassCohortSummary {
  stage: CohortStage;
  stageName: string;
  academicYearId: number;
  academicYearName: string;
  classCount: number;
  totalStudents: number;
  totalCapacity: number;
}

export interface ClassItem {
  classId: number;
  className: string;
  departmentId?: number;
  departmentName?: string;
  capacity: number;
  studentCount: number;
  isActive: boolean;
  academicYearId?: number;
  academicYearName?: string;
  stage?: string;
}

export interface ClassTeacherAssignment {
  teacherId: number;
  teacherName: string;
  subjectId: number;
  subjectName: string;
}

export interface ClassStudent {
  studentId: number;
  userId?: number;
  studentCode: string;
  nationalId: string;
  fullName: string;
  firstName: string;
  middleName: string;
  lastName: string;
  email: string;
  phone: string;
  gender: string;
  address: string;
  status: string;
  enrollmentDate?: string;
}

export interface ClassDetails {
  classId: number;
  className: string;
  departmentId?: number;
  departmentName?: string;
  capacity: number;
  studentCount: number;
  isActive: boolean;
  academicYearId?: number;
  academicYearName?: string;
  stage?: string;
  teachers: ClassTeacherAssignment[];
  students: ClassStudent[];
}

export interface CreateClassPayload {
  yearId: string;
  stage?: CohortStage;
  department: string;
  className: string;
  capacity?: number;
}

export interface UpdateClassPayload {
  className: string;
  department: string;
  capacity: number;
  isActive: boolean;
}

export interface CreateStudentInClassPayload {
  firstName: string;
  middleName?: string;
  lastName: string;
  studentCode: string;
  email: string;
  phone?: string;
  address?: string;
  department: string;
  year: CohortStage;
  classId: number;
  academicYearName?: string;
}

export interface UpdateStudentPayload {
  firstName: string;
  middleName?: string;
  lastName: string;
  studentCode: string;
  email: string;
  phone?: string;
  address?: string;
  department: string;
  year: CohortStage;
  classId?: number;
}
