import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/rbac";
import { getClassById, removeAsanaFromClass } from "@/lib/classes";

type Context = { params: Promise<{ id: string; slug: string }> };

export const DELETE = withAuth<Context>(async (session, _req, context) => {
  const { id, slug } = await context.params;
  const classDraft = await getClassById(id);
  if (!classDraft || classDraft.teacherId !== session.userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const updated = await removeAsanaFromClass(id, slug);
  return NextResponse.json(updated);
});
