export type Role = "teacher" | "admin";

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  role: Role;
  createdAt: string;
}

export interface SessionPayload {
  userId: string;
  email: string;
  role: Role;
}

export type ClassLevel = "beginner" | "intermediate" | "advanced";
export type ClassStatus = "draft" | "saved";

export interface ClassAsanaEntry {
  asanaSlug: string;
  repetitions: number;
}

export interface ClassDraft {
  id: string;
  teacherId: string;
  status: ClassStatus;
  durationMinutes: number;
  level: ClassLevel;
  series?: string;
  classType: string;
  focus?: string;
  asanas: ClassAsanaEntry[];
  createdAt: string;
  updatedAt: string;
}
