"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";

export function ProductDeleteButton({
  productId,
  productName,
}: {
  productId: string;
  productName: string;
}) {
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    if (!confirm(`Hapus produk "${productName}"? Varian ikut terhapus.`))
      return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/produk/${productId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Gagal menghapus");
      toast.success(`${productName} dihapus`);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menghapus");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      className="text-destructive"
      onClick={handleDelete}
      disabled={busy}
    >
      {busy ? "..." : "Hapus"}
    </Button>
  );
}
