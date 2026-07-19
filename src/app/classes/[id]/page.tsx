import { notFound } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getClassById } from "@/lib/classes";
import { getAsanaBySlug } from "@/lib/asanas";
import ClassSlotsEditor, { type ResolvedSlot } from "./class-slots-editor";

export default async function ClassDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();
  const classDraft = await getClassById(id);

  if (!session || !classDraft || classDraft.teacherId !== session.userId) {
    notFound();
  }

  const resolvedSlots: ResolvedSlot[] = await Promise.all(
    classDraft.slots.map(async (slot) => ({
      ...slot,
      asanas: (
        await Promise.all(
          slot.asanaSlugs.map(async (slug) => {
            const asana = await getAsanaBySlug(slug);
            return asana ? { slug, name: asana.name, durationSeconds: asana.durationSeconds } : null;
          })
        )
      ).filter((a): a is { slug: string; name: string; durationSeconds: number } => a !== null),
    }))
  );

  return (
    <div className="flex flex-1 justify-center bg-background-warm">
      <main className="w-full max-w-md px-8 py-16">
        <p className="label text-muted">{classDraft.status}</p>
        <h1 className="mb-8 text-3xl text-ink">{classDraft.classType}</h1>
        <dl className="flex flex-col gap-4">
          <div>
            <dt className="label text-muted">Target duration</dt>
            <dd className="text-ink">{classDraft.durationMinutes} minutes</dd>
          </div>
          <div>
            <dt className="label text-muted">Level</dt>
            <dd className="text-ink">{classDraft.level}</dd>
          </div>
          {classDraft.series && (
            <div>
              <dt className="label text-muted">Series</dt>
              <dd className="text-ink">{classDraft.series}</dd>
            </div>
          )}
          {classDraft.focus && (
            <div>
              <dt className="label text-muted">Focus</dt>
              <dd className="text-ink">{classDraft.focus}</dd>
            </div>
          )}
          <div>
            <dt className="label mb-2 text-muted">Asanas</dt>
            <dd>
              <ClassSlotsEditor classId={classDraft.id} initialSlots={resolvedSlots} />
            </dd>
          </div>
        </dl>
      </main>
    </div>
  );
}
