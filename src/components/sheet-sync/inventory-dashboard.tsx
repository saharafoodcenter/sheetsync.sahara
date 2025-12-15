
"use client";

import { useState, useMemo, useEffect } from 'react';
import type { InventoryItem } from '@/types';
import { PackageOpen, Package, TriangleAlert, ShieldCheck, ArrowRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../ui/card';
import { getExpiryStatus, type ExpiryStatus } from '@/lib/utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type ItemWithStatus = InventoryItem & { status: ExpiryStatus };

function StatCard({ title, value, icon, description, variant }: { title: string, value: string | number, icon: React.ReactNode, description: string, variant?: 'default' | 'warning' | 'destructive' }) {
  return (
    <Card className={cn(
      variant === 'warning' && 'bg-amber-50 border-amber-200 dark:bg-amber-950 dark:border-amber-800',
      variant === 'destructive' && 'bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800'
    )}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}

export function InventoryDashboard({ initialItems }: { initialItems: InventoryItem[] }) {
  const [items] = useState<InventoryItem[]>(initialItems);
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const stats = useMemo(() => {
    if (!isClient) return { total: 0, expiringSoon: 0, expired: 0 };
    const now = new Date();
    
    let total = 0;
    let expiringSoon = 0;
    let expired = 0;

    items.forEach(item => {
        const status = getExpiryStatus(item.expiryDate, now);
        total += item.quantity;
        if (status.status === 'expiring') {
            expiringSoon += item.quantity;
        } else if (status.status === 'expired') {
            expired += item.quantity;
        }
    });

    return { total, expiringSoon, expired };
  }, [items, isClient]);

  const soonestExpiringItems = useMemo(() => {
    if (!isClient) return [];
    const now = new Date();
    return [...items]
      .map(item => ({...item, status: getExpiryStatus(item.expiryDate, now)}))
      .filter(item => item.status.status !== 'fresh')
      .sort((a, b) => a.status.days - b.status.days)
      .slice(0, 5);
  }, [items, isClient]);

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard title="Total Items" value={isClient ? stats.total : '...'} icon={<Package className="h-4 w-4 text-muted-foreground" />} description="All items currently in stock" />
        <StatCard title="Expiring Soon" value={isClient ? stats.expiringSoon : '...'} icon={<TriangleAlert className="h-4 w-4 text-amber-600 dark:text-amber-400" />} description="Items expiring in the next 30 days" variant="warning" />
        <StatCard title="Expired" value={isClient ? stats.expired : '...'} icon={<ShieldCheck className="h-4 w-4 text-red-600 dark:text-red-400" />} description="Items that have already expired" variant="destructive" />
      </div>

      <Card>
          <CardHeader>
              <CardTitle>Needs Attention</CardTitle>
              <p className="text-sm text-muted-foreground">These batches are expiring soon or have already expired.</p>
          </CardHeader>
          <CardContent>
            {soonestExpiringItems.length > 0 ? (
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Item</TableHead>
                                <TableHead className="hidden sm:table-cell">Expires</TableHead>
                                <TableHead className="text-right">Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {soonestExpiringItems.map((item) => (
                                <TableRow 
                                    key={item.id} 
                                    className="cursor-pointer hover:bg-muted/50"
                                    onClick={() => router.push(`/inventory#${item.id}`)}
                                >
                                    <TableCell className="font-medium">
                                        {item.name} ({item.quantity} pcs)
                                        <div className="text-muted-foreground text-xs sm:hidden">
                                            {format(item.expiryDate, "MMM d, yyyy")}
                                        </div>
                                    </TableCell>
                                    <TableCell className="hidden sm:table-cell">{format(item.expiryDate, "MMM d, yyyy")}</TableCell>
                                    <TableCell className="text-right">
                                        <Badge className={cn(item.status.color, "text-xs")} variant="outline">
                                            {item.status.label}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
                  <PackageOpen className="h-16 w-16 text-muted-foreground/50" />
                  <p className="text-muted-foreground">{isClient ? "No items are expiring soon. Great job!" : "Loading..."}</p>
              </div>
            )}
          </CardContent>
           {items.length > 5 && (
            <CardFooter className="justify-end border-t pt-4">
                <Button asChild variant="ghost" size="sm">
                    <Link href="/inventory">
                        View All Inventory
                        <ArrowRight className="ml-2 h-4 w-4"/>
                    </Link>
                </Button>
            </CardFooter>
           )}
      </Card>
    </div>
  );
}
