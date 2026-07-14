import type {
  TeacherSubject,
  TeacherProfileResponse,
  TeacherClassesResponse,
  TeacherStudent,
} from "@/types/Teacher-api/teacher-api";
import { API_BASE_URL, secureFetch } from "@/config/api.config";

interface ApiSubject {
  subjectId?: number;
  id?: number;
  subjectName?: string;
  name?: string;
  stage?: string;
}

interface ApiClass {
  classId?: number | string;
  id?: number | string;
  className?: string;
  name?: string;
  studentCount?: number;
}

interface ApiStudent {
  studentId?: number | string;
  id?: number | string;
  studentName?: string;
  fullName?: string;
  name?: string;
  q1?: number;
  q2?: number;
  q3?: number;
  q4?: number;
  teacherGrade?: number;
  quarterGrade?: number;
  finalGrade?: number;
  status?: "pass" | "fail";
}

interface AuthMeResponse {
  userId?: number | string;
  username?: string;
  fullName?: string;
}

const KNOWN_LEVELS = ["junior", "wheeler", "senior"] as const;

const mapStageToTeacherYear = (stage: string | undefined): TeacherSubject["year"] => {
  if (!stage) return "junior";
  const lower = stage.toLowerCase();
  if (lower.includes("wheeler")) return "wheeler";
  if (lower.includes("senior")) return "senior";
  return "junior";
};

export interface TeacherDashboardYear {
  yearId: string;
  classes: { classId: string; className: string }[];
}

interface TeacherDashboardRow {
  yearId?: string;
  stage?: string;
  classId?: string | number;
  className?: string;
  classes?: Array<{ classId?: string | number; className?: string }>;
}

type ApiRecord = Record<string, unknown>;

const isApiRecord = (value: unknown): value is ApiRecord =>
  typeof value === "object" && value !== null;

const getApiRecordList = (value: unknown, keys: string[]): ApiRecord[] => {
  if (Array.isArray(value)) return value.filter(isApiRecord);
  if (!isApiRecord(value)) return [];
  for (const key of keys) {
    const candidate = value[key];
    if (Array.isArray(candidate)) return candidate.filter(isApiRecord);
  }
  return [];
};

const getIdentifier = (value: unknown, fallback: string | number = 0): string | number =>
  typeof value === "string" || typeof value === "number" ? value : fallback;

const getString = (value: unknown, fallback: string): string =>
  typeof value === "string" ? value : fallback;

const isNotFoundError = (error: unknown): boolean =>
  error instanceof Error && error.message.includes("HTTP 404");

const tryFetchDashboardRows = async (): Promise<TeacherDashboardRow[] | null> => {
  const candidatePaths = [
    "/TeacherAssignments/MyDashboard",
    "/TeacherAssignments/my-dashboard",
    "/TeacherAssignments/TeacherDashboard",
  ];

  for (const path of candidatePaths) {
    try {
      const payload = await secureFetch(`${API_BASE_URL}${path}`);
      if (Array.isArray(payload)) return payload as TeacherDashboardRow[];
      if (payload && typeof payload === "object") {
        const wrappedRows = (payload as { data?: unknown; assignments?: unknown; value?: unknown }).data
          ?? (payload as { assignments?: unknown }).assignments
          ?? (payload as { value?: unknown }).value;
        if (Array.isArray(wrappedRows)) return wrappedRows as TeacherDashboardRow[];
        if (Array.isArray(payload)) return payload as TeacherDashboardRow[];
      }
      return Array.isArray(payload) ? payload : [];
    } catch (error) {
      if (isNotFoundError(error)) continue;
      throw error;
    }
  }

  return null;
};

