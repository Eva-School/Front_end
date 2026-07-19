export interface Teacher {
  id: string;
  fullName: string;
}

export interface CreateTeacherPayload {
  hireDate: string;
  department: string;
  qualifications: string;
  email: string;
  role: string;
  phone: string;
  username?: string;
  password?: string;
  fullName: {
    firstName: string;
    middleName?: string;
    lastName: string;
  };
}
