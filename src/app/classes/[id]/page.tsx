import { notFound } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getClassById } from "@/lib/classes";
import { resolveSlotsWithAsanas } from "@/lib/resolve-slots";
import ClassSlotsEditor from "./class-slots-editor";
import ClassDetailsSection from "./class-details-section";
import SaveStatusButton from "./save-status-button";

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

  const resolvedSlots = await resolveSlotsWithAsanas(classDraft.slots);

  return (
    <div className="flex flex-1 justify-center bg-background-warm">
      <main className="w-full max-w-md px-8 py-16">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <p className="label text-muted">{classDraft.status}</p>
            <h1 className="text-3xl text-ink">{classDraft.name}</h1>
          </div>
          <div className="flex items-center gap-4">
            {classDraft.status === "saved" && (
              <a
                href={`/api/classes/${classDraft.id}/pdf`}
                className="label text-muted hover:text-ink"
              >
                Download PDF
              </a>
            )}
            <SaveStatusButton classId={classDraft.id} status={classDraft.status} />
          </div>
        </div>
        <div className="flex flex-col gap-8">
          <ClassDetailsSection
            classId={classDraft.id}
            initial={{
              name: classDraft.name,
              durationMinutes: classDraft.durationMinutes,
              level: classDraft.level,
              series: classDraft.series,
              classType: classDraft.classType,
              focus: classDraft.focus,
            }}
          />
          <div>
            <p className="label mb-2 text-muted">Asanas</p>
            <ClassSlotsEditor classId={classDraft.id} initialSlots={resolvedSlots} />
          </div>
        </div>
      </main>
    </div>
  );
}
