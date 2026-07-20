import ClassFieldsForm from "@/components/ClassFieldsForm";
import Breadcrumbs from "@/components/Breadcrumbs";

export default function NewClassPage() {
  return (
    <div className="flex flex-1 justify-center bg-background-warm">
      <main className="w-full max-w-md px-8 py-16">
        <Breadcrumbs items={[{ label: "Guru", href: "/dashboard" }, { label: "New class" }]} />
        <h1 className="mb-8 text-3xl text-ink">New class</h1>
        <ClassFieldsForm mode="create" />
      </main>
    </div>
  );
}
