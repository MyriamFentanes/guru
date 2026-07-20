"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ClassLevel } from "@/lib/types";
import { SERIES_OPTIONS, CLASS_TYPE_SUGGESTIONS } from "@/lib/class-options";

export interface ClassFieldsInitial {
  name: string;
  durationMinutes: number;
  level: ClassLevel;
  series?: string;
  classType: string;
  focus?: string;
  notes?: string;
}

interface Props {
  mode: "create" | "edit";
  classId?: string;
  initial?: ClassFieldsInitial;
  onSaved?: () => void;
}

export default function ClassFieldsForm({ mode, classId, initial, onSaved }: Props) {
  const router = useRouter();
  const [name, setName] = useState(initial?.name ?? "");
  const [durationMinutes, setDurationMinutes] = useState(initial?.durationMinutes ?? 60);
  const [level, setLevel] = useState<ClassLevel>(initial?.level ?? "beginner");
  const [series, setSeries] = useState(initial?.series ?? "");
  const [classType, setClassType] = useState(initial?.classType ?? "");
  const [focus, setFocus] = useState(initial?.focus ?? "");
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    setSaved(false);
    try {
      const url = mode === "create" ? "/api/classes" : `/api/classes/${classId}`;
      const res = await fetch(url, {
        method: mode === "create" ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, durationMinutes, level, series, classType, focus, notes }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Could not save class");
      }
      if (mode === "create") {
        const created = await res.json();
        router.push(`/classes/${created.id}`);
      } else {
        setSaved(true);
        router.refresh();
        onSaved?.();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <label className="flex flex-col gap-2">
        <span className="label text-muted">Name</span>
        <input
          type="text"
          required
          placeholder="e.g. Sunday Morning Flow"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="field-input"
        />
      </label>

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
        <select value={level} onChange={(e) => setLevel(e.target.value as ClassLevel)} className="field-input">
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
      </label>

      <label className="flex flex-col gap-2">
        <span className="label text-muted">Series (optional)</span>
        <select value={series} onChange={(e) => setSeries(e.target.value)} className="field-input">
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

      <label className="flex flex-col gap-2">
        <span className="label text-muted">Notes (optional)</span>
        <textarea
          placeholder="Teaching cues, adjustments for next time..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="field-input"
          rows={3}
        />
      </label>

      {error && <p className="text-sm text-red-700">{error}</p>}
      <div className="flex items-center gap-4">
        <button type="submit" disabled={submitting} className="button-primary">
          {submitting ? "Saving..." : mode === "create" ? "Create class" : "Save details"}
        </button>
        {saved && <span className="label text-muted">Saved</span>}
      </div>
    </form>
  );
}
