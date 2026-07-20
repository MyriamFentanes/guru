import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/rbac";
import { getClassById, updateClassFields, type ClassFieldsPatch } from "@/lib/classes";
import type { ClassLevel, ClassStatus } from "@/lib/types";

type Context = { params: Promise<{ id: string }> };

const LEVELS: ClassLevel[] = ["beginner", "intermediate", "advanced"];
const STATUSES: ClassStatus[] = ["draft", "saved"];

export const GET = withAuth<Context>(async (session, _req, context) => {
  const { id } = await context.params;
  const classDraft = await getClassById(id);
  if (!classDraft || classDraft.teacherId !== session.userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(classDraft);
});

export const PATCH = withAuth<Context>(async (session, req, context) => {
  const { id } = await context.params;
  const classDraft = await getClassById(id);
  if (!classDraft || classDraft.teacherId !== session.userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const patch: ClassFieldsPatch = {};

  if ("name" in body) {
    if (typeof body.name !== "string" || body.name.trim().length === 0) {
      return NextResponse.json({ error: "name is required" }, { status: 400 });
    }
    patch.name = body.name.trim();
  }
  if ("durationMinutes" in body) {
    if (typeof body.durationMinutes !== "number" || body.durationMinutes <= 0) {
      return NextResponse.json(
        { error: "durationMinutes must be a positive number" },
        { status: 400 }
      );
    }
    patch.durationMinutes = body.durationMinutes;
  }
  if ("level" in body) {
    if (typeof body.level !== "string" || !LEVELS.includes(body.level as ClassLevel)) {
      return NextResponse.json({ error: `level must be one of: ${LEVELS.join(", ")}` }, { status: 400 });
    }
    patch.level = body.level as ClassLevel;
  }
  if ("classType" in body) {
    if (typeof body.classType !== "string" || body.classType.trim().length === 0) {
      return NextResponse.json({ error: "classType is required" }, { status: 400 });
    }
    patch.classType = body.classType.trim();
  }
  if ("series" in body) {
    if (typeof body.series !== "string") {
      return NextResponse.json({ error: "series must be a string" }, { status: 400 });
    }
    patch.series = body.series || undefined;
  }
  if ("focus" in body) {
    if (typeof body.focus !== "string") {
      return NextResponse.json({ error: "focus must be a string" }, { status: 400 });
    }
    patch.focus = body.focus || undefined;
  }
  if ("notes" in body) {
    if (typeof body.notes !== "string") {
      return NextResponse.json({ error: "notes must be a string" }, { status: 400 });
    }
    patch.notes = body.notes || undefined;
  }
  if ("status" in body) {
    if (typeof body.status !== "string" || !STATUSES.includes(body.status as ClassStatus)) {
      return NextResponse.json({ error: `status must be one of: ${STATUSES.join(", ")}` }, { status: 400 });
    }
    patch.status = body.status as ClassStatus;
  }

  const updated = await updateClassFields(id, patch);
  return NextResponse.json(updated);
});
