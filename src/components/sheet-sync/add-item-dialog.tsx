
"use client";

import { useEffect, useState, useTransition, useActionState, useRef } from "react";
import { Barcode, Loader2, PlusCircle } from "lucide-react";
import { format } from "date-fns";
import { useFormStatus } from "react-dom";

import { addItem, findProductByBarcode, addNewProduct } from "@/app/actions/inventory";
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
import { Separator } from "../ui/separator";

function SubmitAddItemButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      Add to Inventory
    </Button>
  );
}

function SubmitCreateProductButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending} className="w-full">
            {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Product
        </Button>
    )
}

export function AddItemDialog({ open, onOpenChange }: { open: boolean, onOpenChange: (isOpen: boolean) => void }) {
  const { toast } = useToast();
  const [isScannerVisible, setScannerVisible] = useState(false);
  const [isFinding, startFinding] = useTransition();
  const [barcodeValue, setBarcodeValue] = useState("");
  const [foundProduct, setFoundProduct] = useState<BarcodeProduct | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const addFormRef = useRef<HTMLFormElement>(null);
  const createFormRef = useRef<HTMLFormElement>(null);

  const [addItemState, addItemAction, isAddPending] = useActionState(addItem, {
    message: "",
    errors: {},
    success: false,
  });

  const [createProductState, createProductAction] = useActionState(addNewProduct, {
      message: "",
      errors: {},
      success: false,
  });

  const resetDialog = () => {
    setBarcodeValue("");
    setScannerVisible(false);
    setFoundProduct(null);
    setShowCreateForm(false);
    addFormRef.current?.reset();
    createFormRef.current?.reset();
  }

  useEffect(() => {
    if (addItemState.success) {
      toast({ title: "Success", description: addItemState.message });
      resetDialog();
      onOpenChange(false);
    } else if (addItemState.message && !addItemState.success && addItemState.errors && Object.keys(addItemState.errors).length === 0) {
        toast({ variant: 'destructive', title: "Error", description: addItemState.message });
    }
  }, [addItemState, onOpenChange, toast]);

    useEffect(() => {
    if (createProductState.success && createProductState.product) {
      toast({ title: "Product Created", description: `"${createProductState.product.name}" has been added to your database.` });
      setFoundProduct(createProductState.product);
      setShowCreateForm(false);
    } else if (createProductState.message && !createProductState.success) {
        toast({ variant: 'destructive', title: "Error", description: createProductState.message });
    }
  }, [createProductState, toast]);

  const handleBarcodeLookup = () => {
    if (!barcodeValue) {
        toast({ variant: 'destructive', title: "Error", description: "Please enter or scan a barcode first." });
        return;
    }
    setFoundProduct(null);
    setShowCreateForm(false);

    startFinding(async () => {
      const result = await findProductByBarcode(barcodeValue);
      if (result.success && result.product) {
        setFoundProduct(result.product);
      } else {
        setShowCreateForm(true);
        toast({ variant: 'destructive', title: "Not Found", description: "This barcode does not match any product. You can create a new one below." });
      }
    });
  }

  const handleScanSuccess = (scannedBarcode: string) => {
    setBarcodeValue(scannedBarcode);
    setScannerVisible(false);
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
          <DialogHeader>
            <DialogTitle>Add New Item</DialogTitle>
            <DialogDescription>
              Scan a barcode or enter it manually to begin.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 pt-4">
             <div className="space-y-2">
                <Label htmlFor="barcode-input">Barcode</Label>
                <div className="flex gap-2 relative">
                    <Input id="barcode-input" name="barcode" value={barcodeValue} onChange={(e) => setBarcodeValue(e.target.value)} className="pr-10" />
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
            </div>

            {showCreateForm && (
                <form action={createProductAction} ref={createFormRef} className="space-y-4 pt-4 border-t">
                     <input type="hidden" name="barcode" value={barcodeValue} />
                     <div className="space-y-2">
                        <Label htmlFor="new-product-name">New Product Name</Label>
                        <p className="text-sm text-muted-foreground">Add a new product for barcode: <code className="bg-muted px-1 py-0.5 rounded">{barcodeValue}</code></p>
                        <Input id="new-product-name" name="name" placeholder="e.g. Organic Milk 1L" />
                        {createProductState.errors?.name && <p className="text-sm text-destructive">{createProductState.errors.name[0]}</p>}
                     </div>
                     <SubmitCreateProductButton />
                </form>
            )}

            {foundProduct && (
                <form action={addItemAction} ref={addFormRef} className="space-y-4 pt-4 border-t">
                    <input type="hidden" name="name" value={foundProduct.name} />
                     <input type="hidden" name="barcode" value={foundProduct.barcode} />
                    <div className="space-y-2">
                        <Label>Item Name</Label>
                        <Input defaultValue={foundProduct.name} readOnly className="bg-muted"/>
                        {addItemState.errors?.name && <p className="text-sm text-destructive">{addItemState.errors.name[0]}</p>}
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="quantity">Quantity</Label>
                            <Input 
                                id="quantity" 
                                name="quantity"
                                type="number"
                                defaultValue="1"
                                min="1"
                            />
                            {addItemState.errors?.quantity && <p className="text-sm text-destructive">{addItemState.errors.quantity[0]}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="expiryDate">Expiry Date</Label>
                            <Input 
                                id="expiryDate" 
                                name="expiryDate"
                                type="date"
                                min={today}
                            />
                            {addItemState.errors?.expiryDate && <p className="text-sm text-destructive">{addItemState.errors.expiryDate[0]}</p>}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={isAddPending}>
                          {isAddPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Add to Inventory
                        </Button>
                    </DialogFooter>
                </form>
            )}
      </DialogContent>
    </Dialog>
  );
}
