"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { ReplayFrame } from "@/lib/replay";

interface Props {
  classId: string;
  frames: ReplayFrame[];
}

export default function ReplayPlayer({ classId, frames }: Props) {
  const [index, setIndex] = useState(0);
  const [remaining, setRemaining] = useState(() => frames[0]?.durationSeconds ?? 0);
  const [playing, setPlaying] = useState(true);

  const frame = frames[index];

  function goTo(newIndex: number) {
    setIndex(newIndex);
    setRemaining(frames[newIndex]?.durationSeconds ?? 0);
  }

  useEffect(() => {
    if (!playing || !frame) return;
    const tick = setInterval(() => {
      setRemaining((prev) => {
        if (prev > 1) return prev - 1;
        if (index < frames.length - 1) {
          const nextIndex = index + 1;
          setIndex(nextIndex);
          return frames[nextIndex]?.durationSeconds ?? 0;
        }
        setPlaying(false);
        return 0;
      });
    }, 1000);
    return () => clearInterval(tick);
  }, [playing, index, frame, frames]);

  if (frames.length === 0) {
    return (
      <div>
        <p className="text-muted">Nothing to replay.</p>
        <Link href={`/classes/${classId}`} className="label mt-4 inline-block text-muted hover:text-ink">
          Back to class
        </Link>
      </div>
    );
  }

  return (
    <div>
      <p className="label mb-2 text-muted">
        {index + 1} / {frames.length}
      </p>

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`/api/asanas/${frame.asanaSlug}/image`}
        alt={frame.name}
        className="aspect-square w-full object-cover"
      />

      <div className="mt-4 flex items-baseline justify-between">
        <div>
          <p className="text-2xl text-ink">{frame.name}</p>
          <p className="text-muted italic">{frame.sanskritName}</p>
          {frame.isProgression && (
            <p className="label text-muted">
              Progression {frame.progressionIndex} of {frame.progressionCount}
            </p>
          )}
        </div>
        <p className="text-2xl text-ink">{Math.ceil(remaining)}s</p>
      </div>

      <div className="mt-6 flex gap-4">
        <button
          onClick={() => goTo(Math.max(0, index - 1))}
          disabled={index === 0}
          className="label text-muted hover:text-ink disabled:opacity-40"
        >
          Previous
        </button>
        <button onClick={() => setPlaying((p) => !p)} className="button-primary">
          {playing ? "Pause" : "Play"}
        </button>
        <button
          onClick={() => goTo(Math.min(frames.length - 1, index + 1))}
          disabled={index === frames.length - 1}
          className="label text-muted hover:text-ink disabled:opacity-40"
        >
          Next
        </button>
      </div>

      <Link href={`/classes/${classId}`} className="label mt-6 inline-block text-muted hover:text-ink">
        Back to class
      </Link>
    </div>
  );
}
