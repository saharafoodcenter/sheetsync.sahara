
"use client";

import { useState, useEffect } from "react";
import { PlusCircle } from "lucide-react";
import { PageHeader } from "@/components/sheet-sync/page-header";
import { Button } from "@/components/ui/button";
import { AddItemDialog } from "@/components/sheet-sync/add-item-dialog";
import { ChangelogDialog } from "./changelog-dialog";

const APP_VERSION = '1.1.0';
const LAST_VIEWED_VERSION_KEY = 'sheet-sync-last-viewed-version';

export function DashboardHeader() {
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [showChangelog, setShowChangelog] = useState(false);

    useEffect(() => {
        const lastViewedVersion = localStorage.getItem(LAST_VIEWED_VERSION_KEY);
        if (lastViewedVersion !== APP_VERSION) {
            setShowChangelog(true);
        }
    }, []);

    const handleChangelogClose = () => {
        setShowChangelog(false);
        localStorage.setItem(LAST_VIEWED_VERSION_KEY, APP_VERSION);
    };

    return (
        <>
            <div className="p-4 md:p-6">
                <PageHeader title="Dashboard" description="A quick overview of your inventory.">
                    <Button onClick={() => setIsAddOpen(true)} className="gap-2">
                        <PlusCircle className="h-5 w-5" />
                        <span className="hidden sm:inline">Add Item</span>
                    </Button>
                </PageHeader>
            </div>
            <AddItemDialog open={isAddOpen} onOpenChange={setIsAddOpen} />
            <ChangelogDialog open={showChangelog} onOpenChange={handleChangelogClose} />
        </>
    );
}
