import AsanaForm from "@/components/AsanaForm";

export default function NewAsanaPage() {
  return (
    <div className="flex flex-1 justify-center bg-background-warm">
      <main className="w-full max-w-md px-8 py-16">
        <p className="label text-muted">Asana repository</p>
        <h1 className="mb-8 text-3xl text-ink">New asana</h1>
        <AsanaForm mode="create" />
      </main>
    </div>
  );
}
