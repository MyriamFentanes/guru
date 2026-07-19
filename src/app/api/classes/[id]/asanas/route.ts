import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/rbac";
import { addAsanaToClass, getClassById } from "@/lib/classes";
import { getAsanaBySlug } from "@/lib/asanas";

type Context = { params: Promise<{ id: string }> };

export const POST = withAuth<Context>(async (session, req, context) => {
  const { id } = await context.params;
  const classDraft = await getClassById(id);
  if (!classDraft || classDraft.teacherId !== session.userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await req.json().catch(() => null);
  const asanaSlug = body?.asanaSlug;
  if (typeof asanaSlug !== "string" || asanaSlug.trim().length === 0) {
    return NextResponse.json({ error: "asanaSlug is required" }, { status: 400 });
  }
  if (!(await getAsanaBySlug(asanaSlug))) {
    return NextResponse.json({ error: "Asana not found" }, { status: 404 });
  }

  const updated = await addAsanaToClass(id, asanaSlug);
  return NextResponse.json(updated, { status: 201 });
});
