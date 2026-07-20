import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/rbac";
import { getUserById } from "@/lib/users";
import { readBinaryFile } from "@/lib/storage/file-store";
import { userPhotoPath } from "@/lib/storage/paths";

type Context = { params: Promise<{ id: string }> };

const CONTENT_TYPES: Record<string, string> = {
  jpeg: "image/jpeg",
  jpg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

export const GET = withAuth<Context>(async (_session, _req, context) => {
  const { id } = await context.params;
  const user = await getUserById(id);
  if (!user || !user.photo) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const bytes = await readBinaryFile(userPhotoPath(id, user.photo));
  if (!bytes) return NextResponse.json({ error: "Photo missing" }, { status: 404 });

  const ext = user.photo.split(".").pop()?.toLowerCase() ?? "";
  return new NextResponse(new Uint8Array(bytes), {
    headers: {
      "Content-Type": CONTENT_TYPES[ext] ?? "application/octet-stream",
      "Cache-Control": "private, max-age=3600",
    },
  });
});
