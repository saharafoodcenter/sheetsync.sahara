import type { InventoryItem, BarcodeProduct } from '@/types';

class Database {
  inventory: InventoryItem[];
  barcodes: BarcodeProduct[];

  constructor() {
    this.inventory = [
      {
        id: '1',
        name: 'Organic Milk',
        expiryDate: new Date(new Date().setDate(new Date().getDate() + 5)),
        addedDate: new Date(),
        batch: 'B001',
      },
      {
        id: '2',
        name: 'Sourdough Bread',
        expiryDate: new Date(new Date().setDate(new Date().getDate() - 2)),
        addedDate: new Date(new Date().setDate(new Date().getDate() - 5)),
        batch: 'B002',
      },
      {
        id: '3',
        name: 'Cheddar Cheese',
        expiryDate: new Date(new Date().setDate(new Date().getDate() + 25)),
        addedDate: new Date(),
        batch: 'B003',
      },
      {
        id: '4',
        name: 'Greek Yogurt',
        expiryDate: new Date(new Date().setDate(new Date().getDate() + 1)),
        addedDate: new Date(),
        batch: 'B004',
      },
    ];

    this.barcodes = [
      { barcode: '123456789012', name: 'Organic Milk' },
      { barcode: '234567890123', name: 'Sourdough Bread' },
      { barcode: '345678901234', name: 'Cheddar Cheese' },
      { barcode: '456789012345', name: 'Greek Yogurt' },
      { barcode: '567890123456', name: 'Free-Range Eggs' },
      { barcode: '678901234567', name: 'Apple Juice' },
    ];
  }
}

const globalForDb = globalThis as unknown as {
  db: Database | undefined;
};

const db = globalForDb.db ?? new Database();

if (process.env.NODE_ENV !== 'production') globalForDb.db = db;

export const getInventoryData = () => db.inventory;

export const addInventoryItem = (item: Omit<InventoryItem, 'id' | 'batch' | 'addedDate'>) => {
    const newItem: InventoryItem = {
        ...item,
        id: crypto.randomUUID(),
        batch: `B${String(Math.floor(Math.random() * 900) + 100).padStart(3, '0')}`,
        addedDate: new Date(),
    };
    db.inventory.unshift(newItem);
    return newItem;
};

export const deleteInventoryItem = (id: string) => {
    db.inventory = db.inventory.filter(item => item.id !== id);
    return { success: true, id };
};

export const findProductByBarcode = (barcode: string) => {
    return db.barcodes.find(p => p.barcode === barcode);
};
