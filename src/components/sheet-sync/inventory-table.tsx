"use client";

import { useState, useEffect, useMemo } from "react";
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

  useEffect(() => {
    setIsClient(true);
  }, []);

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
                return (
                  <TableRow key={item.id}>
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
