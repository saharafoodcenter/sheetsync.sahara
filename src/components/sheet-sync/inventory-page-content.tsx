
"use client";

import { useInventory } from "@/context/inventory-context";
import { InventoryTable } from "@/components/sheet-sync/inventory-table";
import { PageHeader } from "@/components/sheet-sync/page-header";
import { Loader2 } from "lucide-react";

export default function InventoryPageContent() {
  const { items, loading } = useInventory();

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
        <PageHeader title="Full Inventory" description="Manage and view all your products." />
        <InventoryTable items={items} />
    </main>
  );
}