const normalizeDashboardRows = (rows: TeacherDashboardRow[]): TeacherDashboardYear[] => {
  const levelsMap = new Map<string, Map<string, string>>();
  levelsMap.set("junior", new Map());
  levelsMap.set("wheeler", new Map());
  levelsMap.set("senior", new Map());

  rows.forEach((row) => {
    if (Array.isArray(row.classes)) {
      row.classes.forEach((cls) => {
        const classId = String(cls.classId ?? "").trim();
        const className = (cls.className ?? "").trim();
        if (classId && className) {
          const lowerName = className.toLowerCase();
          if (lowerName.includes("wheeler")) levelsMap.get("wheeler")!.set(classId, className);
          else if (lowerName.includes("senior")) levelsMap.get("senior")!.set(classId, className);
          else levelsMap.get("junior")!.set(classId, className);
        }
      });
    }

    const directClassId = String(row.classId ?? "").trim();
    const directClassName = (row.className ?? "").trim();
    if (directClassId && directClassName) {
      const lowerName = directClassName.toLowerCase();
      if (lowerName.includes("wheeler")) levelsMap.get("wheeler")!.set(directClassId, directClassName);
      else if (lowerName.includes("senior")) levelsMap.get("senior")!.set(directClassId, directClassName);
      else levelsMap.get("junior")!.set(directClassId, directClassName);
    }
  });

  return Array.from(levelsMap.entries())
    .filter(([, classMap]) => classMap.size > 0)
    .map(([level, classMap]) => ({
      yearId: level,
      classes: Array.from(classMap.entries()).map(([classId, className]) => ({
        classId,
        className,
      })),
    }));
};

export async function getTeacherDashboardYears(): Promise<TeacherDashboardYear[]> {
  const rows = await tryFetchDashboardRows();
  if (!rows) {
    throw new Error(
      "Teacher dashboard endpoint is not available yet. Expected: GET /api/TeacherAssignments/MyDashboard"
    );
  }
  return normalizeDashboardRows(rows);
}

/** Fetch subjects assigned to the current teacher for a given year/level */
export async function getTeacherSubjectsByYear(year: string): Promise<TeacherSubject[]> {
  // Try the dedicated teacher endpoint first
  const candidatePaths = [
    `/teacher/subjects?year=${encodeURIComponent(year)}`,
    `/teacher/subjects`,
    `/Subjects?year=${encodeURIComponent(year)}`,
  ];

  let rawData: ApiSubject[] = [];
  for (const path of candidatePaths) {
    try {
      const payload = await secureFetch(`${API_BASE_URL}${path}`);
      if (Array.isArray(payload)) { rawData = payload as ApiSubject[]; break; }
      if (payload && typeof payload === "object") {
        const inner = (payload as { value?: unknown; data?: unknown }).value
          ?? (payload as { data?: unknown }).data;
        if (Array.isArray(inner)) { rawData = inner as ApiSubject[]; break; }
      }
    } catch (e) {
      if (isNotFoundError(e)) continue;
      throw e;
    }
  }

  return rawData.map((subject, index) => {
    const subjectId = Number(subject.subjectId ?? subject.id ?? index + 1);
    const subjectName = (subject.subjectName ?? subject.name ?? "Unknown Subject").trim();
    const stage = subject.stage ?? year;
    return {
      id: Number.isFinite(subjectId) ? subjectId : index + 1,
      title: subjectName,
      subjectName,
      year: mapStageToTeacherYear(stage),
    };
  });
}

export async function getTeacherSubjects(): Promise<TeacherSubject[]> {
  const results = await Promise.all(
    KNOWN_LEVELS.map(async (level) => {
      const data = (await secureFetch(
        `${API_BASE_URL}/Subjects?year=${encodeURIComponent(level)}`
      )) as ApiSubject[];
      return Array.isArray(data) ? data : [];
    })
  );

  const merged = results.flat();
  return merged.map((subject, index) => {
    const subjectId = Number(subject.subjectId ?? subject.id ?? index + 1);
    const subjectName = (subject.subjectName ?? subject.name ?? "Unknown Subject").trim();
    const stage = subject.stage ?? KNOWN_LEVELS[0];
    return {
      id: Number.isFinite(subjectId) ? subjectId : index + 1,
      title: subjectName,
      subjectName,
      year: mapStageToTeacherYear(stage),
      route: `/teacher/classes?year=${encodeURIComponent(stage)}&subject=${encodeURIComponent(
        String(subjectId)
      )}`,
    };
  });
}

