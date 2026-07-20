import Link from "next/link";
import SplitHero from "@/components/SplitHero";

export default function Home() {
  return (
    <SplitHero maxWidthClassName="max-w-md">
      <p className="label text-muted">Class builder for yoga teachers</p>
      <h1 className="text-4xl text-ink sm:text-5xl">Guru</h1>
      <p className="mt-6 text-lg leading-8 text-muted">
        Build, preview, and share a flow without doing it by hand on paper.
      </p>
      <div className="mt-6 flex flex-wrap gap-4">
        <Link href="/login" className="button-primary">
          Log in
        </Link>
        <a
          href="https://github.com/MyriamFentanes/guru/issues"
          className="label inline-flex items-center text-muted hover:text-ink"
        >
          View roadmap
        </a>
      </div>
    </SplitHero>
  );
}
