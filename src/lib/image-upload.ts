export interface ImageUpload {
  buffer: Buffer;
  mimeType: string;
  filename: string;
}

export class ImageValidationError extends Error {}

const MIME_EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpeg",
  "image/png": "png",
  "image/webp": "webp",
};

export const ALLOWED_IMAGE_TYPES = Object.keys(MIME_EXTENSIONS);
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export function imageExtension(image: ImageUpload): string {
  if (MIME_EXTENSIONS[image.mimeType]) return MIME_EXTENSIONS[image.mimeType];
  const fromName = image.filename.split(".").pop();
  return fromName || "jpeg";
}

/** Validates and extracts a file field from FormData. Returns null if
 * the field is empty (caller decides whether that's acceptable). */
export async function extractImageUpload(file: FormDataEntryValue | null): Promise<ImageUpload | null> {
  if (!(file instanceof File) || file.size === 0) return null;
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new ImageValidationError(`image must be one of: ${ALLOWED_IMAGE_TYPES.join(", ")}`);
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw new ImageValidationError("image must be 5MB or smaller");
  }
  return {
    buffer: Buffer.from(await file.arrayBuffer()),
    mimeType: file.type,
    filename: file.name,
  };
}
