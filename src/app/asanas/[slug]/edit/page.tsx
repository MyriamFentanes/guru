import { notFound } from "next/navigation";
import { getAsanaBySlug } from "@/lib/asanas";
import AsanaForm from "@/components/AsanaForm";

export default async function EditAsanaPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const asana = await getAsanaBySlug(slug);
  if (!asana) notFound();

  return (
    <div className="flex flex-1 justify-center bg-background-warm">
      <main className="w-full max-w-md px-8 py-16">
        <p className="label text-muted">Asana repository</p>
        <h1 className="mb-8 text-3xl text-ink">{asana.name}</h1>
        <AsanaForm mode="edit" initial={asana} />
      </main>
    </div>
  );
}
