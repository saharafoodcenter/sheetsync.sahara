
import ProtectedRoute from "@/components/auth/protected-route";
import { getInventory } from "@/app/actions/inventory";
import { Header } from "@/components/sheet-sync/header";
import { InventoryDashboard } from "@/components/sheet-sync/inventory-dashboard";
import type { InventoryItem } from "@/types";
import { DashboardHeader } from "@/components/sheet-sync/dashboard-header";

export default async function Home() {
  const inventoryItems: InventoryItem[] = await getInventory();

  return (
    <ProtectedRoute>
      <div className='flex min-h-screen w-full flex-col'>
        <Header allItems={inventoryItems} />
        <main className="flex flex-1 flex-col">
          <DashboardHeader />
          <InventoryDashboard initialItems={inventoryItems} />
        </main>
      </div>
    </ProtectedRoute>
  );
}
