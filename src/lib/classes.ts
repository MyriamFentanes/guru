import { randomUUID } from "node:crypto";
import { readdir } from "node:fs/promises";
import { readJson, writeJson } from "@/lib/storage/file-store";
import { CLASSES_DIR, classFilePath } from "@/lib/storage/paths";
import type { ClassDraft, ClassLevel, ClassStatus } from "@/lib/types";

export interface NewClassInput {
  name: string;
  durationMinutes: number;
  level: ClassLevel;
  series?: string;
  classType: string;
  focus?: string;
}

export interface ClassFieldsPatch {
  name?: string;
  durationMinutes?: number;
  level?: ClassLevel;
  series?: string;
  classType?: string;
  focus?: string;
  status?: ClassStatus;
}

export async function createClass(teacherId: string, input: NewClassInput): Promise<ClassDraft> {
  const now = new Date().toISOString();
  const classDraft: ClassDraft = {
    id: randomUUID(),
    teacherId,
    status: "draft",
    name: input.name,
    durationMinutes: input.durationMinutes,
    level: input.level,
    series: input.series,
    classType: input.classType,
    focus: input.focus,
    slots: [],
    createdAt: now,
    updatedAt: now,
  };
  await writeJson(classFilePath(classDraft.id), classDraft);
  return classDraft;
}

export async function getClassById(id: string): Promise<ClassDraft | null> {
  return readJson<ClassDraft>(classFilePath(id));
}

export async function updateClassFields(
  classId: string,
  patch: ClassFieldsPatch
): Promise<ClassDraft | null> {
  const classDraft = await getClassById(classId);
  if (!classDraft) return null;
  Object.assign(classDraft, patch);
  return saveClass(classDraft);
}

async function saveClass(classDraft: ClassDraft): Promise<ClassDraft> {
  classDraft.updatedAt = new Date().toISOString();
  await writeJson(classFilePath(classDraft.id), classDraft);
  return classDraft;
}

/** Adds a single asana as its own new slot (the common case from the
 * repository browser). Use groupSlotsAsProgression to combine slots
 * into a multi-asana progression afterwards. */
export async function addAsanaSlot(classId: string, asanaSlug: string): Promise<ClassDraft | null> {
  const classDraft = await getClassById(classId);
  if (!classDraft) return null;
  classDraft.slots.push({
    id: randomUUID(),
    asanaSlugs: [asanaSlug],
    primaryAsanaSlug: asanaSlug,
    repetitions: 1,
  });
  return saveClass(classDraft);
}

export async function removeSlot(classId: string, slotId: string): Promise<ClassDraft | null> {
  const classDraft = await getClassById(classId);
  if (!classDraft) return null;
  classDraft.slots = classDraft.slots.filter((s) => s.id !== slotId);
  return saveClass(classDraft);
}

export async function setSlotRepetitions(
  classId: string,
  slotId: string,
  repetitions: number
): Promise<ClassDraft | null> {
  const classDraft = await getClassById(classId);
  if (!classDraft) return null;
  const slot = classDraft.slots.find((s) => s.id === slotId);
  if (!slot) return null;
  slot.repetitions = repetitions;
  return saveClass(classDraft);
}

/** Merges 2+ existing slots into one progression slot. The merged slot
 * keeps primaryAsanaSlug's duration as the one that counts, and starts
 * fresh at 1 repetition - repetitions don't carry over from the
 * source slots since combining them into one is a new decision. */
export async function groupSlotsAsProgression(
  classId: string,
  slotIds: string[],
  primaryAsanaSlug: string
): Promise<ClassDraft | null> {
  const classDraft = await getClassById(classId);
  if (!classDraft) return null;

  const toMerge = classDraft.slots.filter((s) => slotIds.includes(s.id));
  if (toMerge.length < 2) return null;
  const asanaSlugs = toMerge.flatMap((s) => s.asanaSlugs);
  if (!asanaSlugs.includes(primaryAsanaSlug)) return null;

  const remaining = classDraft.slots.filter((s) => !slotIds.includes(s.id));
  remaining.push({
    id: randomUUID(),
    asanaSlugs,
    primaryAsanaSlug,
    repetitions: 1,
  });
  classDraft.slots = remaining;
  return saveClass(classDraft);
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
