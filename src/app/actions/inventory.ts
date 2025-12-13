
"use server";

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import {
  addInventoryItem,
  deleteInventoryItem,
  findProductByBarcode as findProduct,
  getInventoryData,
  addNewProduct as addProduct,
} from '@/lib/inventory-data';
import { InventoryItem, BarcodeProduct } from '@/types';

const itemSchema = z.object({
  name: z.string().min(1, 'Item name is required.'),
  barcode: z.string().min(1, 'Barcode is required.'),
  expiryDate: z.coerce.date({
    required_error: 'Expiry date is required.',
  }),
  quantity: z.coerce.number().min(1, 'Quantity must be at least 1.'),
});

const productSchema = z.object({
    name: z.string().min(1, 'Product name is required.'),
    barcode: z.string().min(1, 'Barcode is required.'),
});

export async function getInventory(): Promise<InventoryItem[]> {
  const items: InventoryItem[] = (await getInventoryData()).map(item => ({
    ...item,
    expiryDate: new Date(item.expiryDate),
    addedDate: new Date(item.addedDate)
  }));
  return items.sort((a, b) => a.expiryDate.getTime() - b.expiryDate.getTime());
}

export async function addItem(prevState: any, formData: FormData) {
  const validatedFields = itemSchema.safeParse({
    name: formData.get('name'),
    barcode: formData.get('barcode'),
    expiryDate: formData.get('expiryDate'),
    quantity: formData.get('quantity'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Failed to add item.',
      success: false,
    };
  }
  
  const today = new Date();
  today.setHours(0,0,0,0);
  if (validatedFields.data.expiryDate < today) {
    return {
        errors: { expiryDate: ["Expiry date cannot be in the past."] },
        message: 'Failed to add item.',
        success: false,
    }
  }

  try {
    const { name, barcode, expiryDate, quantity } = validatedFields.data;
    // Add an item for each quantity
    for (let i = 0; i < quantity; i++) {
        await addInventoryItem({ name, barcode, expiryDate });
    }
    revalidatePath('/');
    revalidatePath('/inventory');
    return { message: `${quantity} item(s) added successfully.`, errors: {}, success: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Database Error: Failed to add item.';
    return { message, errors: {}, success: false };
  }
}

export async function deleteItem(id: string) {
  try {
    if (!id) throw new Error("ID is required");
    await deleteInventoryItem(id);
    revalidatePath('/');
    revalidatePath('/inventory');
    return { message: 'Item deleted.', success: true };
  } catch (e) {
     const message = e instanceof Error ? e.message : 'Database Error: Failed to delete item.';
    return { message, success: false };
  }
}

export async function findProductByBarcode(barcode: string) {
    try {
        const product = await findProduct(barcode);
        if (product) {
            return { success: true, product };
        }
        return { success: false, message: 'Product not found.' };
    } catch (e) {
       const message = e instanceof Error ? e.message : 'An error occurred.';
        return { success: false, message };
    }
}

export async function addNewProduct(prevState: any, formData: FormData) {
  const validatedFields = productSchema.safeParse({
    name: formData.get('name'),
    barcode: formData.get('barcode'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Failed to create product.',
      success: false,
    };
  }

  try {
    const newProduct = await addProduct(validatedFields.data);
    return { message: 'Product created successfully.', errors: {}, success: true, product: newProduct };
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Database Error: Failed to create product.';
    return { message, errors: {}, success: false };
  }
}
