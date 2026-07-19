import { notFound } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getClassById } from "@/lib/classes";
import { resolveSlotsWithAsanas } from "@/lib/resolve-slots";
import { buildReplayFrames } from "@/lib/replay";
import ReplayPlayer from "./replay-player";

export default async function ReplayPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ slots?: string }>;
}) {
  const { id } = await params;
  const { slots: slotsParam } = await searchParams;
  const session = await getSession();
  const classDraft = await getClassById(id);

  if (!session || !classDraft || classDraft.teacherId !== session.userId) {
    notFound();
  }

  const selectedIds = slotsParam ? slotsParam.split(",") : null;
  const slotsToPlay = selectedIds
    ? classDraft.slots.filter((s) => selectedIds.includes(s.id))
    : classDraft.slots;

  const resolvedSlots = await resolveSlotsWithAsanas(slotsToPlay);
  const frames = buildReplayFrames(resolvedSlots);

  return (
    <div className="flex flex-1 justify-center bg-background-warm">
      <main className="w-full max-w-md px-8 py-16">
        <p className="label text-muted">{classDraft.classType}</p>
        <h1 className="mb-8 text-3xl text-ink">Replay</h1>
        <ReplayPlayer classId={id} frames={frames} />
      </main>
    </div>
  );
}
