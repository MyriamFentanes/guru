import path from "node:path";

const ROOT = process.cwd();

export const DATA_DIR = path.join(ROOT, "data");
export const USERS_FILE = path.join(DATA_DIR, "users.json");
export const CLASSES_DIR = path.join(DATA_DIR, "classes");
export const CONTENT_DIR = path.join(ROOT, "content");
export const ASANAS_DIR = path.join(CONTENT_DIR, "asanas");

export function classFilePath(classId: string): string {
  return path.join(CLASSES_DIR, `${classId}.json`);
}

export function asanaMetaPath(slug: string): string {
  return path.join(ASANAS_DIR, slug, "meta.json");
}
