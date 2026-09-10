import enA11y from "./en/a11y.json";
import enAbout from "./en/about.json";
import enAcademicYears from "./en/academicYears.json";
import enAnalytics from "./en/analytics.json";
import enAuth from "./en/auth.json";
import enCommon from "./en/common.json";
import enDashboards from "./en/dashboards.json";
import enGradeSelection from "./en/gradeSelection.json";
import enHome from "./en/home.json";
import enModal from "./en/modal.json";
import enNotifications from "./en/notifications.json";
import enQuarterEntry from "./en/quarterEntry.json";
import enRankings from "./en/rankings.json";
import enStudents from "./en/students.json";
import enTeacherModule from "./en/teacherModule.json";
import enTeachers from "./en/teachers.json";
import enVice from "./en/vice.json";
import enViceDashboard from "./en/viceDashboard.json";
import enViceGrades from "./en/viceGrades.json";
import enAccounts from "./en/accounts.json";
import enClasses from "./en/classes.json";
import arA11y from "./ar/a11y.json";
import arAbout from "./ar/about.json";
import arAcademicYears from "./ar/academicYears.json";
import arAnalytics from "./ar/analytics.json";
import arAuth from "./ar/auth.json";
import arCommon from "./ar/common.json";
import arDashboards from "./ar/dashboards.json";
import arGradeSelection from "./ar/gradeSelection.json";
import arHome from "./ar/home.json";
import arModal from "./ar/modal.json";
import arNotifications from "./ar/notifications.json";
import arQuarterEntry from "./ar/quarterEntry.json";
import arRankings from "./ar/rankings.json";
import arStudents from "./ar/students.json";
import arTeacherModule from "./ar/teacherModule.json";
import arTeachers from "./ar/teachers.json";
import arVice from "./ar/vice.json";
import arViceDashboard from "./ar/viceDashboard.json";
import arViceGrades from "./ar/viceGrades.json";
import arAccounts from "./ar/accounts.json";
import arClasses from "./ar/classes.json";

const en = {
  ...enA11y,
  ...enAbout,
  ...enAcademicYears,
  ...enAnalytics,
  ...enAuth,
  ...enCommon,
  ...enDashboards,
  ...enGradeSelection,
  ...enHome,
  ...enModal,
  ...enNotifications,
  ...enQuarterEntry,
  ...enRankings,
  ...enStudents,
  ...enTeacherModule,
  ...enTeachers,
  ...enVice,
  ...enViceDashboard,
  ...enViceGrades,
  ...enAccounts,
  ...enClasses,
};

const ar: typeof en = {
  ...arA11y,
  ...arAbout,
  ...arAcademicYears,
  ...arAnalytics,
  ...arAuth,
  ...arCommon,
  ...arDashboards,
  ...arGradeSelection,
  ...arHome,
  ...arModal,
  ...arNotifications,
  ...arQuarterEntry,
  ...arRankings,
  ...arStudents,
  ...arTeacherModule,
  ...arTeachers,
  ...arVice,
  ...arViceDashboard,
  ...arViceGrades,
  ...arAccounts,
  ...arClasses,
};

export const messages = { en, ar } as const;

export type AppMessages = typeof en;
