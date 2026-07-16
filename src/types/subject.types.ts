export interface Subject {
  id: string;
  subjectName: string;
  stage?: string;
  yearName?: string;
}

export interface CreateSubjectPayload {
  subjectName: string;
  yearName: string;
  stage: string;
}

export interface Class {
    classId: number;
    className: string;
}
