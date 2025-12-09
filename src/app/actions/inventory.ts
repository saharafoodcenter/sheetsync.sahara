"use server";

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import {
  addInventoryItem,
  deleteInventoryItem,
  findProductByBarcode as findProduct,
  getInventoryData,
} from '@/lib/inventory-data';
import { InventoryItem } from '@/types';

const itemSchema = z.object({
  name: z.string().min(1, 'Item name is required.'),
  expiryDate: z.coerce.date({
    required_error: 'Expiry date is required.',
  }),
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
    expiryDate: formData.get('expiryDate'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Failed to add item.',
    };
  }
  
  const today = new Date();
  today.setHours(0,0,0,0);
  if (validatedFields.data.expiryDate < today) {
    return {
        errors: { expiryDate: ["Expiry date cannot be in the past."] },
        message: 'Failed to add item.',
    }
  }


  try {
    await addInventoryItem(validatedFields.data);
    revalidatePath('/');
    revalidatePath('/inventory');
    return { message: 'Item added successfully.', errors: {}, success: true };
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
    return { message: 'Item deleted.' };
  } catch (e) {
     const message = e instanceof Error ? e.message : 'Database Error: Failed to delete item.';
    return { message };
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
