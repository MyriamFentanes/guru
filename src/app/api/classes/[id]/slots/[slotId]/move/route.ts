import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/rbac";
import { getClassById, moveSlot } from "@/lib/classes";

type Context = { params: Promise<{ id: string; slotId: string }> };

export const POST = withAuth<Context>(async (session, req, context) => {
  const { id, slotId } = await context.params;
  const classDraft = await getClassById(id);
  if (!classDraft || classDraft.teacherId !== session.userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await req.json().catch(() => null);
  const direction = body?.direction;
  if (direction !== "up" && direction !== "down") {
    return NextResponse.json({ error: "direction must be 'up' or 'down'" }, { status: 400 });
  }

  const updated = await moveSlot(id, slotId, direction);
  if (!updated) return NextResponse.json({ error: "Slot not found" }, { status: 404 });
  return NextResponse.json(updated);
});
