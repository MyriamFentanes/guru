import { randomUUID } from "node:crypto";
import { readJson, writeJson } from "@/lib/storage/file-store";
import { USERS_FILE } from "@/lib/storage/paths";
import type { Role, User } from "@/lib/types";
import { hashPassword } from "@/lib/auth/password";

async function readAllUsers(): Promise<User[]> {
  return (await readJson<User[]>(USERS_FILE)) ?? [];
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const users = await readAllUsers();
  return users.find((u) => u.email.toLowerCase() === email.toLowerCase()) ?? null;
}

export async function getUserById(id: string): Promise<User | null> {
  const users = await readAllUsers();
  return users.find((u) => u.id === id) ?? null;
}

export async function createUser(
  email: string,
  plainPassword: string,
  role: Role = "teacher"
): Promise<User> {
  const users = await readAllUsers();
  if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
    throw new Error("A user with this email already exists");
  }
  const user: User = {
    id: randomUUID(),
    email,
    passwordHash: await hashPassword(plainPassword),
    role,
    createdAt: new Date().toISOString(),
  };
  users.push(user);
  await writeJson(USERS_FILE, users);
  return user;
}
