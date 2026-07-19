import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/rbac";
import { deleteAsana, getAsanaBySlug, updateAsana } from "@/lib/asanas";
import { AsanaFormError, parseAsanaForm } from "@/lib/asana-form";

type Context = { params: Promise<{ slug: string }> };

export const GET = withAuth<Context>(async (_session, _req, context) => {
  const { slug } = await context.params;
  const asana = await getAsanaBySlug(slug);
  if (!asana) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(asana);
});

export const PUT = withAuth<Context>(async (_session, req, context) => {
  const { slug } = await context.params;
  try {
    const { input, image } = await parseAsanaForm(req);
    const asana = await updateAsana(slug, input, image ?? undefined);
    if (!asana) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(asana);
  } catch (err) {
    if (err instanceof AsanaFormError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    throw err;
  }
});

export const DELETE = withAuth<Context>(async (_session, _req, context) => {
  const { slug } = await context.params;
  const existing = await getAsanaBySlug(slug);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await deleteAsana(slug);
  return NextResponse.json({ ok: true });
});