export async function getTeacherProfile(): Promise<TeacherProfileResponse> {
  try {
    const me = (await secureFetch(`${API_BASE_URL}/Auth/me`)) as AuthMeResponse;
    const displayName = me?.fullName?.trim() || me?.username?.trim() || "Teacher";
    return {
      name: displayName,
      subtitle: "Manage your subjects and classes",
      currentAcademicYear: "junior",
    };
  } catch {
    return {
      name: "Teacher",
      subtitle: "Manage your subjects and classes",
      currentAcademicYear: "junior",
    };
  }
}

/**
 * Fetch all classes for a teacher given a year/level, grouped by subject.
 * Returns a list of { subject, classes[] } using the dedicated teacher endpoint.
 */
export interface SubjectWithClasses {
  subjectId: number;
  subjectName: string;
  classes: { classId: number | string; className: string }[];
}

export async function getTeacherClassesGrouped(year: string): Promise<SubjectWithClasses[]> {
  // First, get the subjects for this year
  let subjects: TeacherSubject[] = [];
  try {
    subjects = await getTeacherSubjectsByYear(year);
  } catch {
    // Ignore error, we will try the fallback
  }

  // If we have subjects, fetch classes for each subject
  if (subjects.length > 0) {
    const grouped: SubjectWithClasses[] = [];
    for (const sub of subjects) {
      try {
        const payload = await secureFetch(
          `${API_BASE_URL}/teacher/classes?year=${encodeURIComponent(year)}&subject=${encodeURIComponent(sub.subjectName)}`
        );
        const classes = getApiRecordList(payload, ["value", "data", "classes"]);

        if (classes.length > 0) {
          grouped.push({
            subjectId: sub.id,
            subjectName: sub.subjectName,
            classes: classes.map((cls) => ({
              classId: getIdentifier(cls.classId ?? cls.id),
              className: getString(cls.className ?? cls.name, "Unknown Class")
            }))
          });
        }
      } catch {
         // If a specific subject fails (e.g. 404 or 400), we just skip it and continue to the next
      }
    }
    
    // If we successfully grouped by subject, return it
    if (grouped.length > 0) return grouped;
  }
  
  // FALLBACK: If the above failed or returned empty (e.g. backend classes endpoint broken), parse MyDashboard
  try {
    const rows = await tryFetchDashboardRows();
    if (rows) {
      const classesForYear: Array<{ classId?: string | number; className?: string }> = [];
      const seenClasses = new Set<string>();

      rows.forEach(row => {
        if (Array.isArray(row.classes)) {
          row.classes.forEach(cls => {
             const name = (cls.className || "").toLowerCase();
             const classId = String(cls.classId ?? "");
             if (seenClasses.has(classId)) return;
             
             let matchesYear = false;
             if (year === "wheeler" && name.includes("wheeler")) matchesYear = true;
             else if (year === "senior" && name.includes("senior")) matchesYear = true;
             else if (year === "junior" && !name.includes("wheeler") && !name.includes("senior")) matchesYear = true;

             if (matchesYear) {
               classesForYear.push(cls);
               seenClasses.add(classId);
             }
          });
        }
      });

      if (classesForYear.length > 0) {
        // We don't know the exact subject mapping, so we return under a generic "Assigned Classes" or the first subject name
        return [{
          subjectId: subjects[0]?.id ?? 0,
          subjectName: subjects[0]?.subjectName ?? "Assigned Classes",
          classes: classesForYear.map(cls => ({
            classId: getIdentifier(cls.classId),
            className: getString(cls.className, "Unknown Class")
          }))
        }];
      }
    }
  } catch {
    // Ignore fallback errors
  }

  return [];
}

/**
 * Fetch classes list for a specific year and subject from API.
 */
