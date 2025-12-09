"use client";

import { useEffect, useState, useTransition, useActionState } from "react";
import { Barcode, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";

import { addItem, findProductByBarcode } from "@/app/actions/inventory";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { BarcodeScanner } from "./barcode-scanner";
import type { BarcodeProduct } from "@/types";

const formSchema = z.object({
  barcode: z.string().optional(),
  name: z.string().min(1, "Item name is required."),
  expiryDate: z.string().min(1, "Expiry date is required."),
});

export function AddItemDialog({ open, onOpenChange }: { open: boolean, onOpenChange: (isOpen: boolean) => void }) {
  const { toast } = useToast();
  const [isScannerVisible, setScannerVisible] = useState(false);
  const [isFinding, startFinding] = useTransition();
  const [barcodeValue, setBarcodeValue] = useState("");
  const [foundProduct, setFoundProduct] = useState<BarcodeProduct | null>(null);

  const [formState, formAction] = useActionState(addItem, {
    message: "",
    errors: {},
    success: false,
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", expiryDate: "" },
  });

  const resetDialog = () => {
    form.reset();
    setBarcodeValue("");
    setScannerVisible(false);
    setFoundProduct(null);
  }

  useEffect(() => {
    // Only close the dialog on SUCCESS
    if (formState.success) {
      toast({ title: "Success", description: "Item added to inventory." });
      resetDialog();
      onOpenChange(false);
    } else if (formState.message && formState.errors && Object.keys(formState.errors).length > 0) {
       // Errors are now handled inline, so we don't need to show a toast here.
    }
  }, [formState, onOpenChange, toast]);

  const handleBarcodeLookup = () => {
    if (!barcodeValue) {
        toast({ variant: 'destructive', title: "Error", description: "Please enter or scan a barcode first." });
        return;
    }

    startFinding(async () => {
      const result = await findProductByBarcode(barcodeValue);
      if (result.success && result.product) {
        form.setValue("name", result.product.name, { shouldValidate: true });
        setFoundProduct(result.product);
        toast({ title: "Product Found", description: `Item name set to "${result.product.name}".` });
      } else {
        setFoundProduct(null);
        toast({ variant: 'destructive', title: "Not Found", description: "This barcode does not match any product." });
      }
    });
  }

  const handleScanSuccess = (scannedBarcode: string) => {
    setBarcodeValue(scannedBarcode);
    setScannerVisible(false);
    toast({ title: "Scan Successful", description: `Barcode captured. Click lookup to continue.` });
  }
  
  const today = format(new Date(), 'yyyy-MM-dd');

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
        if (!isOpen) {
            resetDialog();
        }
        onOpenChange(isOpen);
    }}>
      <DialogContent className="sm:max-w-[425px]">
        <form action={formAction}
          onSubmit={form.handleSubmit(data => {
            const formData = new FormData();
            formData.set('name', data.name);
            formData.set('expiryDate', data.expiryDate);
            formAction(formData);
          })}
        >
          <DialogHeader>
            <DialogTitle>Add New Item</DialogTitle>
            <DialogDescription>
              Scan a barcode or enter it manually to begin.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
             <div className="space-y-2">
                <Label htmlFor="barcode">Barcode</Label>
                <div className="flex gap-2 relative">
                    <Input id="barcode" value={barcodeValue} onChange={(e) => setBarcodeValue(e.target.value)} className="pr-10" />
                    <Button type="button" variant="ghost" size="icon" className="absolute right-0 top-0 h-full" onClick={() => setScannerVisible(v => !v)}>
                        <Barcode className="h-4 w-4"/>
                        <span className="sr-only">Scan Barcode</span>
                    </Button>
                </div>
                 <Button type="button" className="w-full gap-2" onClick={handleBarcodeLookup} disabled={isFinding}>
                    {isFinding && <Loader2 className="h-4 w-4 animate-spin"/>}
                    Look up barcode
                </Button>
            </div>

            {isScannerVisible && (
                 <BarcodeScanner
                    onScan={handleScanSuccess}
                />
            )}

            {foundProduct && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="name">Item Name</Label>
                  <Input id="name" {...form.register("name")} readOnly className="bg-muted"/>
                  {formState.errors?.name && <p className="text-sm text-destructive">{formState.errors.name[0]}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expiryDate">Expiry Date</Label>
                   <Input 
                    id="expiryDate" 
                    type="date"
                    min={today}
                    {...form.register("expiryDate")}
                    />
                  {formState.errors?.expiryDate && <p className="text-sm text-destructive">{formState.errors.expiryDate[0]}</p>}
                </div>
              </>
            )}
          </div>

          {foundProduct && (
            <DialogFooter>
                <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add to Inventory
                </Button>
            </DialogFooter>
           )}
        </form>
      </DialogContent>
    </Dialog>
  );
}
