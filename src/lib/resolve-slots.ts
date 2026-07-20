import { getAsanaBySlug } from "@/lib/asanas";
import type { ClassSlot } from "@/lib/types";

export interface ResolvedAsana {
  slug: string;
  name: string;
  sanskritName: string;
  durationSeconds: number;
}

export interface ResolvedSlot extends ClassSlot {
  asanas: ResolvedAsana[];
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
          slot.asanaSlugs.map(async (slug): Promise<ResolvedAsana | null> => {
            const asana = await getAsanaBySlug(slug);
            return asana
              ? {
                  slug,
                  name: asana.name,
                  sanskritName: asana.sanskritName,
                  durationSeconds: asana.durationSeconds,
                }
              : null;
          })
        )
      ).filter((a): a is ResolvedAsana => a !== null),
    }))
  );
}
