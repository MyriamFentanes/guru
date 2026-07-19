import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/rbac";
import { getClassById } from "@/lib/classes";

export const GET = withAuth<{ params: Promise<{ id: string }> }>(async (session, _req, context) => {
  const { id } = await context.params;
  const classDraft = await getClassById(id);
  if (!classDraft || classDraft.teacherId !== session.userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(classDraft);
});
