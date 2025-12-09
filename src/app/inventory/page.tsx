import { getInventory } from "@/app/actions/inventory";
import { InventoryTable } from "@/components/sheet-sync/inventory-table";
import type { InventoryItem } from "@/types";
import { Header } from "@/components/sheet-sync/header";

export default async function InventoryPage() {
  const inventoryItems: InventoryItem[] = await getInventory();

  return (
    <>
      <Header allItems={inventoryItems} />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <h1 className="text-2xl font-bold tracking-tight">Full Inventory</h1>
        <InventoryTable items={inventoryItems} />
      </main>
    </>
  );
}
