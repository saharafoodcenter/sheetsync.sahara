"use client";

import { useEffect, useState, useTransition, useActionState } from "react";
import { Barcode, Loader2, Search } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

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
import { DatePicker } from "../ui/date-picker";
import { BarcodeScanner } from "./barcode-scanner";
import type { BarcodeProduct } from "@/types";

const formSchema = z.object({
  barcode: z.string().min(1, "Please enter a barcode."),
  name: z.string().min(1, "Item name is required."),
  expiryDate: z.date({ required_error: "Expiry date is required." }),
});

export function AddItemDialog({ open, onOpenChange }: { open: boolean, onOpenChange: (isOpen: boolean) => void }) {
  const { toast } = useToast();
  const [isScannerVisible, setScannerVisible] = useState(false);
  const [isFinding, startFinding] = useTransition();
  const [foundProduct, setFoundProduct] = useState<BarcodeProduct | null>(null);

  const [formState, formAction] = useActionState(addItem, {
    message: "",
    errors: {},
    success: false,
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { barcode: "", name: "", expiryDate: undefined },
  });

  const resetDialog = () => {
    form.reset();
    setScannerVisible(false);
    setFoundProduct(null);
  }

  useEffect(() => {
    if (formState.success) {
      toast({ title: "Success", description: "Item added to inventory." });
      resetDialog();
      onOpenChange(false);
    } else if (formState.message && formState.errors && Object.keys(formState.errors).length > 0) {
       // Display errors via form message, not toast
    }
  }, [formState, onOpenChange, form, toast]);

  const handleBarcodeLookup = () => {
    const barcode = form.getValues("barcode");
    if (!barcode) {
        form.setError("barcode", { message: "Please enter or scan a barcode first." });
        return;
    }
    form.clearErrors("barcode");

    startFinding(async () => {
      const result = await findProductByBarcode(barcode);
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
    form.setValue("barcode", scannedBarcode, { shouldValidate: true });
    setScannerVisible(false);
    toast({ title: "Scan Successful", description: `Barcode captured. Click lookup to continue.` });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
        if (!isOpen) {
            resetDialog();
        }
        onOpenChange(isOpen);
    }}>
      <DialogContent className="sm:max-w-[425px]">
        <form action={formAction}
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit(() => {
              const formData = new FormData();
              const values = form.getValues();
              formData.set('name', values.name);
              if (values.expiryDate) {
                formData.set('expiryDate', values.expiryDate.toISOString());
              }
              formAction(formData);
            })(e)
          }}
        >
          <DialogHeader>
            <DialogTitle>Add New Item</DialogTitle>
            <DialogDescription>
              {foundProduct ? "Confirm the details and add the expiry date." : "Scan a barcode or enter it manually to begin."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
             <div className="space-y-2">
                <Label htmlFor="barcode">Barcode</Label>
                <div className="flex gap-2 relative">
                    <Input id="barcode" {...form.register("barcode")} className="pr-10" />
                    <Button type="button" variant="ghost" size="icon" className="absolute right-0 top-0 h-full" onClick={() => setScannerVisible(v => !v)}>
                        <Barcode className="h-4 w-4"/>
                        <span className="sr-only">Scan Barcode</span>
                    </Button>
                </div>
                 {form.formState.errors.barcode && <p className="text-sm text-destructive">{form.formState.errors.barcode.message}</p>}
                 <Button type="button" className="w-full gap-2" onClick={handleBarcodeLookup} disabled={isFinding}>
                    {isFinding ? <Loader2 className="h-4 w-4 animate-spin"/> : <Search className="h-4 w-4"/>}
                    <span>Look up barcode</span>
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
                  <Input id="name" name="name" {...form.register("name")} readOnly className="bg-muted"/>
                  {form.formState.errors.name && <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>}
                  {formState.errors?.name && <p className="text-sm text-destructive">{formState.errors.name[0]}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expiryDate">Expiry Date</Label>
                   <Controller
                      control={form.control}
                      name="expiryDate"
                      render={({ field }) => (
                          <DatePicker
                              value={field.value}
                              onChange={field.onChange}
                              disabled={(date) => date < today}
                          />
                      )}
                  />
                  {form.formState.errors.expiryDate && <p className="text-sm text-destructive">{form.formState.errors.expiryDate.message}</p>}
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
