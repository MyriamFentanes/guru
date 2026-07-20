import AsanaForm from "@/components/AsanaForm";
import Breadcrumbs from "@/components/Breadcrumbs";

export default function NewAsanaPage() {
  return (
    <div className="flex flex-1 justify-center bg-background-warm">
      <main className="w-full max-w-md px-8 py-16">
        <Breadcrumbs
          items={[
            { label: "Guru", href: "/dashboard" },
            { label: "Asana repository", href: "/asanas" },
            { label: "New asana" },
          ]}
        />
        <h1 className="mb-8 text-3xl text-ink">New asana</h1>
        <AsanaForm mode="create" />
      </main>
    </div>
  );
}
