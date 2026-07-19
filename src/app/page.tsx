export default function Home() {
  return (
    <div className="flex flex-1 items-center justify-center bg-background-warm">
      <main className="flex w-full max-w-xl flex-col gap-6 px-8 py-16 text-center sm:text-left">
        <p className="label text-muted">Class builder for yoga teachers</p>
        <h1 className="text-4xl text-ink sm:text-5xl">Guru</h1>
        <p className="text-lg leading-8 text-muted">
          Build, preview, and share a flow without doing it by hand on paper.
          Setup scaffold is in place; flows land next.
        </p>
        <div>
          <a
            href="https://github.com/MyriamFentanes/guru/issues"
            className="label inline-block border border-ink px-6 py-3 text-ink transition-colors hover:bg-ink hover:text-background"
          >
            View roadmap
          </a>
        </div>
      </main>
    </div>
  );
}
