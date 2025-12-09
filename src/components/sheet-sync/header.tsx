"use client";

import { PlusCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { AddItemDialog } from "@/components/sheet-sync/add-item-dialog";
import { NotificationsPopover } from "@/components/sheet-sync/notifications-popover";
import type { InventoryItem } from "@/types";
import { useState } from "react";
import { SidebarTrigger } from "../ui/sidebar";
import { useSidebar } from "../ui/sidebar";

export function Header({ allItems }: { allItems: InventoryItem[] }) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const { isMobile } = useSidebar();


  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm md:px-6">
        {isMobile && <SidebarTrigger />}
        <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
          <div className="ml-auto flex-1 sm:flex-initial">
            {/* Future search bar can go here */}
          </div>
          <NotificationsPopover allItems={allItems} />
          <Button onClick={() => setIsAddOpen(true)} className="gap-2">
            <PlusCircle className="h-5 w-5" />
            <span className="hidden sm:inline">Add Item</span>
          </Button>
        </div>
      </header>
      <AddItemDialog open={isAddOpen} onOpenChange={setIsAddOpen} />
    </>
  );
}
