
"use client";

import { useState } from "react";
import { PlusCircle } from "lucide-react";
import { PageHeader } from "@/components/sheet-sync/page-header";
import { Button } from "@/components/ui/button";
import { AddItemDialog } from "@/components/sheet-sync/add-item-dialog";

export function DashboardHeader() {
    const [isAddOpen, setIsAddOpen] = useState(false);

    return (
        <>
            <div className="p-4 md:p-6">
                <PageHeader title="Dashboard" description="A quick overview of your inventory.">
                    <Button onClick={() => setIsAddOpen(true)} className="gap-2">
                        <PlusCircle className="h-5 w-5" />
                        <span className="hidden sm:inline">Add Item</span>
                    </Button>
                </PageHeader>
            </div>
            <AddItemDialog open={isAddOpen} onOpenChange={setIsAddOpen} />
        </>
    );
}
