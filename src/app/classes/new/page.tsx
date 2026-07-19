import ClassFieldsForm from "@/components/ClassFieldsForm";

export default function NewClassPage() {
  return (
    <div className="flex flex-1 justify-center bg-background-warm">
      <main className="w-full max-w-md px-8 py-16">
        <p className="label text-muted">Guru</p>
        <h1 className="mb-8 text-3xl text-ink">New class</h1>
        <ClassFieldsForm mode="create" />
      </main>
    </div>
  );
}
