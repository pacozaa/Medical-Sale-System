"use client";

import { useEffect } from "react";
import Link from "next/link";
import { secondaryButton } from "@/components/ui";

export default function AppError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-lg space-y-4 rounded-xl border border-red-200 bg-red-50 p-6 text-center">
      <h1 className="text-lg font-semibold text-red-800">Something went wrong</h1>
      <p className="text-sm text-red-700">{error.message || "An unexpected error occurred."}</p>
      <div className="flex justify-center gap-3">
        <button type="button" onClick={reset} className="rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700">
          Try again
        </button>
        <Link href="/dashboard" className={secondaryButton}>
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
