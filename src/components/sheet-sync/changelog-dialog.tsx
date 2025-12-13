
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Rocket } from 'lucide-react';

const changelogs = [
    {
        version: '1.1.0',
        date: 'July 26, 2024',
        title: 'Smarter Inventory Management',
        changes: [
            '**Quantity-Based System:** Instead of adding items one-by-one, you can now add a batch of items with a specific quantity and expiry date in a single action.',
            '**Grouped Inventory View:** The main inventory table now groups products together. You can expand each product to see all the different expiry batches and their respective quantities.',
            '**Actionable Notifications:** Clicking on an item in the expiry alert notification bell now takes you directly to that item in the inventory list and highlights it for you.',
        ],
    }
];

export function ChangelogDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (isOpen: boolean) => void; }) {
    const latestLog = changelogs[0];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <div className="flex justify-center mb-4">
                        <div className="bg-primary/10 text-primary p-3 rounded-full">
                            <Rocket className="h-6 w-6" />
                        </div>
                    </div>
                    <DialogTitle className="text-center text-xl">What's New in SheetSync?</DialogTitle>
                    <DialogDescription className="text-center">
                        We've made some exciting updates to improve your experience.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-6">
                    <div className="space-y-1">
                        <h3 className="font-semibold text-lg">{latestLog.title}</h3>
                        <p className="text-sm text-muted-foreground">Version {latestLog.version} &bull; {latestLog.date}</p>
                    </div>
                    <ul className="space-y-2 text-sm text-foreground list-disc pl-5">
                        {latestLog.changes.map((change, index) => {
                            const parts = change.split('**');
                            return (
                                <li key={index}>
                                    {parts.map((part, i) => 
                                        i % 2 === 1 ? <strong key={i} className="font-semibold">{part}</strong> : part
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                </div>
                <DialogFooter>
                    <Button onClick={() => onOpenChange(false)} className="w-full">
                        Got it, thanks!
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
