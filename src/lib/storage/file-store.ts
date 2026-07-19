import { mkdir, readFile, rename, rm, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

/**
 * The only module in this app allowed to touch the filesystem for
 * `data/` and `content/`. API routes and repositories call through here
 * so storage can later be swapped for a real database without touching
 * route or UI code.
 */

const locks = new Map<string, Promise<unknown>>();

/** Serializes reads/writes per file path within this process, since flat
 * files have no transaction isolation of their own. */
async function withFileLock<T>(filePath: string, fn: () => Promise<T>): Promise<T> {
  const previous = locks.get(filePath) ?? Promise.resolve();
  let release: () => void;
  const current = new Promise<void>((resolve) => {
    release = resolve;
  });
  locks.set(
    filePath,
    previous.then(() => current)
  );
  await previous;
  try {
    return await fn();
  } finally {
    release!();
    if (locks.get(filePath) === current) {
      locks.delete(filePath);
    }
  }
}

export async function readJson<T>(filePath: string): Promise<T | null> {
  try {
    const raw = await readFile(filePath, "utf-8");
    return JSON.parse(raw) as T;
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw err;
  }
}

export async function writeJson(filePath: string, data: unknown): Promise<void> {
  await withFileLock(filePath, async () => {
    await mkdir(path.dirname(filePath), { recursive: true });
    const tmpPath = `${filePath}.${randomUUID()}.tmp`;
    await writeFile(tmpPath, JSON.stringify(data, null, 2), "utf-8");
    await rename(tmpPath, filePath);
  });
}

export async function deleteJson(filePath: string): Promise<void> {
  await withFileLock(filePath, async () => {
    try {
      await unlink(filePath);
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code !== "ENOENT") throw err;
    }
  });
}

export async function readBinaryFile(filePath: string): Promise<Buffer | null> {
  try {
    return await readFile(filePath);
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw err;
  }
}

export async function writeBinaryFile(filePath: string, data: Buffer): Promise<void> {
  await withFileLock(filePath, async () => {
    await mkdir(path.dirname(filePath), { recursive: true });
    const tmpPath = `${filePath}.${randomUUID()}.tmp`;
    await writeFile(tmpPath, data);
    await rename(tmpPath, filePath);
  });
}

export async function removeDir(dirPath: string): Promise<void> {
  await withFileLock(dirPath, async () => {
    await rm(dirPath, { recursive: true, force: true });
  });
}
