"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  endpoint: string;
  label?: string;
};

export default function DeleteButton({ endpoint, label = "Delete" }: Props) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(endpoint, { method: "DELETE" });
      if (res.ok) {
        router.refresh();
        if (label === "Delete Thread") {
            router.push("/community");
        }
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete");
        setDeleting(false);
        setConfirming(false);
      }
    } catch (e) {
      alert("An error occurred");
      setDeleting(false);
      setConfirming(false);
    }
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-mono text-critical uppercase">Confirm?</span>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="text-[10px] font-mono text-critical hover:underline uppercase"
        >
          {deleting ? "..." : "Yes"}
        </button>
        <button
          onClick={() => setConfirming(false)}
          disabled={deleting}
          className="text-[10px] font-mono text-text-muted hover:underline uppercase"
        >
          No
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="text-[10px] font-mono text-text-muted hover:text-critical transition-colors uppercase"
    >
      [{label}]
    </button>
  );
}
