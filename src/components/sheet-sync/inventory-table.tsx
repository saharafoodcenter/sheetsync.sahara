
"use client";

import React, { useState, useEffect, useMemo, useRef, useTransition } from "react";
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
import { ChevronDown, ChevronRight, Loader2, PlusCircle, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { deleteItem } from "@/app/actions/inventory";
import { useToast } from "@/hooks/use-toast";
import { AddItemDialog } from "./add-item-dialog";
import { usePathname } from "next/navigation";

type ItemWithStatus = InventoryItem & { status: ExpiryStatus };

type GroupedItem = {
    name: string;
    barcode: string;
    totalQuantity: number;
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
          description: `Batch of "${item.name}" has been deleted.`,
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
          <span className="sr-only">Delete item batch</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the batch of {item.quantity} pc(s) of "{item.name}" expiring on {format(item.expiryDate, "MMM d, yyyy")}.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={isPending} className="bg-destructive hover:bg-destructive/90">
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
  const rowRefs = useRef<Record<string, HTMLElement | null>>({});
  const [openCollapsibles, setOpenCollapsibles] = useState<Record<string, boolean>>({});
  const [isAddOpen, setIsAddOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setCurrentItems(items);
  }, [items]);
  
  useEffect(() => {
    setIsClient(true);
    const hash = window.location.hash.substring(1);
    if (hash) {
      setHighlightedId(hash);
      const item = items.find(i => i.id === hash);
      if (item) {
          setOpenCollapsibles(prev => ({...prev, [item.barcode]: true}))
      }
    }
  }, [items, pathname]); // Re-check hash on page navigation

  useEffect(() => {
    if (highlightedId && rowRefs.current[highlightedId]) {
      rowRefs.current[highlightedId]?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
      // Remove highlight after animation
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
        const soonestExpiry = group.reduce((soonest, item) => item.expiryDate < soonest ? item.expiryDate : soonest, group[0].expiryDate);
        const totalQuantity = group.reduce((sum, item) => sum + item.quantity, 0);
        return {
            name: group[0].name,
            barcode: group[0].barcode,
            totalQuantity,
            items: group.sort((a,b) => a.expiryDate.getTime() - b.expiryDate.getTime()),
            soonestExpiry: soonestExpiry,
            status: getExpiryStatus(soonestExpiry, now)
        }
    }).sort((a, b) => a.soonestExpiry.getTime() - b.soonestExpiry.getTime());
  }, [currentItems, isClient]);

  const filteredItems = groupedItems.filter((group) =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase()) || group.barcode.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const toggleCollapsible = (barcode: string) => {
    setOpenCollapsibles(prev => ({...prev, [barcode]: !prev[barcode]}));
  }

  return (
    <>
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Input
          placeholder="Search products or barcodes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Button onClick={() => setIsAddOpen(true)} className="gap-2 ml-auto">
          <PlusCircle className="h-5 w-5" />
          <span className="hidden sm:inline">Add Item</span>
        </Button>
      </div>
      
      {/* Desktop Table View */}
      <div className="hidden rounded-lg border sm:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]"></TableHead>
              <TableHead>Product Name</TableHead>
              <TableHead>Barcode</TableHead>
              <TableHead>Total Quantity</TableHead>
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
                        <TableRow className="font-medium bg-card hover:bg-muted/50 cursor-pointer" data-state={isOpen ? 'open' : 'closed'} onClick={() => toggleCollapsible(group.barcode)}>
                            <TableCell>
                               <Button variant="ghost" size="icon" className="h-8 w-8">
                                    {isOpen ? <ChevronDown className="h-4 w-4"/> : <ChevronRight className="h-4 w-4"/>}
                                    <span className="sr-only">Toggle details</span>
                                </Button>
                            </TableCell>
                            <TableCell>{group.name}</TableCell>
                            <TableCell className="font-mono text-muted-foreground">{group.barcode}</TableCell>
                            <TableCell>{group.totalQuantity}</TableCell>
                            <TableCell>{format(group.soonestExpiry, "MMM d, yyyy")}</TableCell>
                            <TableCell>
                                <Badge className={cn(group.status.color, "text-xs")} variant="outline">
                                    {group.status.label}
                                </Badge>
                            </TableCell>
                        </TableRow>
                        {isOpen && (
                           <tr className="bg-muted/30">
                                <TableCell colSpan={6} className="p-0">
                                    <div className="p-4">
                                        <h4 className="font-semibold mb-2 text-sm">Expiry Batches for {group.name}</h4>
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="hover:bg-transparent">
                                                    <TableHead>Expiry Date</TableHead>
                                                    <TableHead>Quantity</TableHead>
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
                                                    className={cn("bg-card hover:bg-card", isHighlighted && 'bg-primary/10 transition-colors duration-1000 ease-out')}
                                                >
                                                    <TableCell>{format(item.expiryDate, "MMM d, yyyy")}</TableCell>
                                                    <TableCell>{item.quantity}</TableCell>
                                                    <TableCell>
                                                        <Badge className={cn(item.status.color, "text-xs")} variant="outline">
                                                            {item.status.label}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
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

      {/* Mobile Card View */}
      <div className="sm:hidden space-y-4">
        {filteredItems.length > 0 ? (
            filteredItems.map(group => (
                <Collapsible key={group.barcode} open={openCollapsibles[group.barcode]} onOpenChange={(isOpen) => setOpenCollapsibles(prev => ({...prev, [group.barcode]: isOpen}))}>
                    <Card>
                        <CardHeader className="p-4 flex flex-row items-start justify-between">
                            <div>
                                <CardTitle className="text-base">{group.name}</CardTitle>
                                <p className="font-mono text-sm text-muted-foreground">{group.barcode}</p>
                            </div>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                             <div className="flex justify-between items-center text-sm">
                                <div className="text-muted-foreground">Total Quantity: <span className="font-medium text-foreground">{group.totalQuantity}</span></div>
                                 <Badge className={cn(group.status.color, "text-xs")} variant="outline">
                                    {group.status.label}
                                </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">Soonest Expiry: <span className="font-medium text-foreground">{format(group.soonestExpiry, "MMM d, yyyy")}</span></p>
                        </CardContent>
                        <CardFooter className="p-4 pt-0">
                            <CollapsibleTrigger asChild>
                                <Button variant="ghost" className="w-full justify-center gap-2">
                                    <span>{openCollapsibles[group.barcode] ? 'Hide' : 'Show'} Expiry Batches</span>
                                    {openCollapsibles[group.barcode] ? <ChevronDown className="h-4 w-4"/> : <ChevronRight className="h-4 w-4"/>}
                                </Button>
                            </CollapsibleTrigger>
                        </CardFooter>
                        <CollapsibleContent>
                            <div className="p-4 border-t">
                                <h4 className="font-semibold mb-2 text-sm">Expiry Batches</h4>
                                <div className="space-y-2">
                                {group.items.map(item => {
                                  const isHighlighted = item.id === highlightedId;
                                  return (
                                    <div 
                                        key={item.id} 
                                        ref={el => rowRefs.current[item.id] = el}
                                        className={cn(
                                            "flex justify-between items-center p-2 rounded-md", 
                                            isHighlighted && 'bg-primary/10 transition-colors duration-1000 ease-out'
                                        )}
                                    >
                                        <div>
                                            <p className="text-sm">Expires: {format(item.expiryDate, "MMM d, yyyy")}</p>
                                            <p className="text-sm font-medium">Quantity: {item.quantity}</p>
                                            <Badge className={cn("mt-1", item.status.color, "text-xs")} variant="outline">
                                                {item.status.label}
                                            </Badge>
                                        </div>
                                        <DeleteAction item={item} onDeleted={handleItemDeleted} />
                                    </div>
                                  )
                                })}
                                </div>
                            </div>
                        </CollapsibleContent>
                    </Card>
                </Collapsible>
            ))
        ) : (
            <div className="text-center py-12 text-muted-foreground">
                {isClient ? 'No results found.' : 'Loading inventory...'}
            </div>
        )}
      </div>

    </div>
    <AddItemDialog open={isAddOpen} onOpenChange={setIsAddOpen} />
    </>
  );
}
