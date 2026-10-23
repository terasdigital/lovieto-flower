"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { STATUS_LABELS } from "./status-badge";
import { toast } from "sonner";
import { Button } from "../ui/button";

const NEXT_STATUSES = [
  "pending",
  "confirmed",
  "shipped",
  "delivered",
  "cancelled",
];

export function OrderStatusControl({
  orderId,
  current,
}: {
  orderId: string;
  current: string;
}) {
  const [busy, setBusy] = useState<string | null>(null);
  const router = useRouter();

  async function changeTo(status: string) {
    setBusy(status);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Gagal update status");
      toast.success(`Status diubah ke ${STATUS_LABELS[status]}`);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal update status");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {NEXT_STATUSES.map((s) => (
        <Button
          key={s}
          size="sm"
          variant={s === current ? "default" : "outline"}
          disabled={s === current || busy !== null}
          onClick={() => changeTo(s)}
        >
          {busy === s ? "..." : STATUS_LABELS[s]}
        </Button>
      ))}
    </div>
  );
}
