
"use client";

import { Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import { NotificationsPopover } from "@/components/sheet-sync/notifications-popover";
import { useSidebar } from "../ui/sidebar";

export function Header() {
  const { isMobile, toggleSidebar } = useSidebar();

  return (
    <header className="sticky top-0 z-30 flex h-14 w-full items-center gap-4 border-b bg-background px-4 sm:px-6">
        <div className="flex w-full items-center justify-between">
            {isMobile && (
            <Button size="icon" variant="outline" onClick={toggleSidebar}>
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
                </Button>
            )}
            <div className="flex flex-1 items-center justify-end gap-2">
                <NotificationsPopover />
            </div>
        </div>
    </header>
  );
}

