"use client";

import { useEffect, useState, useTransition, useActionState } from "react";
import { Barcode, Loader2, ScanLine } from "lucide-react";
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

type View = "form" | "scanner";

const formSchema = z.object({
  name: z.string().min(1, "Item name is required."),
  expiryDate: z.date({ required_error: "Expiry date is required." }),
});

const barcodeSchema = z.object({
  barcode: z.string().min(1, "Barcode is required."),
});

export function AddItemDialog({ open, onOpenChange }: { open: boolean, onOpenChange: (isOpen: boolean) => void }) {
  const { toast } = useToast();
  const [view, setView] = useState<View>("form");
  const [isFinding, startFinding] = useTransition();

  const [formState, formAction] = useActionState(addItem, {
    message: "",
    errors: {},
    success: false,
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", expiryDate: undefined },
  });

  const barcodeForm = useForm<z.infer<typeof barcodeSchema>>({
    resolver: zodResolver(barcodeSchema),
  });

  useEffect(() => {
    if (formState.success) {
      toast({ title: "Success", description: "Item added to inventory." });
      form.reset();
      onOpenChange(false);
    } else if (formState.message && formState.errors) {
       // Display errors via form message, not toast
    }
  }, [formState, onOpenChange, form, toast]);

  const handleBarcodeScan = barcodeForm.handleSubmit(async (data) => {
    startFinding(async () => {
      const result = await findProductByBarcode(data.barcode);
      if (result.success && result.product) {
        form.setValue("name", result.product.name, { shouldValidate: true });
        toast({ title: "Product Found", description: `Item name set to "${result.product.name}".` });
        setView("form");
        barcodeForm.reset();
      } else {
        barcodeForm.setError("barcode", { type: "manual", message: "Product not found." });
        toast({ variant: 'destructive', title: "Not Found", description: "This barcode does not match any product." });
      }
    });
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
        if (!isOpen) {
            form.reset();
            barcodeForm.reset();
            setView('form');
        }
        onOpenChange(isOpen);
    }}>
      <DialogContent className="sm:max-w-[425px]">
        {view === "form" && (
          <form action={formAction}
            onSubmit={(e) => {
                const formData = new FormData(e.currentTarget);
                form.setValue('expiryDate', new Date(String(formData.get('expiryDate'))));
                form.handleSubmit(() => {
                    e.currentTarget.submit();
                })(e);
            }}
          >
            <DialogHeader>
              <DialogTitle>Add New Item</DialogTitle>
              <DialogDescription>
                Enter item details below. You can also scan a barcode.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Item Name</Label>
                <Input id="name" name="name" {...form.register("name")} />
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
                <Input type="hidden" name="expiryDate" value={form.watch('expiryDate')?.toISOString()} />
                {form.formState.errors.expiryDate && <p className="text-sm text-destructive">{form.formState.errors.expiryDate.message}</p>}
                 {formState.errors?.expiryDate && <p className="text-sm text-destructive">{formState.errors.expiryDate[0]}</p>}
              </div>
            </div>
            <DialogFooter className="sm:justify-between">
              <Button type="button" variant="outline" onClick={() => setView("scanner")}>
                <Barcode className="mr-2 h-4 w-4" />
                Scan Barcode
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add to Inventory
              </Button>
            </DialogFooter>
          </form>
        )}
        {view === "scanner" && (
          <form onSubmit={handleBarcodeScan}>
            <DialogHeader>
              <DialogTitle>Scan Barcode</DialogTitle>
              <DialogDescription>
                Enter the barcode number to look up the product.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="relative">
                <ScanLine className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input {...barcodeForm.register("barcode")} placeholder="e.g. 123456789012" className="pl-10" />
              </div>
              {barcodeForm.formState.errors.barcode && <p className="text-sm text-destructive">{barcodeForm.formState.errors.barcode.message}</p>}
            </div>
            <DialogFooter>
               <Button type="button" variant="ghost" onClick={() => setView("form")}>Cancel</Button>
              <Button type="submit" disabled={isFinding}>
                {isFinding && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Find Product
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
