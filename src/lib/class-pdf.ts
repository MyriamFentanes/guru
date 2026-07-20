import PDFDocument from "pdfkit";
import { getAsanaBySlug } from "@/lib/asanas";
import { readBinaryFile } from "@/lib/storage/file-store";
import { asanaImagePath } from "@/lib/storage/paths";
import { computeSlotDurationSeconds, computeTotalDurationSeconds, formatDuration } from "@/lib/duration";
import type { ResolvedSlot } from "@/lib/resolve-slots";
import type { ClassDraft } from "@/lib/types";

const IMAGE_SIZE = 90;

export async function generateClassPdf(classDraft: ClassDraft, slots: ResolvedSlot[]): Promise<Buffer> {
  const durationBySlug: Record<string, number> = {};
  for (const slot of slots) {
    for (const asana of slot.asanas) durationBySlug[asana.slug] = asana.durationSeconds;
  }
  const totalSeconds = computeTotalDurationSeconds(slots, durationBySlug);

  const doc = new PDFDocument({ margin: 50 });
  const chunks: Buffer[] = [];
  doc.on("data", (chunk) => chunks.push(chunk));
  const done = new Promise<Buffer>((resolve) => doc.on("end", () => resolve(Buffer.concat(chunks))));

  doc.fontSize(22).text(classDraft.name);
  doc.moveDown(0.2);
  doc.fontSize(11).fillColor("#666666");
  const metaLine = [
    classDraft.classType,
    classDraft.level,
    classDraft.series,
    classDraft.focus && `focus: ${classDraft.focus}`,
  ]
    .filter(Boolean)
    .join("  ·  ");
  doc.text(metaLine);
  doc.text(
    `Target duration: ${classDraft.durationMinutes} min   Flow duration: ${formatDuration(totalSeconds)}`
  );
  doc.fillColor("#000000");
  doc.moveDown(1);

  for (const slot of slots) {
    const primary = slot.asanas.find((a) => a.slug === slot.primaryAsanaSlug);
    if (!primary) continue;
    const slotSeconds = computeSlotDurationSeconds(slot, durationBySlug);

    const startY = doc.y;
    let imageDrawn = false;
    const imageBuffer = await readAsanaImageBuffer(slot.primaryAsanaSlug);
    if (imageBuffer) {
      try {
        doc.image(imageBuffer, doc.x, startY, { width: IMAGE_SIZE, height: IMAGE_SIZE, fit: [IMAGE_SIZE, IMAGE_SIZE] });
        imageDrawn = true;
      } catch {
        // Unsupported image format (e.g. WebP - pdfkit only reads JPEG/PNG) - fall through with text only.
      }
    }

    const textX = doc.x + (imageDrawn ? IMAGE_SIZE + 15 : 0);
    doc.fontSize(13).text(primary.name, textX, startY, { continued: false });
    doc.fontSize(10).fillColor("#666666").text(primary.sanskritName, textX);
    doc.text(
      `${formatDuration(slotSeconds)} (${slot.repetitions}x ${formatDuration(primary.durationSeconds)})`,
      textX
    );

    if (slot.asanas.length > 1) {
      const others = slot.asanas.filter((a) => a.slug !== slot.primaryAsanaSlug);
      doc.text(`Progressions: ${others.map((a) => a.name).join(", ")}`, textX);
    }
    doc.fillColor("#000000");

    const contentBottom = Math.max(doc.y, startY + (imageDrawn ? IMAGE_SIZE : 0));
    doc.y = contentBottom + 15;
  }

  doc.end();
  return done;
}

async function readAsanaImageBuffer(slug: string): Promise<Buffer | null> {
  const asana = await getAsanaBySlug(slug);
  if (!asana) return null;
  return readBinaryFile(asanaImagePath(slug, asana.image));
}
