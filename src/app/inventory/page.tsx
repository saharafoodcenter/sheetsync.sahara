import ProtectedRoute from "@/components/auth/protected-route";
import { getInventory } from "@/app/actions/inventory";
import { InventoryTable } from "@/components/sheet-sync/inventory-table";
import type { InventoryItem } from "@/types";
import { Header } from "@/components/sheet-sync/header";
import { PageHeader } from "@/components/sheet-sync/page-header";

export default async function InventoryPage() {
  const inventoryItems: InventoryItem[] = await getInventory();

  return (
    <ProtectedRoute>
      <Header allItems={inventoryItems} />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
        <PageHeader title="Full Inventory" description="Manage and view all your products." />
        <InventoryTable items={inventoryItems} />
      </main>
    </ProtectedRoute>
  );
}
