"use client";

export type ViceLevel = "junior" | "wheeler" | "senior";
export type ViceDepartment = "OM" | "SD";

export interface ViceStudent {
  id: string;
  studentCode: string;
  name: string;
  department: ViceDepartment;
  className: string;
  year: ViceLevel;
}

export interface CreateViceStudentPayload {
  firstName: string;
  middleName?: string;
  lastName: string;
  studentCode: string;
  email: string;
  phone: string;
  department: ViceDepartment;
  year: ViceLevel;
  classId?: number;
}

export interface CreateClassPayload {
  yearId: string;
  stage: ViceLevel;
  department: ViceDepartment;
  className: string;
}
