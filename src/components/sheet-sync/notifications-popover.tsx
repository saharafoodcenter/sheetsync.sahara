
"use client";

import { Bell, CalendarClock, TriangleAlert } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { format } from 'date-fns';

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import type { InventoryItem } from "@/types";
import { getExpiryStatus, type ExpiryStatus } from "@/lib/utils";
import { cn } from "@/lib/utils";

type ItemWithStatus = InventoryItem & { status: ExpiryStatus };

export function NotificationsPopover({ allItems }: { allItems: InventoryItem[] }) {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

  const expiringItems = useMemo(() => {
    if (!isClient) return [];
    const now = new Date();
    return allItems
      .map(item => ({...item, status: getExpiryStatus(item.expiryDate, now)}))
      .filter(item => item.status.status === 'expiring' || item.status.status === 'expired')
      .sort((a,b) => a.status.days - b.status.days);
  }, [allItems, isClient]);

  const showBadge = isClient && expiringItems.length > 0;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {showBadge && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-xs text-destructive-foreground">
              {expiringItems.length}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Expiry Alerts</h4>
            <p className="text-sm text-muted-foreground">
              Items that need your attention.
            </p>
          </div>
          <Separator />
          {isClient && expiringItems.length > 0 ? (
            <div className="grid gap-3 max-h-72 overflow-y-auto">
              {expiringItems.map((item) => (
                <div key={item.id} className="grid grid-cols-[25px_1fr] items-start gap-3">
                    <span className={cn(
                        "flex h-2 w-2 translate-y-1 rounded-full",
                        item.status.status === 'expired' ? 'bg-destructive' : 'bg-warning'
                    )} />
                    <div className="grid gap-1">
                        <p className="font-semibold leading-tight">{item.name}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            {item.status.status === 'expired' ? <TriangleAlert className="h-4 w-4 text-destructive" /> : <CalendarClock className="h-4 w-4 text-warning" />}
                            <span>{item.status.label} on {format(item.expiryDate, "MMM d")}</span>
                        </div>
                    </div>
                </div>
              ))}
            </div>
          ) : (
             <p className="text-sm text-muted-foreground text-center py-4">{isClient ? "No expiry alerts. Good job!" : "Loading alerts..."}</p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
