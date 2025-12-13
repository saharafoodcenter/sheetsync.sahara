export interface InventoryItem {
  id: string;
  name: string;
  expiryDate: Date;
  addedDate: Date;
  barcode: string;
  quantity: number;
}

export interface BarcodeProduct {
  barcode: string;
  name: string;
}
