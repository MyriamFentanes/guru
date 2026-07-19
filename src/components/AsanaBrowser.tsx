"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { Asana } from "@/lib/types";

interface Props {
  mode: "curate" | "select";
  classId?: string;
  existingSlugs?: string[];
}

export default function AsanaBrowser({ mode, classId, existingSlugs = [] }: Props) {
  const [asanas, setAsanas] = useState<Asana[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [muscle, setMuscle] = useState("");
  const [series, setSeries] = useState("");
  const [verifiedFilter, setVerifiedFilter] = useState<"all" | "verified" | "draft">("all");
  const [addingSlug, setAddingSlug] = useState<string | null>(null);
  const [addedSlugs, setAddedSlugs] = useState<string[]>(existingSlugs);

  useEffect(() => {
    fetch("/api/asanas")
      .then((res) => {
        if (!res.ok) throw new Error("Could not load asanas");
        return res.json();
      })
      .then(setAsanas)
      .catch((err) => setError(err instanceof Error ? err.message : "Something went wrong"));
  }, []);

  const muscles = useMemo(
    () => Array.from(new Set((asanas ?? []).flatMap((a) => a.musclesInvolved))).sort(),
    [asanas]
  );
  const seriesOptions = useMemo(
    () => Array.from(new Set((asanas ?? []).flatMap((a) => a.series))).sort(),
    [asanas]
  );

  const filtered = useMemo(() => {
    if (!asanas) return [];
    const q = search.trim().toLowerCase();
    return asanas.filter((a) => {
      if (q) {
        const haystack = [a.name, a.sanskritName, ...a.otherNames].join(" ").toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      if (muscle && !a.musclesInvolved.includes(muscle)) return false;
      if (series && !a.series.includes(series)) return false;
      if (verifiedFilter === "verified" && !a.verified) return false;
      if (verifiedFilter === "draft" && a.verified) return false;
      return true;
    });
  }, [asanas, search, muscle, series, verifiedFilter]);

  async function handleAdd(slug: string) {
    if (!classId) return;
    setAddingSlug(slug);
    try {
      const res = await fetch(`/api/classes/${classId}/asanas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ asanaSlug: slug }),
      });
      if (!res.ok) throw new Error("Could not add asana to class");
      setAddedSlugs((prev) => [...prev, slug]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setAddingSlug(null);
    }
  }

  return (
    <div>
      <div className="mb-8 flex flex-wrap gap-4">
        <input
          type="text"
          placeholder="Search name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="field-input max-w-[200px]"
        />
        <select value={muscle} onChange={(e) => setMuscle(e.target.value)} className="field-input max-w-[180px]">
          <option value="">All muscles</option>
          {muscles.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
        <select value={series} onChange={(e) => setSeries(e.target.value)} className="field-input max-w-[180px]">
          <option value="">All series</option>
          {seriesOptions.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select
          value={verifiedFilter}
          onChange={(e) => setVerifiedFilter(e.target.value as typeof verifiedFilter)}
          className="field-input max-w-[150px]"
        >
          <option value="all">All</option>
          <option value="verified">Verified</option>
          <option value="draft">Draft</option>
        </select>
      </div>

      {error && <p className="mb-4 text-sm text-red-700">{error}</p>}
      {!asanas && !error && <p className="text-muted">Loading...</p>}
      {asanas && filtered.length === 0 && <p className="text-muted">No asanas match.</p>}

      <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4">
        {filtered.map((asana) => (
          <div key={asana.slug} className="flex flex-col gap-2 border border-accent-taupe p-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/api/asanas/${asana.slug}/image`}
              alt={asana.name}
              className="aspect-square w-full object-cover"
            />
            <div>
              <p className="text-ink">{asana.name}</p>
              <p className="text-sm text-muted">{asana.sanskritName}</p>
              {!asana.verified && <p className="label text-muted">Draft</p>}
            </div>
            {mode === "curate" ? (
              <Link href={`/asanas/${asana.slug}/edit`} className="label text-muted hover:text-ink">
                Edit
              </Link>
            ) : addedSlugs.includes(asana.slug) ? (
              <span className="label text-muted">Added</span>
            ) : (
              <button
                onClick={() => handleAdd(asana.slug)}
                disabled={addingSlug === asana.slug}
                className="button-primary text-center"
              >
                {addingSlug === asana.slug ? "Adding..." : "Add to class"}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
