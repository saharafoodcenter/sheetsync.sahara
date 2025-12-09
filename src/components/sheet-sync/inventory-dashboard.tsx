"use client";

import { useState, useMemo } from 'react';
import type { InventoryItem } from '@/types';
import { ItemCard } from './item-card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PackageOpen } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';

type SortOption = 'expiry-asc' | 'expiry-desc' | 'name-asc' | 'name-desc' | 'added-desc';

export function InventoryDashboard({ initialItems }: { initialItems: InventoryItem[] }) {
  const [items] = useState<InventoryItem[]>(initialItems);
  const [sortOption, setSortOption] = useState<SortOption>('expiry-asc');

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
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight">Inventory Overview</h1>
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
  );
}
