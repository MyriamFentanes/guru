import { randomUUID } from "node:crypto";
import { readdir } from "node:fs/promises";
import { readJson, writeJson } from "@/lib/storage/file-store";
import { CLASSES_DIR, classFilePath } from "@/lib/storage/paths";
import type { ClassDraft, ClassLevel } from "@/lib/types";

export interface NewClassInput {
  durationMinutes: number;
  level: ClassLevel;
  series?: string;
  classType: string;
  focus?: string;
}

export async function createClass(teacherId: string, input: NewClassInput): Promise<ClassDraft> {
  const now = new Date().toISOString();
  const classDraft: ClassDraft = {
    id: randomUUID(),
    teacherId,
    status: "draft",
    durationMinutes: input.durationMinutes,
    level: input.level,
    series: input.series,
    classType: input.classType,
    focus: input.focus,
    asanas: [],
    createdAt: now,
    updatedAt: now,
  };
  await writeJson(classFilePath(classDraft.id), classDraft);
  return classDraft;
}

export async function getClassById(id: string): Promise<ClassDraft | null> {
  return readJson<ClassDraft>(classFilePath(id));
}

export async function listClassesByTeacher(teacherId: string): Promise<ClassDraft[]> {
  let files: string[];
  try {
    files = await readdir(CLASSES_DIR);
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw err;
  }
  const classes = await Promise.all(
    files
      .filter((f) => f.endsWith(".json"))
      .map((f) => readJson<ClassDraft>(`${CLASSES_DIR}/${f}`))
  );
  return classes
    .filter((c): c is ClassDraft => c !== null && c.teacherId === teacherId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
