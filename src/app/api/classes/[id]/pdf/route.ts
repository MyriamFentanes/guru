import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/rbac";
import { getClassById } from "@/lib/classes";
import { resolveSlotsWithAsanas } from "@/lib/resolve-slots";
import { generateClassPdf } from "@/lib/class-pdf";

type Context = { params: Promise<{ id: string }> };

export const GET = withAuth<Context>(async (session, _req, context) => {
  const { id } = await context.params;
  const classDraft = await getClassById(id);
  if (!classDraft || classDraft.teacherId !== session.userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const slots = await resolveSlotsWithAsanas(classDraft.slots);
  const pdfBuffer = await generateClassPdf(classDraft, slots);
  const filename = `${classDraft.name.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.pdf`;

  return new NextResponse(new Uint8Array(pdfBuffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
});
