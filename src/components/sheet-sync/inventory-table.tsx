
"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { format } from "date-fns";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { getExpiryStatus, type ExpiryStatus } from "@/lib/utils";
import type { InventoryItem } from "@/types";
import { cn } from "@/lib/utils";

type ItemWithStatus = InventoryItem & { status: ExpiryStatus };

export function InventoryTable({ items }: { items: InventoryItem[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isClient, setIsClient] = useState(false);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const rowRefs = useRef<Record<string, HTMLTableRowElement | null>>({});

  useEffect(() => {
    setIsClient(true);
    if (typeof window !== "undefined") {
      const hash = window.location.hash.substring(1);
      if (hash) {
        setHighlightedId(hash);
      }
    }
  }, []);

  useEffect(() => {
    if (highlightedId && rowRefs.current[highlightedId]) {
      rowRefs.current[highlightedId]?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
      // Remove the highlight after a few seconds
      const timer = setTimeout(() => setHighlightedId(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [highlightedId]);

  const itemsWithStatus: ItemWithStatus[] = useMemo(() => {
    if (!isClient) return items.map(item => ({ ...item, status: { status: 'fresh', label: 'Loading...', color: '', days: 99 } }));
    const now = new Date();
    return items.map(item => ({
      ...item,
      status: getExpiryStatus(item.expiryDate, now)
    }));
  }, [items, isClient]);

  const filteredItems = itemsWithStatus.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <Input
        placeholder="Search items..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="max-w-sm"
      />
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item Name</TableHead>
              <TableHead>Batch</TableHead>
              <TableHead>Added Date</TableHead>

              <TableHead>Expiry Date</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => {
                const isHighlighted = item.id === highlightedId;
                return (
                  <TableRow 
                    key={item.id}
                    ref={el => rowRefs.current[item.id] = el}
                    className={cn(isHighlighted && 'bg-primary/20 transition-all duration-1000 ease-out')}
                  >
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.batch}</TableCell>
                    <TableCell>
                      {format(item.addedDate, "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                      {format(item.expiryDate, "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={cn(
                          item.status.color,
                          "text-xs"
                        )}
                      >
                        {item.status.label}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
               <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  {isClient ? 'No results found.' : 'Loading inventory...'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
