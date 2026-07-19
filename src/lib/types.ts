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
