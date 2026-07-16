import enA11y from "./en/a11y.json";
import enAbout from "./en/about.json";
import enAcademicYears from "./en/academicYears.json";
import enAuth from "./en/auth.json";
import enCommon from "./en/common.json";
import enDashboards from "./en/dashboards.json";
import enGradeSelection from "./en/gradeSelection.json";
import enHome from "./en/home.json";
import enModal from "./en/modal.json";
import enNotifications from "./en/notifications.json";
import enQuarterEntry from "./en/quarterEntry.json";
import enStudents from "./en/students.json";
import enTeacherModule from "./en/teacherModule.json";
import enTeachers from "./en/teachers.json";
import enVice from "./en/vice.json";
import enViceDashboard from "./en/viceDashboard.json";
import enViceGrades from "./en/viceGrades.json";
import arA11y from "./ar/a11y.json";
import arAbout from "./ar/about.json";
import arAcademicYears from "./ar/academicYears.json";
import arAuth from "./ar/auth.json";
import arCommon from "./ar/common.json";
import arDashboards from "./ar/dashboards.json";
import arGradeSelection from "./ar/gradeSelection.json";
import arHome from "./ar/home.json";
import arModal from "./ar/modal.json";
import arNotifications from "./ar/notifications.json";
import arQuarterEntry from "./ar/quarterEntry.json";
import arStudents from "./ar/students.json";
import arTeacherModule from "./ar/teacherModule.json";
import arTeachers from "./ar/teachers.json";
import arVice from "./ar/vice.json";
import arViceDashboard from "./ar/viceDashboard.json";
import arViceGrades from "./ar/viceGrades.json";

const en = {
  ...enA11y,
  ...enAbout,
  ...enAcademicYears,
  ...enAuth,
  ...enCommon,
  ...enDashboards,
  ...enGradeSelection,
  ...enHome,
  ...enModal,
  ...enNotifications,
  ...enQuarterEntry,
  ...enStudents,
  ...enTeacherModule,
  ...enTeachers,
  ...enVice,
  ...enViceDashboard,
  ...enViceGrades,
};

const ar: typeof en = {
  ...arA11y,
  ...arAbout,
  ...arAcademicYears,
  ...arAuth,
  ...arCommon,
  ...arDashboards,
  ...arGradeSelection,
  ...arHome,
  ...arModal,
  ...arNotifications,
  ...arQuarterEntry,
  ...arStudents,
  ...arTeacherModule,
  ...arTeachers,
  ...arVice,
  ...arViceDashboard,
  ...arViceGrades,
};

export const messages = { en, ar } as const;

export type AppMessages = typeof en;
