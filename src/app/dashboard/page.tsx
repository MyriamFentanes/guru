import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { listClassesByTeacher } from "@/lib/classes";
import LogoutButton from "./logout-button";

export default async function DashboardPage() {
  const session = await getSession();
  const classes = session ? await listClassesByTeacher(session.userId) : [];

  return (
    <div className="flex flex-1 bg-background-warm">
      <main className="mx-auto w-full max-w-2xl px-8 py-16">
        <div className="mb-10 flex items-start justify-between">
          <div>
            <p className="label text-muted">Signed in as</p>
            <h1 className="text-3xl text-ink">{session?.email}</h1>
          </div>
          <LogoutButton />
        </div>

        <Link href="/classes/new" className="button-primary inline-block">
          + New class
        </Link>

        <div className="mt-12">
          <p className="label mb-4 text-muted">Your classes</p>
          {classes.length === 0 ? (
            <p className="text-muted">No classes yet.</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {classes.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/classes/${c.id}`}
                    className="block border border-accent-taupe px-4 py-3 hover:border-ink"
                  >
                    <span className="text-ink">{c.classType}</span>{" "}
                    <span className="text-muted">
                      &middot; {c.level} &middot; {c.durationMinutes} min
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}
