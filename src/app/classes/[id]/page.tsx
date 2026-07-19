import { notFound } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getClassById } from "@/lib/classes";

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
            <dt className="label text-muted">Asanas</dt>
            <dd className="text-muted">
              {classDraft.asanas.length === 0
                ? "None added yet."
                : `${classDraft.asanas.length} asana(s)`}
            </dd>
          </div>
        </dl>
      </main>
    </div>
  );
}
