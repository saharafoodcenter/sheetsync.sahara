"use client";

import { PlusCircle, PanelLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { AddItemDialog } from "@/components/sheet-sync/add-item-dialog";
import { NotificationsPopover } from "@/components/sheet-sync/notifications-popover";
import type { InventoryItem } from "@/types";
import { useState } from "react";
import { useSidebar } from "../ui/sidebar";

export function Header({ allItems }: { allItems: InventoryItem[] }) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const { isMobile, toggleSidebar } = useSidebar();


  return (
    <>
      <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
        {isMobile && (
           <Button size="icon" variant="outline" className="sm:hidden" onClick={toggleSidebar}>
              <PanelLeft className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
        )}
        <div className="relative ml-auto flex-1 md:grow-0">
           {/* Future search bar can go here */}
        </div>
        <NotificationsPopover allItems={allItems} />
        <Button onClick={() => setIsAddOpen(true)} className="gap-2">
          <PlusCircle className="h-5 w-5" />
          <span className="hidden sm:inline">Add Item</span>
        </Button>
      </header>
      <AddItemDialog open={isAddOpen} onOpenChange={setIsAddOpen} />
    </>
  );
}
