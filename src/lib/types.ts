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

export interface Asana {
  slug: string;
  name: string;
  sanskritName: string;
  otherNames: string[];
  musclesInvolved: string[];
  series: string[];
  durationSeconds: number;
  assists: string[];
  image: string;
  verified: boolean;
  description?: string;
  notes?: string;
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
