export interface InventoryItem {
  id: string;
  name: string;
  expiryDate: Date;
  addedDate: Date;
  batch: string;
}

export interface BarcodeProduct {
  barcode: string;
  name: string;
}
