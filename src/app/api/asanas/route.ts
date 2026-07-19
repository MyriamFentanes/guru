import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/rbac";
import { createAsana, listAsanas } from "@/lib/asanas";
import { AsanaFormError, parseAsanaForm } from "@/lib/asana-form";

export const GET = withAuth(async () => {
  const asanas = await listAsanas();
  return NextResponse.json(asanas);
});

export const POST = withAuth(async (_session, req) => {
  try {
    const { input, image } = await parseAsanaForm(req);
    if (!image) {
      return NextResponse.json({ error: "image is required" }, { status: 400 });
    }
    const asana = await createAsana(input, image);
    return NextResponse.json(asana, { status: 201 });
  } catch (err) {
    if (err instanceof AsanaFormError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    throw err;
  }
});
