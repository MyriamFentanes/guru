import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/rbac";
import { getClassById, groupSlotsAsProgression } from "@/lib/classes";

type Context = { params: Promise<{ id: string }> };

export const POST = withAuth<Context>(async (session, req, context) => {
  const { id } = await context.params;
  const classDraft = await getClassById(id);
  if (!classDraft || classDraft.teacherId !== session.userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await req.json().catch(() => null);
  const slotIds = body?.slotIds;
  const primaryAsanaSlug = body?.primaryAsanaSlug;
  if (!Array.isArray(slotIds) || slotIds.length < 2 || !slotIds.every((s) => typeof s === "string")) {
    return NextResponse.json({ error: "slotIds must be an array of at least 2 slot ids" }, { status: 400 });
  }
  if (typeof primaryAsanaSlug !== "string") {
    return NextResponse.json({ error: "primaryAsanaSlug is required" }, { status: 400 });
  }

  const updated = await groupSlotsAsProgression(id, slotIds, primaryAsanaSlug);
  if (!updated) {
    return NextResponse.json(
      { error: "Could not group slots - check slotIds and primaryAsanaSlug" },
      { status: 400 }
    );
  }
  return NextResponse.json(updated);
});
