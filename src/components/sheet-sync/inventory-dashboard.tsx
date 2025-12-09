
"use client";

import { useState, useMemo, useEffect } from 'react';
import type { InventoryItem } from '@/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PackageOpen, Package, TriangleAlert, ShieldCheck, ArrowRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../ui/card';
import { getExpiryStatus, type ExpiryStatus } from '@/lib/utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import Link from 'next/link';

type ItemWithStatus = InventoryItem & { status: ExpiryStatus };

type SortOption = 'expiry-asc' | 'expiry-desc' | 'name-asc' | 'name-desc' | 'added-desc';

function StatCard({ title, value, icon, description }: { title: string, value: string | number, icon: React.ReactNode, description: string }) {
  return (
    <Card>
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

  useEffect(() => {
    setIsClient(true);
  }, []);

  const stats = useMemo(() => {
    if (!isClient) return { expiringSoon: 0, expired: 0 };
    const now = new Date();
    const statuses = items.map(item => getExpiryStatus(item.expiryDate, now));
    return {
      expiringSoon: statuses.filter(s => s.status === 'expiring').length,
      expired: statuses.filter(s => s.status === 'expired').length,
    }
  }, [items, isClient]);

  const soonestExpiringItems = useMemo(() => {
    if (!isClient) return [];
    const now = new Date();
    return [...items]
      .map(item => ({...item, status: getExpiryStatus(item.expiryDate, now)}))
      .sort((a, b) => a.status.days - b.status.days)
      .slice(0, 5);
  }, [items, isClient]);

  return (
    <div className="flex flex-col gap-8">
       <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">A quick overview of your inventory.</p>
       </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard title="Total Items" value={items.length} icon={<Package className="h-4 w-4 text-muted-foreground" />} description="All items currently in stock" />
        <StatCard title="Expiring Soon" value={isClient ? stats.expiringSoon : '...'} icon={<TriangleAlert className="h-4 w-4 text-muted-foreground" />} description="Items expiring in the next 7 days" />
        <StatCard title="Expired" value={isClient ? stats.expired : '...'} icon={<ShieldCheck className="h-4 w-4 text-muted-foreground" />} description="Items that have already expired" />
      </div>

      <Card>
          <CardHeader>
              <CardTitle>Expiring Soon</CardTitle>
              <p className="text-sm text-muted-foreground">These items are nearing their expiry date.</p>
          </CardHeader>
          <CardContent>
            {soonestExpiringItems.length > 0 ? (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Item</TableHead>
                            <TableHead>Expires</TableHead>
                            <TableHead className="text-right">Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {soonestExpiringItems.map((item) => (
                             <TableRow key={item.id}>
                                <TableCell className="font-medium">{item.name}</TableCell>
                                <TableCell>{format(item.expiryDate, "MMM d, yyyy")}</TableCell>
                                <TableCell className="text-right">
                                     <Badge className={cn(item.status.color, "text-xs")}>
                                        {item.status.label}
                                    </Badge>
                                </TableCell>
                             </TableRow>
                        ))}
                    </TableBody>
                </Table>
            ) : (
                <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
                  <PackageOpen className="h-16 w-16 text-muted-foreground" />
                  <p className="text-muted-foreground">{isClient ? "No items are expiring soon. Great job!" : "Loading..."}</p>
              </div>
            )}
          </CardContent>
           {items.length > 0 && (
            <CardFooter className="justify-end">
                <Button asChild variant="ghost" size="sm">
                    <Link href="/inventory">
                        View All
                        <ArrowRight className="ml-2 h-4 w-4"/>
                    </Link>
                </Button>
            </CardFooter>
           )}
      </Card>
    </div>
  );
}
