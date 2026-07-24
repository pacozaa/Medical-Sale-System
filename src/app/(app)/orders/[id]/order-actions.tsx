"use client";

import { useTransition } from "react";
import { fulfillOrder, cancelOrder } from "@/lib/actions/orders";
import { primaryButton, secondaryButton } from "@/components/ui";

export function OrderActions({ orderId }: { orderId: string }) {
  const [isPending, startTransition] = useTransition();

  const handle = (action: (id: string) => Promise<void>, confirmMessage?: string) => {
    if (confirmMessage && !window.confirm(confirmMessage)) return;
    startTransition(async () => {
      try {
        await action(orderId);
      } catch (error) {
        window.alert(error instanceof Error ? error.message : "Something went wrong.");
      }
    });
  };

  return (
    <div className="flex gap-3">
      <button
        type="button"
        disabled={isPending}
        onClick={() => handle(fulfillOrder, "Fulfill this order and deduct warehouse stock?")}
        className={primaryButton}
      >
        {isPending ? "Working..." : "Fulfill & Deduct Stock"}
      </button>
      <button
        type="button"
        disabled={isPending}
        onClick={() => handle(cancelOrder, "Cancel this order?")}
        className={secondaryButton}
      >
        Cancel Order
      </button>
    </div>
  );
}