export async function getTeacherClasses(
  year: string,
  subjectId?: string | number
): Promise<TeacherClassesResponse> {
  const candidatePaths = subjectId
    ? [
        `/teacher/classes?year=${encodeURIComponent(year)}&subject=${encodeURIComponent(subjectId)}`,
        `/Classes?yearId=${encodeURIComponent(year)}&subject=${encodeURIComponent(subjectId)}`,
      ]
    : [
        `/teacher/classes?year=${encodeURIComponent(year)}`,
        `/Classes?yearId=${encodeURIComponent(year)}`,
      ];

  for (const path of candidatePaths) {
    try {
      const payload = await secureFetch(`${API_BASE_URL}${path}`);
      const classesData = Array.isArray(payload)
        ? (payload as ApiClass[])
        : Array.isArray((payload as { value?: unknown }).value)
        ? ((payload as { value: ApiClass[] }).value)
        : [];

      return {
        classes: classesData.map((cls) => ({
          id: cls.classId ?? cls.id ?? "",
          className: cls.className ?? cls.name ?? "Unnamed Class",
          studentCount: cls.studentCount,
        })),
        year,
        subjectName: "",
      };
    } catch (e) {
      if (isNotFoundError(e)) continue;
      throw e;
    }
  }

  return { classes: [], year, subjectName: "" };
}

/**
 * Fetch students for a given class.
 */
export async function getClassStudents(
  classId: string | number
): Promise<{ students: TeacherStudent[] }> {
  const candidatePaths = [
    `/teacher/students?classId=${encodeURIComponent(classId.toString())}`,
    `/Students?classId=${encodeURIComponent(classId.toString())}`,
  ];

  for (const path of candidatePaths) {
    try {
      const payload = await secureFetch(`${API_BASE_URL}${path}`);
      let raw: ApiStudent[] = [];
      if (Array.isArray(payload)) raw = payload as ApiStudent[];
      else if (payload && typeof payload === "object") {
        const inner = (payload as { students?: unknown; value?: unknown; data?: unknown }).students
          ?? (payload as { value?: unknown }).value
          ?? (payload as { data?: unknown }).data;
        if (Array.isArray(inner)) raw = inner as ApiStudent[];
      }

      return {
        students: raw.map((s) => ({
          id: s.studentId ?? s.id ?? 0,
          name: s.studentName ?? s.fullName ?? s.name ?? "Unknown",
          q1: s.q1,
          q2: s.q2,
          q3: s.q3,
          q4: s.q4,
          teacherGrade: s.teacherGrade ?? s.quarterGrade,
          finalGrade: s.finalGrade,
          status: s.status,
        })),
      };
    } catch (e) {
      if (isNotFoundError(e)) continue;
      throw e;
    }
  }
  return { students: [] };
}

export interface SaveGradePayload {
  classId: string | number;
  studentId: string | number;
  q1?: number;
  q2?: number;
  q3?: number;
  q4?: number;
  grade?: number;
  subjectId?: string | number;
}

/**
 * Save grades for a student using the teacher grades endpoint.
 */
export async function saveStudentGrade(
  classId: string | number,
  studentId: string | number,
  grade: number,
  extras?: { q1?: number; q2?: number; q3?: number; q4?: number; subjectId?: string | number }
): Promise<void> {
  const payload = {
    classId: Number(classId),
    studentId: Number(studentId),
    grade,
    ...extras,
  };

  const candidatePaths = ["/teacher/grades", "/Grades"];
  for (const path of candidatePaths) {
    try {
      await secureFetch(`${API_BASE_URL}${path}`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      return;
    } catch (e) {
      if (isNotFoundError(e)) continue;
      throw e;
    }
  }
}

/** Push a notification to the local Next.js notification store */
export async function pushNotification(notification: {
  type: "grade" | "announcement" | "system" | "reminder";
  title: string;
  message: string;
  priority: "low" | "medium" | "high";
  targetRole?: string;
}): Promise<void> {
  try {
    await secureFetch("/api/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(notification),
    });
  } catch {
    // Notifications are non-critical — silently fail
  }
}

export const teacherService = {
  getTeacherDashboardYears,
  getTeacherSubjects,
  getTeacherSubjectsByYear,
  getTeacherClassesGrouped,
  getTeacherProfile,
  getTeacherClasses,
  getClassStudents,
  saveStudentGrade,
  pushNotification,
};
