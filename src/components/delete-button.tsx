"use client";

import { useTransition } from "react";

export function DeleteButton({
  action,
  confirmMessage = "Are you sure? This cannot be undone.",
  label = "Delete",
}: {
  action: () => Promise<void>;
  confirmMessage?: string;
  label?: string;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        if (!window.confirm(confirmMessage)) return;
        startTransition(async () => {
          try {
            await action();
          } catch (error) {
            window.alert(error instanceof Error ? error.message : "Something went wrong.");
          }
        });
      }}
      className="text-sm font-medium text-red-600 hover:text-red-800 disabled:opacity-50"
    >
      {isPending ? "Deleting..." : label}
    </button>
  );
}
