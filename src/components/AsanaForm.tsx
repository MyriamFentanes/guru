"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Asana } from "@/lib/types";

interface Props {
  mode: "create" | "edit";
  initial?: Asana;
}

function joinList(values: string[]): string {
  return values.join(", ");
}

function splitList(value: string): string[] {
  return value
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

export default function AsanaForm({ mode, initial }: Props) {
  const router = useRouter();
  const [name, setName] = useState(initial?.name ?? "");
  const [sanskritName, setSanskritName] = useState(initial?.sanskritName ?? "");
  const [otherNames, setOtherNames] = useState(joinList(initial?.otherNames ?? []));
  const [musclesInvolved, setMusclesInvolved] = useState(joinList(initial?.musclesInvolved ?? []));
  const [series, setSeries] = useState(joinList(initial?.series ?? []));
  const [durationSeconds, setDurationSeconds] = useState(initial?.durationSeconds ?? 30);
  const [assists, setAssists] = useState(joinList(initial?.assists ?? []));
  const [description, setDescription] = useState(initial?.description ?? "");
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [verified, setVerified] = useState(initial?.verified ?? false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const form = new FormData();
      form.set("name", name);
      form.set("sanskritName", sanskritName);
      form.set("otherNames", JSON.stringify(splitList(otherNames)));
      form.set("musclesInvolved", JSON.stringify(splitList(musclesInvolved)));
      form.set("series", JSON.stringify(splitList(series)));
      form.set("durationSeconds", String(durationSeconds));
      form.set("assists", JSON.stringify(splitList(assists)));
      form.set("description", description);
      form.set("notes", notes);
      form.set("verified", String(verified));
      if (imageFile) form.set("image", imageFile);

      const url = mode === "create" ? "/api/asanas" : `/api/asanas/${initial!.slug}`;
      const res = await fetch(url, { method: mode === "create" ? "POST" : "PUT", body: form });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Could not save asana");
      }
      router.push("/asanas");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!initial) return;
    if (!confirm(`Delete "${initial.name}"? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/asanas/${initial.slug}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Could not delete asana");
      router.push("/asanas");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setDeleting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <label className="flex flex-col gap-2">
        <span className="label text-muted">Name</span>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="field-input"
        />
      </label>

      <label className="flex flex-col gap-2">
        <span className="label text-muted">Sanskrit name</span>
        <input
          type="text"
          required
          value={sanskritName}
          onChange={(e) => setSanskritName(e.target.value)}
          className="field-input"
        />
      </label>

      <label className="flex flex-col gap-2">
        <span className="label text-muted">Other names (comma separated)</span>
        <input
          type="text"
          value={otherNames}
          onChange={(e) => setOtherNames(e.target.value)}
          className="field-input"
        />
      </label>

      <label className="flex flex-col gap-2">
        <span className="label text-muted">Muscles involved (comma separated)</span>
        <input
          type="text"
          value={musclesInvolved}
          onChange={(e) => setMusclesInvolved(e.target.value)}
          className="field-input"
        />
      </label>

      <label className="flex flex-col gap-2">
        <span className="label text-muted">Series (comma separated)</span>
        <input
          type="text"
          value={series}
          onChange={(e) => setSeries(e.target.value)}
          className="field-input"
        />
      </label>

      <label className="flex flex-col gap-2">
        <span className="label text-muted">Duration (seconds)</span>
        <input
          type="number"
          min={1}
          required
          value={durationSeconds}
          onChange={(e) => setDurationSeconds(Number(e.target.value))}
          className="field-input"
        />
      </label>

      <label className="flex flex-col gap-2">
        <span className="label text-muted">Assists (comma separated)</span>
        <input
          type="text"
          value={assists}
          onChange={(e) => setAssists(e.target.value)}
          className="field-input"
        />
      </label>

      <label className="flex flex-col gap-2">
        <span className="label text-muted">Description</span>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="field-input"
          rows={3}
        />
      </label>

      <label className="flex flex-col gap-2">
        <span className="label text-muted">Notes</span>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="field-input"
          rows={2}
        />
      </label>

      <label className="flex flex-col gap-2">
        <span className="label text-muted">
          {mode === "create" ? "Image" : "Replace image (optional)"}
        </span>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
          className="field-input"
        />
      </label>

      <label className="flex items-center gap-2">
        <input type="checkbox" checked={verified} onChange={(e) => setVerified(e.target.checked)} />
        <span className="label text-muted">Verified</span>
      </label>

      {error && <p className="text-sm text-red-700">{error}</p>}

      <div className="flex gap-4">
        <button type="submit" disabled={submitting} className="button-primary">
          {submitting ? "Saving..." : mode === "create" ? "Create asana" : "Save changes"}
        </button>
        {mode === "edit" && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="label text-red-700 hover:underline"
          >
            {deleting ? "Deleting..." : "Delete"}
          </button>
        )}
      </div>
    </form>
  );
}
