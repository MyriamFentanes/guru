export default function Home() {
  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex w-full max-w-xl flex-col gap-4 px-8 py-16 text-center sm:text-left">
        <h1 className="text-3xl font-semibold tracking-tight text-black dark:text-zinc-50">
          Guru
        </h1>
        <p className="text-lg leading-8 text-zinc-600 dark:text-zinc-400">
          Class builder for yoga teachers. Setup scaffold is in place; flows land next.
        </p>
      </main>
    </div>
  );
}
