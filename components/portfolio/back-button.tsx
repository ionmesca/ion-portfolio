"use client";

import { useRouter } from "next/navigation";

export function BackButton() {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.back()}
      className="text-xs text-text-tertiary hover:text-text-primary transition-colors"
    >
      &larr; Back
    </button>
  );
}
