
import { getInventory } from "@/app/actions/inventory";
import { Header } from "@/components/sheet-sync/header";
import { InventoryDashboard } from "@/components/sheet-sync/inventory-dashboard";
import type { InventoryItem } from "@/types";
import { AddItemDialog } from "@/components/sheet-sync/add-item-dialog";
import { PageHeader } from "@/components/sheet-sync/page-header";

export default async function Home() {
  const inventoryItems: InventoryItem[] = await getInventory();

  return (
    <>
      <Header allItems={inventoryItems} />
      <main className="flex flex-1 flex-col">
        <div className="p-4 md:p-6">
          <PageHeader title="Dashboard" description="A quick overview of your inventory." />
        </div>
        <InventoryDashboard initialItems={inventoryItems} />
      </main>
    </>
  );
}
