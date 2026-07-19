"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ClassStatus } from "@/lib/types";

export default function SaveStatusButton({ classId, status }: { classId: string; status: ClassStatus }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  if (status === "saved") {
    return null;
  }

  async function handleSave() {
    setSaving(true);
    try {
      await fetch(`/api/classes/${classId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "saved" }),
      });
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <button onClick={handleSave} disabled={saving} className="button-primary">
      {saving ? "Saving..." : "Save class"}
    </button>
  );
}
