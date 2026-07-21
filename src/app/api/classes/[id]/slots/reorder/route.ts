import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/rbac";
import { getClassById, reorderSlots } from "@/lib/classes";

type Context = { params: Promise<{ id: string }> };

export const PATCH = withAuth<Context>(async (session, req, context) => {
  const { id } = await context.params;
  const classDraft = await getClassById(id);
  if (!classDraft || classDraft.teacherId !== session.userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await req.json().catch(() => null);
  const slotIds = body?.slotIds;
  if (!Array.isArray(slotIds) || !slotIds.every((s) => typeof s === "string")) {
    return NextResponse.json({ error: "slotIds must be an array of strings" }, { status: 400 });
  }

  const updated = await reorderSlots(id, slotIds);
  if (!updated) {
    return NextResponse.json(
      { error: "slotIds must be a permutation of the class's current slot ids" },
      { status: 400 }
    );
  }
  return NextResponse.json(updated);
});
