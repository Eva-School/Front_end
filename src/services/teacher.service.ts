import { API_BASE_URL, secureFetch } from "@/config/api.config";
import type { TeacherProfileResponse, TeacherStudent } from "@/types/Teacher-api/teacher-api";

interface ApiClass {
  classId: number;
  className: string;
}

interface ApiDashboardYear {
  yearId: string;
  classes: ApiClass[];
}

interface ApiSubject {
  id: number;
  subjectName: string;
}

interface ApiSubjectGroup {
  year: string;
  stage: string;
  subjects: ApiSubject[];
}

interface ApiTeacherStudent {
  studentId: number;
  studentName: string;
  subjectId: number;
  subjectName: string;
  q1?: number;
  q2?: number;
  q3?: number;
  q4?: number;
  finalGrade?: number;
  maxQ1?: number;
  maxQ2?: number;
  maxQ3?: number;
  maxQ4?: number;
  status?: string;
}

export interface TeacherDashboardYear {
  yearId: string;
  classes: ApiClass[];
}

export interface SubjectWithClasses {
  subjectId: number;
  subjectName: string;
  classes: ApiClass[];
}

const toNumber = (value: number | string): number => {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) throw new Error("A valid identifier is required.");
  return parsed;
};

export async function getTeacherDashboardYears(): Promise<TeacherDashboardYear[]> {
  const payload = await secureFetch(`${API_BASE_URL}/TeacherAssignments/MyDashboard`);
  if (!Array.isArray(payload)) throw new Error("Invalid teacher dashboard response.");
  return (payload as ApiDashboardYear[]).map((year) => ({
    yearId: year.yearId,
    classes: Array.isArray(year.classes) ? year.classes : [],
  }));
}

export async function getTeacherProfile(): Promise<TeacherProfileResponse> {
  return (await secureFetch(`${API_BASE_URL}/teacher/profile`)) as TeacherProfileResponse;
}

async function getSubjectGroups(): Promise<ApiSubjectGroup[]> {
  const payload = await secureFetch(`${API_BASE_URL}/teacher/subjects`);
  if (!Array.isArray(payload)) throw new Error("Invalid teacher subjects response.");
  return payload as ApiSubjectGroup[];
}

export async function getTeacherClassesGrouped(year: string): Promise<SubjectWithClasses[]> {
  const group = (await getSubjectGroups()).find((item) => item.year === year);
  if (!group) return [];

  const assignments = await Promise.all(
    group.subjects.map(async (subject) => {
      const query = new URLSearchParams({ year, subject: String(subject.id) });
      const payload = await secureFetch(`${API_BASE_URL}/teacher/classes?${query.toString()}`);
      return {
        subjectId: subject.id,
        subjectName: subject.subjectName,
        classes: Array.isArray(payload) ? (payload as ApiClass[]) : [],
      };
    })
  );

  return assignments.filter((item) => item.classes.length > 0);
}

export async function getClassStudents(classId: string | number, subjectId: string | number): Promise<{ students: TeacherStudent[] }> {
  const query = new URLSearchParams({ classId: String(toNumber(classId)), subjectId: String(toNumber(subjectId)) });
  const payload = await secureFetch(`${API_BASE_URL}/teacher/students?${query.toString()}`);
  if (!Array.isArray(payload)) throw new Error("Invalid student grades response.");

  return {
    students: (payload as ApiTeacherStudent[]).map((student) => ({
      id: student.studentId,
      name: student.studentName,
      q1: student.q1,
      q2: student.q2,
      q3: student.q3,
      q4: student.q4,
      finalGrade: student.finalGrade,
      maxQ1: student.maxQ1,
      maxQ2: student.maxQ2,
      maxQ3: student.maxQ3,
      maxQ4: student.maxQ4,
      status: student.status,
    })),
  };
}

export interface SaveGradePayload {
  classId: string | number;
  studentId: string | number;
  subjectId: string | number;
  q1?: number;
  q2?: number;
  q3?: number;
  q4?: number;
}

export async function saveStudentGrade(payload: SaveGradePayload): Promise<void> {
  await secureFetch(`${API_BASE_URL}/teacher/grades`, {
    method: "POST",
    body: JSON.stringify({
      classId: toNumber(payload.classId),
      studentId: toNumber(payload.studentId),
      subjectId: toNumber(payload.subjectId),
      q1: payload.q1,
      q2: payload.q2,
      q3: payload.q3,
      q4: payload.q4,
    }),
  });
}

export const teacherService = {
  getTeacherDashboardYears,
  getTeacherClassesGrouped,
  getTeacherProfile,
  getClassStudents,
  saveStudentGrade,
};
