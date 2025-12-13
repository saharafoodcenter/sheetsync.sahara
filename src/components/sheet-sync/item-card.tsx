import { useState, useEffect } from "react";
import type { InventoryItem } from "@/types";
import { format } from "date-fns";
import { Calendar, Layers, Trash2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getExpiryStatus, type ExpiryStatus } from "@/lib/utils";
import { cn } from "@/lib/utils";
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
import { deleteItem } from "@/app/actions/inventory";
import { useToast } from "@/hooks/use-toast";

function DeleteAction({ id, name }: { id: string, name: string }) {
  const { toast } = useToast();

  const handleDelete = async () => {
    const result = await deleteItem(id);
    if (result.message.includes("Error")) {
      toast({
        variant: "destructive",
        title: "Error",
        description: result.message,
      });
    } else {
       toast({
        title: "Success",
        description: `"${name}" has been deleted.`,
      });
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive">
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the item "{name}" from your inventory.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <form action={handleDelete}>
             <AlertDialogAction type="submit">Delete</AlertDialogAction>
          </form>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function ItemCard({ item }: { item: InventoryItem }) {
  const [status, setStatus] = useState<ExpiryStatus | null>(null);

  useEffect(() => {
    // getExpiryStatus is now only called on the client after hydration
    setStatus(getExpiryStatus(item.expiryDate, new Date()));
  }, [item.expiryDate]);

  if (!status) {
    return (
        <Card className="flex flex-col transition-shadow hover:shadow-lg">
             <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                    <CardTitle className="text-lg leading-tight">{item.name}</CardTitle>
                    <DeleteAction id={item.id} name={item.name} />
                </div>
            </CardHeader>
            <CardContent className="flex-grow animate-pulse">
                <div className="h-8 w-full rounded-md bg-muted" />
            </CardContent>
            <CardFooter>
                 <p className="text-xs text-muted-foreground">
                    Added on {format(item.addedDate, "MMM d, yyyy")}
                </p>
            </CardFooter>
        </Card>
    );
  }

  return (
    <Card className={cn(
      "flex flex-col transition-shadow hover:shadow-lg",
      status.status === 'expiring' && 'border-warning',
      status.status === 'expired' && 'border-destructive'
    )}>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg leading-tight">{item.name}</CardTitle>
          <DeleteAction id={item.id} name={item.name} />
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <Badge className={cn(
            "w-full justify-center text-center", 
            status.color,
            status.status === 'expiring' && 'animate-pulse'
        )}>
          <Calendar className="mr-2 h-4 w-4" />
          {status.label}
        </Badge>
      </CardContent>
      <CardFooter>
        <p className="text-xs text-muted-foreground">
          Added on {format(item.addedDate, "MMM d, yyyy")}
        </p>
      </CardFooter>
    </Card>
  );
}
