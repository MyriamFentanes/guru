import type { ResolvedSlot } from "@/lib/resolve-slots";

export interface ReplayFrame {
  slotId: string;
  asanaSlug: string;
  name: string;
  durationSeconds: number;
  isProgression: boolean;
  progressionIndex?: number;
  progressionCount?: number;
}

/** Expands slots into a flat playback sequence. A single-asana slot is
 * one frame for its full (primary duration x repetitions) length; a
 * progression slot cycles through each of its asanas, splitting that
 * same total evenly across them. Pure - safe for client components. */
export function buildReplayFrames(slots: ResolvedSlot[]): ReplayFrame[] {
  const frames: ReplayFrame[] = [];
  for (const slot of slots) {
    const primary = slot.asanas.find((a) => a.slug === slot.primaryAsanaSlug);
    const totalSeconds = (primary?.durationSeconds ?? 0) * slot.repetitions;

    if (slot.asanas.length <= 1) {
      const only = slot.asanas[0];
      if (!only) continue;
      frames.push({
        slotId: slot.id,
        asanaSlug: only.slug,
        name: only.name,
        durationSeconds: totalSeconds,
        isProgression: false,
      });
      continue;
    }

    const perFrame = totalSeconds / slot.asanas.length;
    slot.asanas.forEach((asana, index) => {
      frames.push({
        slotId: slot.id,
        asanaSlug: asana.slug,
        name: asana.name,
        durationSeconds: perFrame,
        isProgression: true,
        progressionIndex: index + 1,
        progressionCount: slot.asanas.length,
      });
    });
  }
  return frames;
}
