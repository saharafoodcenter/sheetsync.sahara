import { getInventory } from "@/app/actions/inventory";
import { InventoryDashboard } from "@/components/sheet-sync/inventory-dashboard";
import type { InventoryItem } from "@/types";

export default async function Home() {
  const inventoryItems: InventoryItem[] = await getInventory();

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <InventoryDashboard initialItems={inventoryItems} />
    </main>
  );
}
