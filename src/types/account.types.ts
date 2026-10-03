export type UserRole = "Admin" | "StudentAffairs" | "Teacher" | "Student";

export interface RoleOption {
  roleId: number;
  roleName: string;
  normalizedName: string;
  description?: string;
}

export interface AccountSummary {
  userId: number;
  username: string;
  fullName: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  email?: string;
  phoneNumber?: string;
  role: string;
  normalizedRole: UserRole;
  roleId: number;
  isActive: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

export interface TeacherProfile {
  teacherId: number;
  departmentId?: number;
  departmentName?: string;
  qualifications?: string;
  employeeCode?: string;
  hireDate?: string;
  isActive: boolean;
}

export interface StudentProfile {
  studentId: number;
  studentCode?: string;
  nationalId?: string;
  gender?: string;
  enrollmentDate?: string;
  status?: string;
  departmentId?: number;
  departmentName?: string;
  currentAcademicYearId?: number;
  academicYearName?: string;
  classId?: number;
  className?: string;
  address?: string;
}

export interface AccountDetail extends AccountSummary {
  emailConfirmed: boolean;
  phoneNumberConfirmed: boolean;
  twoFactorEnabled: boolean;
  lockoutEnd?: string;
  accessFailedCount: number;
  teacherProfile?: TeacherProfile;
  studentProfile?: StudentProfile;
}

export interface AccountListQuery {
  search?: string;
  role?: string;
  isActive?: boolean;
  pageNumber?: number;
  pageSize?: number;
  sortBy?: string;
  sortDescending?: boolean;
}

export interface AccountPagedResult<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface CreateAccountPayload {
  username?: string;
  email: string;
  password?: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  phoneNumber?: string;
  role: string;
  // Teacher-specific
  departmentId?: number;
  qualifications?: string;
  // Student-specific
  nationalId?: string;
  studentCode?: string;
  gender?: string;
  academicYearId?: number;
  classId?: number;
  address?: string;
}

export interface CreateAccountResult {
  account: AccountDetail;
  generatedInitialPassword?: string;
}

export interface UpdateAccountProfilePayload {
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  departmentId?: number;
  qualifications?: string;
  nationalId?: string;
  studentCode?: string;
  gender?: string;
  academicYearId?: number;
  classId?: number | null;
  address?: string;
}

export interface ChangeUserRolePayload {
  newRole: string;
  departmentId?: number;
  qualifications?: string;
  nationalId?: string;
  studentCode?: string;
  gender?: string;
  academicYearId?: number;
  classId?: number;
  address?: string;
}

export interface SetAccountStatusPayload {
  isActive: boolean;
}

export interface ResetPasswordPayload {
  newPassword: string;
}

export interface AcademicYearOption {
  academicYearId: number;
  yearName: string;
  stage: string;
  isActive: boolean;
}

export interface ClassOption {
  classId: number;
  className: string;
  academicYearId?: number | null;
  academicYearName: string;
  stage: string;
  departmentId?: number | null;
  departmentName?: string | null;
  capacity?: number | null;
  currentStudentCount: number;
}

export interface DepartmentOption {
  departmentId: number;
  departmentName: string;
  isActive: boolean;
}

export interface AccountFormOptions {
  roles: RoleOption[];
  academicYears: AcademicYearOption[];
  classes: ClassOption[];
  departments: DepartmentOption[];
}

export interface UncredentialedAccountSummary {
  key: string;
  accountType: "Student" | "Teacher" | "User";
  entityId: number;
  userId?: number | null;
  fullName: string;
  nameArabic?: string | null;
  nameEnglish?: string | null;
  identifier: string;
  nationalId?: string | null;
  email?: string | null;
  registeredEmail?: string | null;
  hasRegisteredEmail?: boolean;
  phoneNumber?: string | null;
  role: string;
  departmentName?: string | null;
  className?: string | null;
  academicYearName?: string | null;
  missingReason: "NoUserAccount" | "NoPassword";
  createdAt?: string | null;
}

export interface UncredentialedAccountListQuery {
  search?: string;
  accountType?: string;
  departmentId?: number;
  academicYearId?: number;
  pageNumber?: number;
  pageSize?: number;
  sortBy?: string;
  sortDescending?: boolean;
}

export interface UncredentialedStats {
  totalCount: number;
  studentCount: number;
  teacherCount: number;
  userCount: number;
}

export interface CreateCredentialsForExistingPayload {
  accountType: "Student" | "Teacher" | "User" | string;
  entityId: number;
  username?: string;
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
}

export interface CreateCredentialsResult {
  userId: number;
  username: string;
  email: string;
  generatedPassword: string;
  fullName: string;
  role: string;
  accountType: string;
  entityId: number;
}

export interface BatchCredentialItemRequest {
  accountType: string;
  entityId: number;
  customUsername?: string;
  customEmail?: string;
}

export interface BatchCreateCredentialsPayload {
  items: BatchCredentialItemRequest[];
  autoGenerateEmailIfMissing?: boolean;
  prioritizeExistingRegisteredEmail?: boolean;
  defaultEmailDomain?: string;
}

export interface BatchCredentialItemResult {
  key: string;
  accountType: string;
  entityId: number;
  userId?: number | null;
  fullName: string;
  identifier: string;
  username: string;
  email: string;
  generatedPassword: string;
  role: string;
  succeeded: boolean;
  error?: string | null;
}

export interface BatchCreateCredentialsResult {
  totalRequested: number;
  successCount: number;
  failureCount: number;
  credentials: BatchCredentialItemResult[];
  errors: string[];
}

