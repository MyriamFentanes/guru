import { getAsanaBySlug } from "@/lib/asanas";
import type { ClassSlot } from "@/lib/types";

export interface ResolvedSlot extends ClassSlot {
  asanas: { slug: string; name: string; durationSeconds: number }[];
}

/** Resolves each slot's asanaSlugs into display data (name, duration).
 * Server-only (asanas.ts touches the filesystem) - resolve once on the
 * server and pass the result down to client components. */
export async function resolveSlotsWithAsanas(slots: ClassSlot[]): Promise<ResolvedSlot[]> {
  return Promise.all(
    slots.map(async (slot) => ({
      ...slot,
      asanas: (
        await Promise.all(
          slot.asanaSlugs.map(async (slug) => {
            const asana = await getAsanaBySlug(slug);
            return asana ? { slug, name: asana.name, durationSeconds: asana.durationSeconds } : null;
          })
        )
      ).filter((a): a is { slug: string; name: string; durationSeconds: number } => a !== null),
    }))
  );
}
