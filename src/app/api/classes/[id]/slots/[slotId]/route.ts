import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/rbac";
import { getClassById, removeSlot, setSlotRepetitions } from "@/lib/classes";

type Context = { params: Promise<{ id: string; slotId: string }> };

export const PATCH = withAuth<Context>(async (session, req, context) => {
  const { id, slotId } = await context.params;
  const classDraft = await getClassById(id);
  if (!classDraft || classDraft.teacherId !== session.userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await req.json().catch(() => null);
  const repetitions = body?.repetitions;
  if (typeof repetitions !== "number" || repetitions <= 0) {
    return NextResponse.json({ error: "repetitions must be a positive number" }, { status: 400 });
  }

  const updated = await setSlotRepetitions(id, slotId, repetitions);
  if (!updated) return NextResponse.json({ error: "Slot not found" }, { status: 404 });
  return NextResponse.json(updated);
});

export const DELETE = withAuth<Context>(async (session, _req, context) => {
  const { id, slotId } = await context.params;
  const classDraft = await getClassById(id);
  if (!classDraft || classDraft.teacherId !== session.userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const updated = await removeSlot(id, slotId);
  return NextResponse.json(updated);
});
