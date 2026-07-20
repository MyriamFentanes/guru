import { notFound } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getClassById } from "@/lib/classes";
import AsanaBrowser from "@/components/AsanaBrowser";
import Breadcrumbs from "@/components/Breadcrumbs";

export default async function AddAsanasPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();
  const classDraft = await getClassById(id);
  if (!session || !classDraft || classDraft.teacherId !== session.userId) notFound();

  return (
    <div className="flex flex-1 justify-center bg-background-warm">
      <main className="w-full max-w-5xl px-8 py-16">
        <Breadcrumbs
          items={[
            { label: "Guru", href: "/dashboard" },
            { label: classDraft.name, href: `/classes/${id}` },
            { label: "Add asanas" },
          ]}
        />
        <div className="mb-8">
          <p className="label text-muted">{classDraft.classType}</p>
          <h1 className="text-3xl text-ink">Add asanas</h1>
        </div>
        <AsanaBrowser
          mode="select"
          classId={id}
          existingSlugs={classDraft.slots.flatMap((s) => s.asanaSlugs)}
        />
      </main>
    </div>
  );
}
