import { readdir } from "node:fs/promises";
import { readJson, removeDir, writeBinaryFile, writeJson } from "@/lib/storage/file-store";
import { ASANAS_DIR, asanaDir, asanaImagePath, asanaMetaPath } from "@/lib/storage/paths";
import { imageExtension, type ImageUpload } from "@/lib/image-upload";
import type { Asana } from "@/lib/types";

export interface AsanaInput {
  name: string;
  sanskritName: string;
  otherNames: string[];
  musclesInvolved: string[];
  series: string[];
  durationSeconds: number;
  assists: string[];
  verified: boolean;
  description?: string;
  notes?: string;
}

export type AsanaImageUpload = ImageUpload;

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-+|-+$)/g, "");
}

export async function listAsanas(): Promise<Asana[]> {
  let entries: string[];
  try {
    const dirents = await readdir(ASANAS_DIR, { withFileTypes: true });
    entries = dirents
      .filter((d) => d.isDirectory() && !d.name.startsWith("_") && !d.name.startsWith("."))
      .map((d) => d.name);
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw err;
  }
  const asanas = await Promise.all(entries.map((slug) => readJson<Asana>(asanaMetaPath(slug))));
  return asanas.filter((a): a is Asana => a !== null);
}

export async function getAsanaBySlug(slug: string): Promise<Asana | null> {
  return readJson<Asana>(asanaMetaPath(slug));
}

async function uniqueSlug(base: string): Promise<string> {
  let candidate = base;
  let suffix = 2;
  while (await getAsanaBySlug(candidate)) {
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }
  return candidate;
}

export async function createAsana(input: AsanaInput, image: AsanaImageUpload): Promise<Asana> {
  const slug = await uniqueSlug(slugify(input.name));
  const imageFilename = `image.${imageExtension(image)}`;

  const asana: Asana = {
    slug,
    name: input.name,
    sanskritName: input.sanskritName,
    otherNames: input.otherNames,
    musclesInvolved: input.musclesInvolved,
    series: input.series,
    durationSeconds: input.durationSeconds,
    assists: input.assists,
    image: imageFilename,
    verified: input.verified,
    description: input.description,
    notes: input.notes,
  };

  await writeBinaryFile(asanaImagePath(slug, imageFilename), image.buffer);
  await writeJson(asanaMetaPath(slug), { $schema: "../asana.schema.json", ...asana });
  return asana;
}

export async function updateAsana(
  slug: string,
  input: AsanaInput,
  image?: AsanaImageUpload
): Promise<Asana | null> {
  const existing = await getAsanaBySlug(slug);
  if (!existing) return null;

  let imageFilename = existing.image;
  if (image) {
    imageFilename = `image.${imageExtension(image)}`;
    await writeBinaryFile(asanaImagePath(slug, imageFilename), image.buffer);
  }

  const updated: Asana = {
    slug,
    name: input.name,
    sanskritName: input.sanskritName,
    otherNames: input.otherNames,
    musclesInvolved: input.musclesInvolved,
    series: input.series,
    durationSeconds: input.durationSeconds,
    assists: input.assists,
    image: imageFilename,
    verified: input.verified,
    description: input.description,
    notes: input.notes,
  };

  await writeJson(asanaMetaPath(slug), { $schema: "../asana.schema.json", ...updated });
  return updated;
}

export async function deleteAsana(slug: string): Promise<void> {
  await removeDir(asanaDir(slug));
}
