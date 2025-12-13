
import { google } from "googleapis";
import type { InventoryItem, BarcodeProduct } from "@/types";
import { format } from "date-fns";

const serviceAccountEmail = process.env.GCP_SA_EMAIL;
const serviceAccountPrivateKey = process.env.GCP_SA_PRIVATE_KEY?.replace(/\\n/g, '\n');
const sheetId = process.env.SHEET_ID;

const INVENTORY_SHEET_NAME = 'Inventory';
const BARCODES_SHEET_NAME = 'database';


const auth = new google.auth.GoogleAuth({
    credentials: {
        client_email: serviceAccountEmail,
        private_key: serviceAccountPrivateKey,
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

function sheetRowToInventoryItem(row: any[]): InventoryItem | null {
    if (!row[0]) return null; // Skip empty rows
    return {
        id: row[0],
        name: row[1],
        expiryDate: new Date(row[2]),
        addedDate: new Date(row[3]),
        barcode: row[4],
    };
}


export async function getInventoryFromSheet(): Promise<InventoryItem[]> {
    try {
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: sheetId,
            range: `${INVENTORY_SHEET_NAME}!A2:E`,
        });

        const rows = response.data.values;
        if (rows) {
            return rows.map(sheetRowToInventoryItem).filter((item): item is InventoryItem => item !== null);
        }
        return [];
    } catch (error) {
        console.error('Error fetching inventory from Google Sheet:', error);
        throw new Error('Could not connect to the database sheet.');
    }
}

export async function getBarcodesFromSheet(): Promise<BarcodeProduct[]> {
     try {
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: sheetId,
            range: `${BARCODES_SHEET_NAME}!A1:B`,
        });

        const rows = response.data.values;
        if (rows) {
            return rows.map(row => ({
                barcode: row[0],
                name: row[1],
            })).filter(p => p.barcode && p.name);
        }
        return [];
    } catch (error) {
        console.error('Error fetching barcodes from Google Sheet:', error);
        throw new Error('Could not connect to the database sheet.');
    }
}

export async function addProductToSheet(product: BarcodeProduct): Promise<BarcodeProduct> {
    const newRow = [
        product.barcode,
        product.name,
    ];

    try {
        await sheets.spreadsheets.values.append({
            spreadsheetId: sheetId,
            range: `${BARCODES_SHEET_NAME}!A:B`,
            valueInputOption: 'USER_ENTERED',
            insertDataOption: 'INSERT_ROWS',
            requestBody: {
                values: [newRow],
            },
        });
        return product;
    } catch (error) {
        console.error('Error adding product to Google Sheet:', error);
        throw new Error('Could not add product to the database sheet.');
    }
}

export async function addInventoryItemToSheet(item: Omit<InventoryItem, 'id' | 'addedDate'>): Promise<InventoryItem> {
    const newItem: InventoryItem = {
        ...item,
        id: crypto.randomUUID(),
        addedDate: new Date(),
    };

    const newRow = [
        newItem.id,
        newItem.name,
        format(newItem.expiryDate, "yyyy-MM-dd"),
        format(newItem.addedDate, "yyyy-MM-dd"),
        newItem.barcode,
    ];

    try {
        await sheets.spreadsheets.values.append({
            spreadsheetId: sheetId,
            range: `${INVENTORY_SHEET_NAME}!A:E`,
            valueInputOption: 'USER_ENTERED',
            insertDataOption: 'INSERT_ROWS',
            requestBody: {
                values: [newRow],
            },
        });
        return newItem;
    } catch (error) {
        console.error('Error adding item to Google Sheet:', error);
        throw new Error('Could not add item to the database sheet.');
    }
}

export async function deleteInventoryItemFromSheet(id: string): Promise<{ success: boolean; id: string; }> {
     try {
        const sheetResponse = await sheets.spreadsheets.get({ spreadsheetId: sheetId });
        const sheetInfo = sheetResponse.data.sheets?.find(s => s.properties?.title === INVENTORY_SHEET_NAME);
        const sheetGid = sheetInfo?.properties?.sheetId;

        if (sheetGid === undefined) {
             throw new Error(`Could not find sheet with name '${INVENTORY_SHEET_NAME}' to get its ID.`);
        }
        
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: sheetId,
            range: `${INVENTORY_SHEET_NAME}!A1:A`, 
        });

        const rows = response.data.values;
        if (!rows) {
            throw new Error(`Sheet '${INVENTORY_SHEET_NAME}' is empty or could not be read.`);
        }
        
        const rowIndex = rows.findIndex(row => row[0] === id);
        
        if (rowIndex === -1) {
             throw new Error(`Item with id ${id} not found in the sheet.`);
        }

        await sheets.spreadsheets.batchUpdate({
            spreadsheetId: sheetId,
            requestBody: {
                requests: [{
                    deleteDimension: {
                        range: {
                            sheetId: sheetGid,
                            dimension: 'ROWS',
                            startIndex: rowIndex,
                            endIndex: rowIndex + 1,
                        }
                    }
                }]
            }
        });
        
        return { success: true, id };
    } catch (error) {
        console.error('Error deleting item from Google Sheet:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        throw new Error(`Could not delete item from the sheet: ${errorMessage}`);
    }
}
