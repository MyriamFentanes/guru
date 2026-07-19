import Link from "next/link";
import AsanaBrowser from "@/components/AsanaBrowser";

export default function AsanasPage() {
  return (
    <div className="flex flex-1 justify-center bg-background-warm">
      <main className="w-full max-w-5xl px-8 py-16">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl text-ink">Asana repository</h1>
          <Link href="/asanas/new" className="button-primary">
            + New asana
          </Link>
        </div>
        <AsanaBrowser mode="curate" />
      </main>
    </div>
  );
}
