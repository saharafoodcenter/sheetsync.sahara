
"use client";

import { Bell, CalendarClock, TriangleAlert } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { format } from 'date-fns';
import Link from "next/link";

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
import { useInventory } from "@/context/inventory-context";
import { Loader2 } from "lucide-react";

type ItemWithStatus = InventoryItem & { status: ExpiryStatus };
const VIEWED_NOTIFICATIONS_KEY = 'sheet-sync-viewed-notifications';


export function NotificationsPopover() {
    const { items, loading } = useInventory();
    const [viewedItems, setViewedItems] = useState<string[]>([]);

    useEffect(() => {
        const storedViewedItems = localStorage.getItem(VIEWED_NOTIFICATIONS_KEY);
        if (storedViewedItems) {
            setViewedItems(JSON.parse(storedViewedItems));
        }
    }, []);

    const handleMarkAsViewed = (itemId: string) => {
        const newViewedItems = [...viewedItems, itemId];
        setViewedItems(newViewedItems);
        localStorage.setItem(VIEWED_NOTIFICATIONS_KEY, JSON.stringify(newViewedItems));
    };

    const expiringItems = useMemo(() => {
        if (loading) return [];
        const now = new Date();
        return items
          .map(item => ({...item, status: getExpiryStatus(item.expiryDate, now)}))
          .filter(item => {
              const isExpiringOrExpired = item.status.days <= 10;
              const hasBeenViewed = viewedItems.includes(item.id);
              return isExpiringOrExpired && !hasBeenViewed;
          })
          .sort((a,b) => a.status.days - b.status.days);
    }, [items, loading, viewedItems]);
  
  if (loading) {
      return (
         <Button variant="outline" size="icon" className="relative" disabled>
            <Loader2 className="h-4 w-4 animate-spin" />
         </Button>
      )
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {expiringItems.length > 0 && (
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
          {expiringItems.length > 0 ? (
              <div className="grid gap-1 max-h-72 overflow-y-auto">
                {expiringItems.map((item) => (
                  <Link
                    key={item.id}
                    href={`/inventory#${item.id}`}
                    onClick={() => handleMarkAsViewed(item.id)}
                    className="grid grid-cols-[25px_1fr] items-start gap-3 rounded-md p-2 hover:bg-accent hover:text-accent-foreground"
                  >
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
                  </Link>
                ))}
              </div>
            ) : (
               <p className="text-sm text-muted-foreground text-center py-4">No new expiry alerts. Good job!</p>
            )
          }
        </div>
      </PopoverContent>
    </Popover>
  );
}
