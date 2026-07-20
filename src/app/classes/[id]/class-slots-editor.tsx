"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { computeTotalDurationSeconds, formatDuration } from "@/lib/duration";
import type { ResolvedSlot } from "@/lib/resolve-slots";

interface Props {
  classId: string;
  initialSlots: ResolvedSlot[];
}

export default function ClassSlotsEditor({ classId, initialSlots }: Props) {
  const router = useRouter();
  const [slots, setSlots] = useState(initialSlots);
  const [selected, setSelected] = useState<string[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const asanaLookup = useMemo(() => {
    const map: Record<string, { name: string; sanskritName: string; durationSeconds: number }> = {};
    for (const slot of initialSlots) {
      for (const asana of slot.asanas) {
        map[asana.slug] = {
          name: asana.name,
          sanskritName: asana.sanskritName,
          durationSeconds: asana.durationSeconds,
        };
      }
    }
    return map;
  }, [initialSlots]);

  const durationBySlug = useMemo(() => {
    const map: Record<string, number> = {};
    for (const slug of Object.keys(asanaLookup)) map[slug] = asanaLookup[slug].durationSeconds;
    return map;
  }, [asanaLookup]);

  const totalSeconds = computeTotalDurationSeconds(slots, durationBySlug);

  function toggleSelected(slotId: string) {
    setSelected((prev) => (prev.includes(slotId) ? prev.filter((id) => id !== slotId) : [...prev, slotId]));
  }

  function handleReplay(slotIds?: string[]) {
    const query = slotIds ? `?slots=${slotIds.join(",")}` : "";
    router.push(`/classes/${classId}/replay${query}`);
  }

  async function handleRepetitionsChange(slotId: string, repetitions: number) {
    setSlots((prev) => prev.map((s) => (s.id === slotId ? { ...s, repetitions } : s)));
  }

  async function commitRepetitions(slotId: string, repetitions: number) {
    if (repetitions <= 0) return;
    await fetch(`/api/classes/${classId}/slots/${slotId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ repetitions }),
    });
  }

  async function handleRemove(slotId: string) {
    setBusy(slotId);
    try {
      await fetch(`/api/classes/${classId}/slots/${slotId}`, { method: "DELETE" });
      setSlots((prev) => prev.filter((s) => s.id !== slotId));
      setSelected((prev) => prev.filter((id) => id !== slotId));
    } finally {
      setBusy(null);
    }
  }

  async function handleGroup() {
    if (selected.length < 2) return;
    const primarySlot = slots.find((s) => s.id === selected[0]);
    if (!primarySlot) return;
    setBusy("group");
    setError(null);
    try {
      const res = await fetch(`/api/classes/${classId}/slots/group`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slotIds: selected, primaryAsanaSlug: primarySlot.primaryAsanaSlug }),
      });
      if (!res.ok) throw new Error("Could not group slots");

      const mergedAsanaSlugs = slots
        .filter((s) => selected.includes(s.id))
        .flatMap((s) => s.asanaSlugs);
      const merged: ResolvedSlot = {
        id: `pending-${Date.now()}`,
        asanaSlugs: mergedAsanaSlugs,
        primaryAsanaSlug: primarySlot.primaryAsanaSlug,
        repetitions: 1,
        asanas: mergedAsanaSlugs.map((slug) => ({ slug, ...asanaLookup[slug] })),
      };
      setSlots((prev) => [...prev.filter((s) => !selected.includes(s.id)), merged]);
      setSelected([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div>
      <div className="mb-4 flex items-baseline justify-between">
        <p className="label text-muted">Flow duration</p>
        <p className="text-ink">{formatDuration(totalSeconds)}</p>
      </div>

      {slots.length > 0 && (
        <button onClick={() => handleReplay()} className="button-primary mb-4">
          ▶ Replay full class
        </button>
      )}

      {error && <p className="mb-4 text-sm text-red-700">{error}</p>}

      {slots.length === 0 ? (
        <p className="text-muted">None added yet.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {slots.map((slot) => {
            const primary = asanaLookup[slot.primaryAsanaSlug];
            const others = slot.asanaSlugs.filter((s) => s !== slot.primaryAsanaSlug);
            return (
              <li key={slot.id} className="flex items-center gap-3 border border-accent-taupe px-4 py-2">
                <input
                  type="checkbox"
                  checked={selected.includes(slot.id)}
                  onChange={() => toggleSelected(slot.id)}
                />
                <div className="flex-1">
                  <span className="text-ink">{primary?.name ?? slot.primaryAsanaSlug}</span>
                  {others.length > 0 && (
                    <span className="label ml-2 text-muted">+{others.length} progression(s)</span>
                  )}
                </div>
                <label className="flex items-center gap-2">
                  <span className="label text-muted">Reps</span>
                  <input
                    type="number"
                    min={1}
                    value={slot.repetitions}
                    onChange={(e) => handleRepetitionsChange(slot.id, Number(e.target.value))}
                    onBlur={(e) => commitRepetitions(slot.id, Number(e.target.value))}
                    className="field-input w-16"
                  />
                </label>
                <button
                  onClick={() => handleRemove(slot.id)}
                  disabled={busy === slot.id}
                  className="label text-muted hover:text-ink"
                >
                  Remove
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {selected.length >= 1 && (
        <div className="mt-4 flex gap-4">
          <button onClick={() => handleReplay(selected)} className="button-primary">
            ▶ Replay {selected.length} selected
          </button>
          {selected.length >= 2 && (
            <button onClick={handleGroup} disabled={busy === "group"} className="button-primary">
              {busy === "group" ? "Grouping..." : `Group ${selected.length} selected as progression`}
            </button>
          )}
        </div>
      )}

      <div>
        <Link href={`/classes/${classId}/add-asanas`} className="button-primary mt-4 inline-block">
          + Add asanas
        </Link>
      </div>
    </div>
  );
}
