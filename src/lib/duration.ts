export interface DurationSlot {
  primaryAsanaSlug: string;
  repetitions: number;
}

/** Pure - no fs deps - safe to import from client components for instant
 * local recalculation as a teacher edits repetitions/groupings. */
export function computeTotalDurationSeconds(
  slots: DurationSlot[],
  durationSecondsBySlug: Record<string, number>
): number {
  return slots.reduce(
    (total, slot) => total + (durationSecondsBySlug[slot.primaryAsanaSlug] ?? 0) * slot.repetitions,
    0
  );
}

export function formatDuration(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes === 0) return `${seconds}s`;
  if (seconds === 0) return `${minutes} min`;
  return `${minutes} min ${seconds}s`;
}
