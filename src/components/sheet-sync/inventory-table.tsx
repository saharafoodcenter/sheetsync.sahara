
"use client";

import { useState, useEffect, useMemo, useRef, useTransition } from "react";
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
import { Loader2, Trash2 } from "lucide-react";
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
import { deleteItem } from "@/app/actions/inventory";
import { useToast } from "@/hooks/use-toast";

type ItemWithStatus = InventoryItem & { status: ExpiryStatus };

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

  useEffect(() => {
    setCurrentItems(items);
  }, [items]);
  
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

  const handleItemDeleted = (id: string) => {
    setCurrentItems(prevItems => prevItems.filter(item => item.id !== id));
  };
  
  const itemsWithStatus: ItemWithStatus[] = useMemo(() => {
    if (!isClient) return currentItems.map(item => ({ ...item, status: { status: 'fresh', label: 'Loading...', color: '', days: 99 } }));
    const now = new Date();
    return currentItems.map(item => ({
      ...item,
      status: getExpiryStatus(item.expiryDate, now)
    }));
  }, [currentItems, isClient]);

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
              <TableHead>Barcode</TableHead>
              <TableHead>Batch</TableHead>
              <TableHead>Expiry Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[50px] text-right">Action</TableHead>
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
                    <TableCell>{item.barcode}</TableCell>
                    <TableCell>{item.batch}</TableCell>
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
                     <TableCell className="text-right">
                       <DeleteAction item={item} onDeleted={handleItemDeleted} />
                    </TableCell>
                  </TableRow>
                );
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
