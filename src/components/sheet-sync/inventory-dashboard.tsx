"use client";

import { useState, useMemo, useEffect } from 'react';
import type { InventoryItem } from '@/types';
import { ItemCard } from './item-card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PackageOpen, Package, TriangleAlert, ShieldCheck } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { getExpiryStatus } from '@/lib/utils';

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
  const [sortOption, setSortOption] = useState<SortOption>('expiry-asc');
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

  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      switch (sortOption) {
        case 'expiry-desc':
          return b.expiryDate.getTime() - a.expiryDate.getTime();
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'added-desc':
          return b.addedDate.getTime() - a.addedDate.getTime();
        case 'expiry-asc':
        default:
          return a.expiryDate.getTime() - b.expiryDate.getTime();
      }
    });
  }, [items, sortOption]);

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

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-2xl font-bold tracking-tight">Inventory Items</h2>
          <div className="w-[180px]">
            <Select value={sortOption} onValueChange={(value) => setSortOption(value as SortOption)}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="expiry-asc">Expiry Date (Soonest)</SelectItem>
                <SelectItem value="expiry-desc">Expiry Date (Latest)</SelectItem>
                <SelectItem value="added-desc">Date Added (Newest)</SelectItem>
                <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                <SelectItem value="name-desc">Name (Z-A)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        {sortedItems.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {sortedItems.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <Card className="sm:col-span-2 md:col-span-3 lg:col-span-4 xl:col-span-5">
              <CardHeader>
                  <CardTitle>No Items in Inventory</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center gap-4 py-12 text-center">
                  <PackageOpen className="h-16 w-16 text-muted-foreground" />
                  <p className="text-muted-foreground">Your inventory is empty. Click "Add Item" to get started.</p>
              </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
