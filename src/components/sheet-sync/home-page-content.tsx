
"use client";

import { useInventory } from "@/context/inventory-context";
import { Loader2 } from "lucide-react";
import { DashboardHeader } from "@/components/sheet-sync/dashboard-header";
import { InventoryDashboard } from "@/components/sheet-sync/inventory-dashboard";

export default function HomePageContent() {
    const { items, loading } = useInventory();

    return (
        <main className="flex flex-1 flex-col">
            <DashboardHeader />
            {loading ? (
                <div className="flex flex-1 items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : (
                <InventoryDashboard initialItems={items} />
            )}
        </main>
    );
}
