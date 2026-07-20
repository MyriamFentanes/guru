import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/rbac";
import { createClass, listClassesByTeacher } from "@/lib/classes";
import type { ClassLevel } from "@/lib/types";

const LEVELS: ClassLevel[] = ["beginner", "intermediate", "advanced"];

export const GET = withAuth(async (session) => {
  const classes = await listClassesByTeacher(session.userId);
  return NextResponse.json(classes);
});

export const POST = withAuth(async (session, req) => {
  const body = await req.json().catch(() => null);
  const { name, durationMinutes, level, series, classType, focus } = body ?? {};

  if (typeof name !== "string" || name.trim().length === 0) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }
  if (typeof durationMinutes !== "number" || durationMinutes <= 0) {
    return NextResponse.json(
      { error: "durationMinutes must be a positive number" },
      { status: 400 }
    );
  }
  if (typeof level !== "string" || !LEVELS.includes(level as ClassLevel)) {
    return NextResponse.json(
      { error: `level must be one of: ${LEVELS.join(", ")}` },
      { status: 400 }
    );
  }
  if (typeof classType !== "string" || classType.trim().length === 0) {
    return NextResponse.json({ error: "classType is required" }, { status: 400 });
  }
  if (series !== undefined && typeof series !== "string") {
    return NextResponse.json({ error: "series must be a string" }, { status: 400 });
  }
  if (focus !== undefined && typeof focus !== "string") {
    return NextResponse.json({ error: "focus must be a string" }, { status: 400 });
  }

  const classDraft = await createClass(session.userId, {
    name: name.trim(),
    durationMinutes,
    level: level as ClassLevel,
    series: series || undefined,
    classType: classType.trim(),
    focus: focus || undefined,
  });
  return NextResponse.json(classDraft, { status: 201 });
});
