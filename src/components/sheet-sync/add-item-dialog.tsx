"use client";

import { useEffect, useState, useTransition, useActionState } from "react";
import { Barcode, Loader2 } from "lucide-react";
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

  const resetDialog = () => {
    setBarcodeValue("");
    setScannerVisible(false);
    setFoundProduct(null);
  }

  useEffect(() => {
    if (formState.success) {
      toast({ title: "Success", description: "Item added to inventory." });
      resetDialog();
      onOpenChange(false);
    }
  }, [formState.success, onOpenChange, toast]);

  const handleBarcodeLookup = () => {
    if (!barcodeValue) {
        toast({ variant: 'destructive', title: "Error", description: "Please enter or scan a barcode first." });
        return;
    }

    startFinding(async () => {
      const result = await findProductByBarcode(barcodeValue);
      if (result.success && result.product) {
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
        <form
          action={formAction}
          className="space-y-4"
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
                <input type="hidden" name="name" value={foundProduct.name} />
                <div className="space-y-2">
                  <Label>Item Name</Label>
                  <Input defaultValue={foundProduct.name} readOnly className="bg-muted"/>
                  {formState.errors?.name && <p className="text-sm text-destructive">{formState.errors.name[0]}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expiryDate">Expiry Date</Label>
                   <Input 
                    id="expiryDate" 
                    name="expiryDate"
                    type="date"
                    min={today}
                    />
                  {formState.errors?.expiryDate && <p className="text-sm text-destructive">{formState.errors.expiryDate[0]}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="batch">Batch Number (Optional)</Label>
                  <Input 
                    id="batch" 
                    name="batch"
                    type="text"
                    placeholder="e.g. B123"
                  />
                   {formState.errors?.batch && <p className="text-sm text-destructive">{formState.errors.batch[0]}</p>}
                </div>
              </>
            )}
          </div>

          {foundProduct && (
            <DialogFooter>
                <Button type="submit">
                  Add to Inventory
                </Button>
            </DialogFooter>
           )}
        </form>
      </DialogContent>
    </Dialog>
  );
}
