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
  username: string;
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
