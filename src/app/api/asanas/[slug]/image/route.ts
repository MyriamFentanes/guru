import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/rbac";
import { getAsanaBySlug } from "@/lib/asanas";
import { readBinaryFile } from "@/lib/storage/file-store";
import { asanaImagePath } from "@/lib/storage/paths";

type Context = { params: Promise<{ slug: string }> };

const CONTENT_TYPES: Record<string, string> = {
  jpeg: "image/jpeg",
  jpg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

export const GET = withAuth<Context>(async (_session, _req, context) => {
  const { slug } = await context.params;
  const asana = await getAsanaBySlug(slug);
  if (!asana) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const bytes = await readBinaryFile(asanaImagePath(slug, asana.image));
  if (!bytes) return NextResponse.json({ error: "Image missing" }, { status: 404 });

  const ext = asana.image.split(".").pop()?.toLowerCase() ?? "";
  return new NextResponse(new Uint8Array(bytes), {
    headers: {
      "Content-Type": CONTENT_TYPES[ext] ?? "application/octet-stream",
      "Cache-Control": "private, max-age=3600",
    },
  });
});
