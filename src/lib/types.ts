export type Role = "teacher" | "admin";

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  role: Role;
  createdAt: string;
  photo?: string;
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

/**
 * One position in a class. Usually a single asana; when asanaSlugs has
 * more than one entry, they're progressions of the same slot -
 * repetitions applies once to the whole slot, and only
 * primaryAsanaSlug's durationSeconds counts toward class duration.
 */
export interface ClassSlot {
  id: string;
  asanaSlugs: string[];
  primaryAsanaSlug: string;
  repetitions: number;
}

export interface ClassDraft {
  id: string;
  teacherId: string;
  status: ClassStatus;
  name: string;
  durationMinutes: number;
  level: ClassLevel;
  series?: string;
  classType: string;
  focus?: string;
  notes?: string;
  slots: ClassSlot[];
  createdAt: string;
  updatedAt: string;
}
