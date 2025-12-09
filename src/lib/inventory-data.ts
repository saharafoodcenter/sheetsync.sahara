import type { InventoryItem, BarcodeProduct } from '@/types';
import { 
    getInventoryFromSheet, 
    getBarcodesFromSheet,
    addInventoryItemToSheet,
    deleteInventoryItemFromSheet
} from './google-sheets';


export async function getInventoryData(): Promise<InventoryItem[]> {
    return getInventoryFromSheet();
};

export async function addInventoryItem(item: Omit<InventoryItem, 'id' | 'addedDate' | 'batch'> & { batch?: string }): Promise<InventoryItem> {
    return addInventoryItemToSheet(item);
};

export async function deleteInventoryItem(id: string): Promise<{ success: boolean; id: string; }> {
    return deleteInventoryItemFromSheet(id);
};

export async function findProductByBarcode(barcode: string): Promise<BarcodeProduct | undefined> {
    const barcodes = await getBarcodesFromSheet();
    return barcodes.find(p => p.barcode === barcode);
};
