"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  userId: string;
  hasPhoto: boolean;
}

export default function ProfilePhoto({ userId, hasPhoto }: Props) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cacheBust, setCacheBust] = useState(0);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setUploading(true);
    try {
      const form = new FormData();
      form.set("photo", file);
      const res = await fetch("/api/users/me/photo", { method: "POST", body: form });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Could not upload photo");
      }
      setCacheBust((n) => n + 1);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <div className="flex items-center gap-3">
      {hasPhoto || cacheBust > 0 ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={`/api/users/${userId}/photo?v=${cacheBust}`}
          alt="Profile photo"
          className="h-12 w-12 rounded-full object-cover"
        />
      ) : (
        <div className="flex h-12 w-12 items-center justify-center rounded-full border border-accent-taupe text-muted">
          ?
        </div>
      )}
      <div>
        <label className="label cursor-pointer text-muted hover:text-ink">
          {uploading ? "Uploading..." : hasPhoto ? "Change photo" : "Upload photo"}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            disabled={uploading}
            className="hidden"
          />
        </label>
        {error && <p className="text-sm text-red-700">{error}</p>}
      </div>
    </div>
  );
}
