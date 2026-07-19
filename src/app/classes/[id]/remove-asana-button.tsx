"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RemoveAsanaButton({ classId, slug }: { classId: string; slug: string }) {
  const router = useRouter();
  const [removing, setRemoving] = useState(false);

  async function handleRemove() {
    setRemoving(true);
    await fetch(`/api/classes/${classId}/asanas/${slug}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <button onClick={handleRemove} disabled={removing} className="label text-muted hover:text-ink">
      {removing ? "Removing..." : "Remove"}
    </button>
  );
}
