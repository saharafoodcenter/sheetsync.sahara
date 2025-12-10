import { getInventory } from "@/app/actions/inventory";
import { Header } from "@/components/sheet-sync/header";
import { InventoryDashboard } from "@/components/sheet-sync/inventory-dashboard";
import type { InventoryItem } from "@/types";

export default async function Home() {
  const inventoryItems: InventoryItem[] = await getInventory();

  return (
    <>
      <Header allItems={inventoryItems} />
      <main className="flex flex-1 flex-col">
        <InventoryDashboard initialItems={inventoryItems} />
      </main>
    </>
  );
}
