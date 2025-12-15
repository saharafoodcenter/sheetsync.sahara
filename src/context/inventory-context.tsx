
"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { getInventory } from '@/app/actions/inventory';
import type { InventoryItem } from '@/types';

interface InventoryContextType {
  items: InventoryItem[];
  loading: boolean;
  refetch: () => Promise<void>;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export const InventoryProvider = ({ children }: { children: React.ReactNode }) => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const inventoryItems = await getInventory();
      setItems(inventoryItems);
    } catch (error) {
      console.error("Failed to fetch inventory:", error);
      // Optionally, handle the error in the UI
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const value = {
    items,
    loading,
    refetch: fetchInventory,
  };

  return <InventoryContext.Provider value={value}>{children}</InventoryContext.Provider>;
};

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (context === undefined) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
};
