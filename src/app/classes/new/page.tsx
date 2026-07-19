"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ClassLevel } from "@/lib/types";

const SERIES_OPTIONS = ["", "Ashtanga Series 1", "Ashtanga Series 2", "Rocket Yoga"];
const CLASS_TYPE_SUGGESTIONS = ["Vinyasa", "Hatha", "Yin", "Power", "Restorative"];

export default function NewClassPage() {
  const router = useRouter();
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [level, setLevel] = useState<ClassLevel>("beginner");
  const [series, setSeries] = useState("");
  const [classType, setClassType] = useState("");
  const [focus, setFocus] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ durationMinutes, level, series, classType, focus }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Could not create class");
      }
      const created = await res.json();
      router.push(`/classes/${created.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-1 justify-center bg-background-warm">
      <main className="w-full max-w-md px-8 py-16">
        <p className="label text-muted">Guru</p>
        <h1 className="mb-8 text-3xl text-ink">New class</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <label className="flex flex-col gap-2">
            <span className="label text-muted">Duration (minutes)</span>
            <input
              type="number"
              min={1}
              required
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(Number(e.target.value))}
              className="field-input"
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="label text-muted">Level</span>
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value as ClassLevel)}
              className="field-input"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </label>

          <label className="flex flex-col gap-2">
            <span className="label text-muted">Series (optional)</span>
            <select
              value={series}
              onChange={(e) => setSeries(e.target.value)}
              className="field-input"
            >
              {SERIES_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s || "None"}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-2">
            <span className="label text-muted">Class type</span>
            <input
              type="text"
              required
              list="class-type-suggestions"
              value={classType}
              onChange={(e) => setClassType(e.target.value)}
              className="field-input"
            />
            <datalist id="class-type-suggestions">
              {CLASS_TYPE_SUGGESTIONS.map((t) => (
                <option key={t} value={t} />
              ))}
            </datalist>
          </label>

          <label className="flex flex-col gap-2">
            <span className="label text-muted">Focus (optional)</span>
            <input
              type="text"
              placeholder="e.g. hips, backbends"
              value={focus}
              onChange={(e) => setFocus(e.target.value)}
              className="field-input"
            />
          </label>

          {error && <p className="text-sm text-red-700">{error}</p>}
          <button type="submit" disabled={submitting} className="button-primary">
            {submitting ? "Creating..." : "Create class"}
          </button>
        </form>
      </main>
    </div>
  );
}
