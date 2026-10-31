"use client";

import { useState, useRef } from "react";

export default function AvatarUpload({ currentUrl }: { currentUrl?: string | null }) {
  const [preview, setPreview] = useState<string | null>(currentUrl || null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setUploading(true);
    // optimistic local preview while it uploads
    setPreview(URL.createObjectURL(file));

    try {
      const formData = new FormData();
      formData.append("avatar", file);
      const res = await fetch("/api/profile/avatar", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "upload failed");
        setPreview(currentUrl || null);
      } else {
        setPreview(data.avatarUrl);
      }
    } catch {
      setError("upload failed");
      setPreview(currentUrl || null);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex items-center gap-4">
      <div className="w-16 h-16 rounded-full border border-panelLine bg-ink overflow-hidden flex items-center justify-center">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="Avatar" className="w-full h-full object-cover" />
        ) : (
          <span className="text-text-muted font-mono text-[10px]">N/A</span>
        )}
      </div>
      <div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="text-[10px] font-mono uppercase tracking-wider text-signal border border-signal/30 px-3 py-1.5 rounded-sm hover:bg-signal/10 transition-colors disabled:opacity-50"
        >
          {uploading ? "Uploading..." : "Change Avatar"}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          onChange={handleFileChange}
          className="hidden"
        />
        {error && <p className="text-[9px] font-mono text-critical mt-1">{error}</p>}
      </div>
    </div>
  );
}
