

"use client";

import React, { useState, useEffect, useMemo, useRef, useTransition } from "react";
import { format, min } from "date-fns";
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
import { ChevronDown, ChevronRight, Loader2, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { deleteItem } from "@/app/actions/inventory";
import { useToast } from "@/hooks/use-toast";

type ItemWithStatus = InventoryItem & { status: ExpiryStatus };

type GroupedItem = {
    name: string;
    barcode: string;
    count: number;
    items: ItemWithStatus[];
    soonestExpiry: Date;
    status: ExpiryStatus;
}

function DeleteAction({ item, onDeleted }: { item: InventoryItem, onDeleted: (id: string) => void }) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteItem(item.id);
      if (result.success) {
        toast({
          title: "Success",
          description: `"${item.name}" has been deleted.`,
        });
        onDeleted(item.id);
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.message,
        });
      }
    });
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" disabled={isPending}>
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> :<Trash2 className="h-4 w-4" />}
          <span className="sr-only">Delete item</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the item "{item.name}" from your inventory.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}


export function InventoryTable({ items }: { items: InventoryItem[] }) {
  const [currentItems, setCurrentItems] = useState(items);
  const [searchTerm, setSearchTerm] = useState("");
  const [isClient, setIsClient] = useState(false);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const rowRefs = useRef<Record<string, HTMLTableRowElement | null>>({});
  const [openCollapsibles, setOpenCollapsibles] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setCurrentItems(items);
  }, [items]);
  
  useEffect(() => {
    setIsClient(true);
    if (typeof window !== "undefined") {
      const hash = window.location.hash.substring(1);
      if (hash) {
        setHighlightedId(hash);
        // Find which group this item belongs to and open it
        const item = items.find(i => i.id === hash);
        if (item) {
            setOpenCollapsibles(prev => ({...prev, [item.barcode]: true}))
        }
      }
    }
  }, [items]);

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

  const handleItemDeleted = (id: string) => {
    setCurrentItems(prevItems => prevItems.filter(item => item.id !== id));
  };

  const groupedItems: GroupedItem[] = useMemo(() => {
    if (!isClient) return [];
    
    const now = new Date();
    const itemsWithStatus = currentItems.map(item => ({
      ...item,
      status: getExpiryStatus(item.expiryDate, now)
    }));
    
    const groups = itemsWithStatus.reduce((acc, item) => {
        acc[item.barcode] = acc[item.barcode] || [];
        acc[item.barcode].push(item);
        return acc;
    }, {} as Record<string, ItemWithStatus[]>);

    return Object.values(groups).map(group => {
        const soonestExpiry = min(group.map(item => item.expiryDate));
        return {
            name: group[0].name,
            barcode: group[0].barcode,
            count: group.length,
            items: group.sort((a,b) => a.expiryDate.getTime() - b.expiryDate.getTime()),
            soonestExpiry: soonestExpiry,
            status: getExpiryStatus(soonestExpiry, now)
        }
    }).sort((a, b) => a.soonestExpiry.getTime() - b.soonestExpiry.getTime());
  }, [currentItems, isClient]);

  const filteredItems = groupedItems.filter((group) =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const toggleCollapsible = (barcode: string) => {
    setOpenCollapsibles(prev => ({...prev, [barcode]: !prev[barcode]}));
  }

  return (
    <div className="space-y-4">
      <Input
        placeholder="Search products..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="max-w-sm"
      />
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]"></TableHead>
              <TableHead>Product Name</TableHead>
              <TableHead>Barcode</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Soonest Expiry</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredItems.length > 0 ? (
              filteredItems.map((group) => {
                const isOpen = openCollapsibles[group.barcode] || false;
                return (
                    <React.Fragment key={group.barcode}>
                        <TableRow className="font-medium">
                            <TableCell>
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toggleCollapsible(group.barcode)}>
                                    {isOpen ? <ChevronDown className="h-4 w-4"/> : <ChevronRight className="h-4 w-4"/>}
                                    <span className="sr-only">Toggle details</span>
                                </Button>
                            </TableCell>
                            <TableCell>{group.name}</TableCell>
                            <TableCell>{group.barcode}</TableCell>
                            <TableCell>{group.count}</TableCell>
                            <TableCell>{format(group.soonestExpiry, "MMM d, yyyy")}</TableCell>
                            <TableCell>
                                <Badge className={cn(group.status.color, "text-xs")}>
                                    {group.status.label}
                                </Badge>
                            </TableCell>
                        </TableRow>
                        {isOpen && (
                           <tr className="bg-muted/50">
                                <TableCell colSpan={6} className="p-0">
                                    <div className="p-4">
                                        <h4 className="font-semibold mb-2">Individual Items ({group.name})</h4>
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Expiry Date</TableHead>
                                                    <TableHead>Batch</TableHead>
                                                    <TableHead>Status</TableHead>
                                                    <TableHead className="w-[50px] text-right">Action</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                            {group.items.map(item => {
                                                const isHighlighted = item.id === highlightedId;
                                                return (
                                                <TableRow 
                                                    key={item.id}
                                                    ref={el => rowRefs.current[item.id] = el}
                                                    className={cn("bg-background", isHighlighted && 'bg-primary/20 transition-all duration-1000 ease-out')}
                                                >
                                                    <TableCell>{format(item.expiryDate, "MMM d, yyyy")}</TableCell>
                                                    <TableCell>{item.batch}</TableCell>
                                                    <TableCell>
                                                        <Badge className={cn(item.status.color, "text-xs")}>
                                                            {item.status.label}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <DeleteAction item={item} onDeleted={handleItemDeleted} />
                                                    </TableCell>
                                                </TableRow>
                                                )
                                            })}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </TableCell>
                            </tr>
                        )}
                    </React.Fragment>
                )
            })
            ) : (
               <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
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
