
"use client";

import { Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import { NotificationsPopover } from "@/components/sheet-sync/notifications-popover";
import { useSidebar } from "../ui/sidebar";

export function Header() {
  let sidebar;
  try {
    sidebar = useSidebar();
  } catch (e) {
    sidebar = { isMobile: null, toggleSidebar: null };
  }

  const { isMobile, toggleSidebar } = sidebar;

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
        <div className="flex w-full items-center gap-4">
            {isMobile && toggleSidebar && (
            <Button size="icon" variant="outline" className="sm:hidden" onClick={toggleSidebar}>
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
                </Button>
            )}
            <div className="relative ml-auto flex-1 md:grow-0">
            {/* Future search bar can go here */}
            </div>
            <div className="flex items-center gap-2">
                <NotificationsPopover />
            </div>
        </div>
    </header>
  );
}
