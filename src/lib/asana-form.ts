import type { AsanaImageUpload, AsanaInput } from "@/lib/asanas";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export class AsanaFormError extends Error {}

function parseJsonArray(value: FormDataEntryValue | null): string[] {
  if (!value || typeof value !== "string" || value.trim().length === 0) return [];
  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed) || !parsed.every((v) => typeof v === "string")) {
      throw new Error("not a string array");
    }
    return parsed;
  } catch {
    throw new AsanaFormError(`Invalid array field: expected a JSON array of strings, got ${value}`);
  }
}

export async function parseAsanaForm(
  req: Request
): Promise<{ input: AsanaInput; image: AsanaImageUpload | null }> {
  const form = await req.formData();

  const name = form.get("name");
  const sanskritName = form.get("sanskritName");
  const durationSecondsRaw = form.get("durationSeconds");

  if (typeof name !== "string" || name.trim().length === 0) {
    throw new AsanaFormError("name is required");
  }
  if (typeof sanskritName !== "string" || sanskritName.trim().length === 0) {
    throw new AsanaFormError("sanskritName is required");
  }
  const durationSeconds = Number(durationSecondsRaw);
  if (!durationSecondsRaw || Number.isNaN(durationSeconds) || durationSeconds <= 0) {
    throw new AsanaFormError("durationSeconds must be a positive number");
  }

  const input: AsanaInput = {
    name: name.trim(),
    sanskritName: sanskritName.trim(),
    otherNames: parseJsonArray(form.get("otherNames")),
    musclesInvolved: parseJsonArray(form.get("musclesInvolved")),
    series: parseJsonArray(form.get("series")),
    durationSeconds,
    assists: parseJsonArray(form.get("assists")),
    verified: form.get("verified") === "true",
    description: (form.get("description") as string) || undefined,
    notes: (form.get("notes") as string) || undefined,
  };

  const file = form.get("image");
  let image: AsanaImageUpload | null = null;
  if (file instanceof File && file.size > 0) {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      throw new AsanaFormError(`image must be one of: ${ALLOWED_IMAGE_TYPES.join(", ")}`);
    }
    if (file.size > MAX_IMAGE_BYTES) {
      throw new AsanaFormError("image must be 5MB or smaller");
    }
    image = {
      buffer: Buffer.from(await file.arrayBuffer()),
      mimeType: file.type,
      filename: file.name,
    };
  }

  return { input, image };
}
