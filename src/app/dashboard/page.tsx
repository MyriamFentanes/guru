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

        <div className="flex gap-4">
          <Link href="/classes/new" className="button-primary inline-block">
            + New class
          </Link>
          <Link href="/asanas" className="label inline-flex items-center text-muted hover:text-ink">
            Asana repository
          </Link>
        </div>

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
                    className="flex items-center justify-between border border-accent-taupe px-4 py-3 hover:border-ink"
                  >
                    <span>
                      <span className="text-ink">{c.classType}</span>{" "}
                      <span className="text-muted">
                        &middot; {c.level} &middot; {c.durationMinutes} min
                      </span>
                    </span>
                    <span className="label text-muted">{c.status}</span>
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
