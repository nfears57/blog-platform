"use client";

import { useState } from "react";

export default function SupporterButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubscribe() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
      });
      const data = (await response.json()) as { url?: string; error?: string };

      if (!response.ok || !data.url) {
        setError(data.error ?? "Failed to start checkout.");
        setLoading(false);
        return;
      }

      window.location.href = data.url;
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        className="rounded bg-black px-4 py-2 text-white disabled:opacity-60"
        type="button"
        onClick={handleSubscribe}
        disabled={loading}
      >
        {loading ? "Redirecting..." : "Become a Monthly Supporter"}
      </button>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
