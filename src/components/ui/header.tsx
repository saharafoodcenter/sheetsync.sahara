
"use client";

import { PanelLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { NotificationsPopover } from "@/components/sheet-sync/notifications-popover";
import type { InventoryItem } from "@/types";
import { useSidebar } from "./sidebar";

export function Header({ allItems }: { allItems: InventoryItem[] }) {
  let sidebar;
  try {
    sidebar = useSidebar();
  } catch (e) {
    sidebar = { isMobile: null, toggleSidebar: null };
  }

  const { isMobile, toggleSidebar } = sidebar;

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
      <div className="flex w-full items-center justify-between">
        {isMobile && toggleSidebar && (
          <Button size="icon" variant="outline" className="sm:hidden" onClick={toggleSidebar}>
            <PanelLeft className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        )}
        <div className="flex-1">
          {/* Future search bar or page title can go here */}
        </div>
        <div className="flex items-center gap-2">
            <NotificationsPopover allItems={allItems} />
        </div>
      </div>
    </header>
  );
}
