import Link from "next/link";
import { notFound } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getClassById } from "@/lib/classes";
import { getAsanaBySlug } from "@/lib/asanas";
import RemoveAsanaButton from "./remove-asana-button";

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

  const asanaEntries = await Promise.all(
    classDraft.asanas.map(async (entry) => ({
      entry,
      asana: await getAsanaBySlug(entry.asanaSlug),
    }))
  );

  return (
    <div className="flex flex-1 justify-center bg-background-warm">
      <main className="w-full max-w-md px-8 py-16">
        <p className="label text-muted">{classDraft.status}</p>
        <h1 className="mb-8 text-3xl text-ink">{classDraft.classType}</h1>
        <dl className="flex flex-col gap-4">
          <div>
            <dt className="label text-muted">Duration</dt>
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
              {asanaEntries.length === 0 ? (
                <p className="text-muted">None added yet.</p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {asanaEntries.map(({ entry, asana }) => (
                    <li
                      key={entry.asanaSlug}
                      className="flex items-center justify-between border border-accent-taupe px-4 py-2"
                    >
                      <span className="text-ink">{asana?.name ?? entry.asanaSlug}</span>
                      <RemoveAsanaButton classId={classDraft.id} slug={entry.asanaSlug} />
                    </li>
                  ))}
                </ul>
              )}
              <Link href={`/classes/${classDraft.id}/add-asanas`} className="button-primary mt-4 inline-block">
                + Add asanas
              </Link>
            </dd>
          </div>
        </dl>
      </main>
    </div>
  );
}
